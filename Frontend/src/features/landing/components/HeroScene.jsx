import { useEffect, useRef } from "react"
import * as THREE from "three"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useTheme } from "../../theme/theme.context"

gsap.registerPlugin(ScrollTrigger)

const vertex = /* glsl */ `
    uniform float uTime;
    uniform float uPixel;
    attribute float aSeed;
    varying float vMix;
    void main() {
        vec3 p = position;
        float n = sin(p.x * 2.1 + uTime * 0.9) + sin(p.y * 2.7 + uTime * 0.7) + sin(p.z * 2.3 + uTime * 1.1);
        p += normalize(position) * n * 0.085;
        vMix = 0.5 + 0.5 * sin(aSeed * 6.2831 + uTime * 0.6);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (1.3 + aSeed * 1.9) * uPixel * (5.2 / -mv.z);
        gl_Position = projectionMatrix * mv;
    }
`

const fragment = /* glsl */ `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform float uAlpha;
    varying float vMix;
    void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float soft = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(mix(uColorA, uColorB, vMix), soft * uAlpha);
    }
`

const palette = {
    dark: { a: "#8f73ff", b: "#22e1ff", ring: "#ff4d97", alpha: 0.85, blending: THREE.AdditiveBlending },
    light: { a: "#6b46ff", b: "#ff3d8b", ring: "#0aa6c9", alpha: 0.9, blending: THREE.NormalBlending }
}

// Fibonacci sphere: evenly spread points on a sphere
const sphereGeometry = (count, radius) => {
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2
        const r = Math.sqrt(1 - y * y)
        const t = golden * i
        pos.set([ Math.cos(t) * r * radius, y * radius, Math.sin(t) * r * radius ], i * 3)
        seed[i] = Math.random()
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1))
    return geo
}

const HeroScene = () => {
    const mountRef = useRef(null)
    const themeRef = useRef(null)
    const { theme } = useTheme()

    useEffect(() => {
        const mount = mountRef.current
        if (!mount) return

        let renderer
        try {
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" })
        } catch {
            return // no WebGL: the page still works without the orb
        }

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 50)
        camera.position.set(0, 0, 5.2)

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        mount.appendChild(renderer.domElement)
        renderer.domElement.style.cssText = "width:100%;height:100%;display:block"

        const group = new THREE.Group()
        scene.add(group)

        // the orb: a living cloud of points
        const orbMat = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            transparent: true,
            depthWrite: false,
            uniforms: {
                uTime: { value: 0 },
                uPixel: { value: renderer.getPixelRatio() },
                uColorA: { value: new THREE.Color() },
                uColorB: { value: new THREE.Color() },
                uAlpha: { value: 1 }
            }
        })
        const orb = new THREE.Points(sphereGeometry(window.innerWidth < 700 ? 1800 : 3600, 1.55), orbMat)
        group.add(orb)

        // inner wireframe core
        const coreMat = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.16 })
        const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 2), coreMat)
        group.add(core)

        // orbiting rings
        const ringMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.55 })
        const rings = [ 2.15, 2.6 ].map((r, i) => {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 8, 160), ringMat)
            ring.rotation.set(Math.PI / 2.4 + i * 0.6, i * 0.9, 0)
            group.add(ring)
            return ring
        })

        // distant dust
        const dustCount = 500
        const dustPos = new Float32Array(dustCount * 3)
        for (let i = 0; i < dustCount; i++) {
            dustPos.set([ (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8 - 1 ], i * 3)
        }
        const dustGeo = new THREE.BufferGeometry()
        dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3))
        const dustMat = new THREE.PointsMaterial({ size: 0.022, transparent: true, opacity: 0.6, depthWrite: false })
        const dust = new THREE.Points(dustGeo, dustMat)
        scene.add(dust)

        const applyTheme = (name) => {
            const p = palette[name]
            orbMat.uniforms.uColorA.value.set(p.a)
            orbMat.uniforms.uColorB.value.set(p.b)
            orbMat.uniforms.uAlpha.value = p.alpha
            orbMat.blending = p.blending
            coreMat.color.set(p.b)
            ringMat.color.set(p.ring)
            dustMat.color.set(p.a)
            dustMat.blending = p.blending
            orbMat.needsUpdate = dustMat.needsUpdate = true
        }
        applyTheme(document.documentElement.classList.contains("dark") ? "dark" : "light")
        themeRef.current = applyTheme

        // size to the container
        const resize = () => {
            const { clientWidth: w, clientHeight: h } = mount
            if (!w || !h) return
            renderer.setSize(w, h, false)
            camera.aspect = w / h
            // shift the orb to the right on wide screens so the headline stays clear
            group.position.x = w > 900 ? 2.1 : 0
            group.position.y = w > 900 ? 0 : 1.0
            group.scale.setScalar(w > 900 ? 0.95 : 0.8)
            camera.updateProjectionMatrix()
        }
        const ro = new ResizeObserver(resize)
        ro.observe(mount)
        resize()

        // pointer parallax + scroll-driven rotation
        const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
        const onMove = (e) => {
            pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2
            pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2
        }
        window.addEventListener("pointermove", onMove, { passive: true })

        const scrollState = { p: 0 }
        const st = ScrollTrigger.create({
            trigger: mount,
            start: "top top",
            end: "bottom top",
            scrub: true,
            onUpdate: (self) => { scrollState.p = self.progress }
        })

        // entrance: the orb grows in once
        if (!reduceMotion) {
            gsap.from(orb.scale, { x: 0.2, y: 0.2, z: 0.2, duration: 1.8, ease: "expo.out" })
            gsap.from(orbMat.uniforms.uAlpha, { value: 0, duration: 1.6, ease: "power2.out" })
        }

        // only render while visible
        let visible = true
        const io = new IntersectionObserver(([ entry ]) => { visible = entry.isIntersecting })
        io.observe(mount)

        const clock = new THREE.Clock()
        let raf
        const frame = () => {
            raf = requestAnimationFrame(frame)
            if (!visible) return
            const t = clock.getElapsedTime()
            orbMat.uniforms.uTime.value = reduceMotion ? 0 : t
            pointer.x += (pointer.tx - pointer.x) * 0.05
            pointer.y += (pointer.ty - pointer.y) * 0.05

            if (!reduceMotion) {
                group.rotation.y = t * 0.12 + pointer.x * 0.5 + scrollState.p * 2.2
                group.rotation.x = pointer.y * 0.28 + scrollState.p * 0.8
                core.rotation.y = -t * 0.2
                rings[ 0 ].rotation.z = t * 0.25
                rings[ 1 ].rotation.z = -t * 0.18
                dust.rotation.y = t * 0.012
            }
            camera.position.z = 5.2 + scrollState.p * 1.6
            renderer.render(scene, camera)
        }
        frame()

        return () => {
            cancelAnimationFrame(raf)
            ro.disconnect()
            io.disconnect()
            st.kill()
            window.removeEventListener("pointermove", onMove)
            gsap.killTweensOf([ orb.scale, orbMat.uniforms.uAlpha ])
            scene.traverse((o) => {
                if (o.geometry) o.geometry.dispose()
                if (o.material) o.material.dispose()
            })
            renderer.dispose()
            if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
            themeRef.current = null
        }
    }, [])

    // react to the light/dark toggle without rebuilding the scene
    useEffect(() => { if (themeRef.current) themeRef.current(theme) }, [ theme ])

    return <div ref={mountRef} className="absolute inset-0" aria-hidden />
}

export default HeroScene
