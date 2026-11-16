import { useEffect } from "react"
import { Outlet, useLocation } from "react-router"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Background from "./Background"
import SmoothScroll from "./SmoothScroll"
import { lenisRef } from "./lenis"

// Shared shell for every page: backdrop, smooth scrolling and scroll-to-top on navigation.
const RootLayout = () => {
    const { pathname } = useLocation()

    useEffect(() => {
        if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
        else window.scrollTo(0, 0)
        ScrollTrigger.refresh()
    }, [ pathname ])

    return (
        <>
            <Background />
            <SmoothScroll />
            <Outlet />
        </>
    )
}

export default RootLayout
