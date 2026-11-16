import React, { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SiteHeader from '../../ui/SiteHeader'
import HeroScene from '../components/HeroScene'

gsap.registerPlugin(ScrollTrigger)

const headline = [ 'Walk', 'into', 'the', 'interview', 'knowing', 'what', 'they', 'will', 'ask.' ]
const gradientWords = [ 'knowing', 'what', 'they', 'will', 'ask.' ]

const marquee = [
    'Frontend Engineer', 'Product Manager', 'Data Analyst', 'Backend Engineer', 'UX Designer', 'DevOps Engineer',
    'Machine Learning', 'Marketing Lead', 'QA Engineer', 'Mobile Developer', 'Sales Manager', 'Cloud Architect'
]

const cards = [
    {
        kind: 'Technical',
        question: 'Your service slows down under load. How would you find out why?',
        intention: 'They want to see whether you measure before you change anything.',
        answer: 'Start with metrics and traces, narrow it to the slow endpoint, then check database queries and cache hits. Describe one fix and how you would confirm it worked.'
    },
    {
        kind: 'Behavioral',
        question: 'Tell me about a time you disagreed with a teammate.',
        intention: 'They are checking how you handle conflict without making it personal.',
        answer: 'Pick a real example. State both positions fairly, explain how the decision was made, and say what you would do differently.'
    },
    {
        kind: 'Technical',
        question: 'What is the difference between a process and a thread?',
        intention: 'They are testing the fundamentals behind the tools listed on your resume.',
        answer: 'Define both in one sentence each, then give a practical example of when you would choose one over the other.'
    }
]

const steps = [
    { title: 'Add your resume', body: 'Upload a PDF, or just write a few lines about yourself. Both work.' },
    { title: 'Paste the job description', body: 'Use the real posting. Everything in your plan is based on what that role asks for.' },
    { title: 'Read your strategy', body: 'Questions, model answers, skill gaps and a day-by-day plan, ready in about 30 seconds.' }
]

const gaps = [
    { skill: 'Kubernetes', level: 'High', w: 86, color: 'bg-accent-2' },
    { skill: 'GraphQL', level: 'Medium', w: 58, color: 'bg-accent' },
    { skill: 'Terraform', level: 'Low', w: 30, color: 'bg-accent-3' }
]

const closing = 'Your next interview is easier with a plan.'.split(' ')

const ArrowIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)

const Landing = () => {
    const root = useRef(null)
    const [ open, setOpen ] = useState(0)

    useLayoutEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const ctx = gsap.context(() => {
            if (reduce) return

            // 1) hero intro: one orchestrated sequence
            const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
            tl.from('.hero-word', { yPercent: 115, rotate: 4, duration: 1.2, stagger: 0.07 })
                .from('.hero-fade', { y: 24, opacity: 0, duration: 0.9, stagger: 0.12 }, '-=0.7')
                .from('.hero-cue', { opacity: 0, duration: 1 }, '-=0.4')

            // 2) generic reveals as sections scroll in
            gsap.set('[data-reveal]', { opacity: 0, y: 48 })
            ScrollTrigger.batch('[data-reveal]', {
                start: 'top 88%',
                once: true,
                onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' })
            })

            // 3) score ring + bars fill when the report preview appears
            ScrollTrigger.create({
                trigger: '.report-demo',
                start: 'top 75%',
                once: true,
                onEnter: () => {
                    gsap.fromTo('.ring-fill', { strokeDashoffset: 264 }, { strokeDashoffset: 264 * (1 - 0.78), duration: 1.8, ease: 'power3.out' })
                    gsap.fromTo('.score-num', { textContent: 0 }, { textContent: 78, duration: 1.8, ease: 'power3.out', snap: { textContent: 1 } })
                    gsap.fromTo('.gap-bar', { width: 0 }, { width: (i, el) => el.dataset.w + '%', duration: 1.4, stagger: 0.15, ease: 'power3.out' })
                }
            })

            // 4) the line through the steps draws as you scroll
            gsap.fromTo('.steps-line', { scaleY: 0 }, {
                scaleY: 1, ease: 'none', transformOrigin: 'top',
                scrollTrigger: { trigger: '.steps', start: 'top 70%', end: 'bottom 70%', scrub: true }
            })

            // 5) closing statement lights up word by word
            gsap.fromTo('.closing-word', { opacity: 0.14 }, {
                opacity: 1, stagger: 0.1, ease: 'none',
                scrollTrigger: { trigger: '.closing', start: 'top 80%', end: 'center 62%', scrub: true }
            })

            // 6) the marquee speeds up with scroll velocity
            ScrollTrigger.create({
                trigger: root.current,
                start: 'top top',
                end: 'bottom bottom',
                onUpdate: (self) => {
                    const v = Math.min(Math.abs(self.getVelocity()) / 400, 6)
                    gsap.to('.marquee-track', { timeScale: 1 + v, duration: 0.3, overwrite: true })
                }
            })
        }, root)

        return () => ctx.revert()
    }, [])

    return (
        <div ref={root} className='relative overflow-x-clip'>
            <SiteHeader />

            {/* ── Hero ── */}
            <section className='relative flex min-h-[100svh] items-center overflow-hidden px-5 pt-24 pb-20 sm:px-8 -mt-[4.75rem]'>
                <HeroScene />
                <div className='relative mx-auto w-full max-w-6xl'>
                    <p className='hero-fade glass mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-muted'>
                        <span className='h-2 w-2 animate-pulse rounded-full bg-accent-3' />
                        AI interview coach. No sign-up needed.
                    </p>

                    <h1 className='max-w-[16ch] text-[clamp(2.4rem,6.2vw,5.2rem)] leading-[1.02] font-extrabold'>
                        {headline.map((w, i) => (
                            <span key={i} className='mr-[0.22em] inline-block overflow-hidden pb-[0.12em] align-top'>
                                <span className={`hero-word inline-block ${gradientWords.includes(w) ? 'text-gradient' : ''}`}>{w}</span>
                            </span>
                        ))}
                    </h1>

                    <p className='hero-fade mt-7 max-w-xl text-lg leading-relaxed text-muted sm:text-xl'>
                        Upload your resume and the job description. Get the questions you are likely to face, what each one is really testing, how to answer it, and a day-by-day plan to close your gaps.
                    </p>

                    <div className='hero-fade mt-10 flex flex-wrap items-center gap-4'>
                        <Link to='/app' className='btn-primary !px-8 !py-4 text-base'>Build my strategy <ArrowIcon /></Link>
                        <a href='#features' className='btn-ghost !px-7 !py-4'>See what you get</a>
                    </div>
                </div>

                <a href='#features' className='hero-cue absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-semibold text-muted sm:flex' aria-label='Scroll to features'>
                    Scroll
                    <span className='h-9 w-[1.5px] animate-pulse bg-gradient-to-b from-accent to-transparent' />
                </a>
            </section>

            {/* ── Marquee ── */}
            <div className='border-y border-line py-5' aria-hidden>
                <div className='overflow-hidden'>
                    <div className='marquee-track flex w-max animate-marquee gap-4'>
                        {[ ...marquee, ...marquee ].map((m, i) => (
                            <span key={i} className='glass rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap text-muted'>{m}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Features / report preview ── */}
            <section id='features' className='mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32'>
                <h2 data-reveal className='max-w-[18ch] text-[clamp(2rem,5vw,3.6rem)] leading-[1.02] font-extrabold'>
                    One report that shows where to spend your time
                </h2>

                <div className='report-demo mt-14 grid gap-5 md:grid-cols-6'>
                    {/* score */}
                    <div data-reveal className='glass relative overflow-hidden rounded-3xl p-7 md:col-span-2'>
                        <p className='text-sm font-semibold text-muted'>Match with the job</p>
                        <div className='relative mx-auto mt-4 h-44 w-44'>
                            <svg viewBox='0 0 100 100' className='-rotate-90'>
                                <circle cx='50' cy='50' r='42' fill='none' stroke='var(--line)' strokeWidth='8' />
                                <circle className='ring-fill' cx='50' cy='50' r='42' fill='none' stroke='url(#ringGrad)' strokeWidth='8' strokeLinecap='round' strokeDasharray='264' strokeDashoffset='264' />
                                <defs>
                                    <linearGradient id='ringGrad' x1='0' y1='0' x2='1' y2='1'>
                                        <stop offset='0' stopColor='var(--accent-3)' />
                                        <stop offset='1' stopColor='var(--accent-2)' />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className='absolute inset-0 grid place-items-center'>
                                <span className='font-display text-4xl font-extrabold'><span className='score-num'>0</span><span className='text-xl text-muted'>%</span></span>
                            </div>
                        </div>
                        <p className='mt-4 text-center text-sm text-muted'>Example result</p>
                    </div>

                    {/* gaps */}
                    <div data-reveal className='glass rounded-3xl p-7 md:col-span-4'>
                        <h3 className='text-xl font-bold'>Skill gaps, ranked by how much they matter</h3>
                        <ul className='mt-6 grid gap-5'>
                            {gaps.map((g) => (
                                <li key={g.skill} className='grid grid-cols-[6.5rem_1fr_4.5rem] items-center gap-3 text-sm sm:grid-cols-[8rem_1fr_5rem]'>
                                    <span className='font-semibold'>{g.skill}</span>
                                    <span className='h-2.5 overflow-hidden rounded-full bg-line'>
                                        <span className={`gap-bar block h-full rounded-full ${g.color}`} data-w={g.w} style={{ width: 0 }} />
                                    </span>
                                    <span className='text-right text-muted'>{g.level}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* questions */}
                    <div data-reveal className='glass rounded-3xl p-7 md:col-span-3'>
                        <h3 className='text-xl font-bold'>Questions with the reason behind them</h3>
                        <p className='mt-3 text-muted'>Each question comes with what the interviewer wants to learn and a model answer you can adapt.</p>
                        <div className='mt-6 flex flex-wrap gap-2'>
                            {[ 'Technical', 'Behavioral', 'Intent', 'Model answer' ].map((t) => (
                                <span key={t} className='rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted'>{t}</span>
                            ))}
                        </div>
                    </div>

                    {/* plan */}
                    <div data-reveal className='glass rounded-3xl p-7 md:col-span-3'>
                        <h3 className='text-xl font-bold'>A day-by-day plan</h3>
                        <ul className='mt-5 grid gap-3 text-sm'>
                            {[ [ 'Day 1', 'System design basics' ], [ 'Day 2', 'Build a small GraphQL endpoint' ], [ 'Day 3', 'Practice three stories out loud' ] ].map(([ d, t ]) => (
                                <li key={d} className='flex items-center gap-3'>
                                    <span className='rounded-lg bg-accent/15 px-2.5 py-1 font-bold text-accent'>{d}</span>
                                    <span className='text-muted'>{t}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* resume */}
                    <div data-reveal className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-accent-2 p-7 text-white md:col-span-6'>
                        <div className='relative z-10 flex flex-wrap items-center justify-between gap-4'>
                            <div>
                                <h3 className='text-2xl font-bold'>Plus a resume tailored to the job</h3>
                                <p className='mt-2 max-w-xl text-white/85'>Download a clean, ATS-friendly resume rewritten for the role you are applying to.</p>
                            </div>
                            <Link to='/app' className='rounded-full bg-white px-6 py-3 font-bold text-[#12102b] transition-transform hover:-translate-y-0.5'>Try it free</Link>
                        </div>
                        <div aria-hidden className='absolute -right-10 -bottom-16 h-52 w-52 rounded-full bg-white/15 blur-2xl' />
                    </div>
                </div>
            </section>

            {/* ── Interactive flashcards ── */}
            <section className='mx-auto max-w-6xl px-5 pb-24 sm:px-8 sm:pb-32'>
                <div className='grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr]'>
                    <div data-reveal className='lg:sticky lg:top-32'>
                        <h2 className='text-[clamp(2rem,4.6vw,3.3rem)] leading-[1.02] font-extrabold'>Know what they are really asking</h2>
                        <p className='mt-5 max-w-md text-lg text-muted'>Interviewers rarely ask what they mean. Open a card to see the intent behind the question and how to answer it.</p>
                        <p className='mt-4 text-sm text-muted'>Example from a backend engineer report.</p>
                    </div>

                    <div className='grid gap-4'>
                        {cards.map((c, i) => {
                            const isOpen = open === i
                            return (
                                <article key={c.question} data-reveal className={`glass overflow-hidden rounded-3xl transition-all duration-300 ${isOpen ? 'border-accent shadow-[0_20px_60px_-25px_var(--glow)]' : ''}`}>
                                    <button
                                        type='button'
                                        aria-expanded={isOpen}
                                        onClick={() => setOpen(isOpen ? -1 : i)}
                                        className='flex w-full cursor-pointer items-start gap-4 p-6 text-left'
                                    >
                                        <span className='mt-1 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent'>{c.kind}</span>
                                        <span className='flex-1 font-display text-lg leading-snug font-bold sm:text-xl'>{c.question}</span>
                                        <span className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} aria-hidden>
                                            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.6' strokeLinecap='round'><path d='M12 5v14M5 12h14' /></svg>
                                        </span>
                                    </button>
                                    <div className={`grid transition-all duration-500 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className='overflow-hidden'>
                                            <div className='grid gap-4 px-6 pb-6 text-[0.97rem] text-muted'>
                                                <p><strong className='mb-1 block text-fg'>What they are really asking</strong>{c.intention}</p>
                                                <p><strong className='mb-1 block text-fg'>How to answer</strong>{c.answer}</p>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ── Steps ── */}
            <section className='steps mx-auto max-w-4xl px-5 pb-24 sm:px-8 sm:pb-32'>
                <h2 data-reveal className='text-[clamp(2rem,4.6vw,3.3rem)] leading-[1.02] font-extrabold'>From resume to plan in three steps</h2>
                <div className='relative mt-14 pl-12 sm:pl-16'>
                    <span aria-hidden className='absolute top-2 bottom-2 left-[1.1rem] w-px bg-line sm:left-[1.6rem]' />
                    <span aria-hidden className='steps-line absolute top-2 bottom-2 left-[1.1rem] w-px bg-gradient-to-b from-accent via-accent-2 to-accent-3 sm:left-[1.6rem]' style={{ transform: 'scaleY(0)' }} />
                    <ol className='grid gap-12'>
                        {steps.map((s, i) => (
                            <li key={s.title} data-reveal className='relative'>
                                <span className='absolute top-0 -left-12 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 font-display text-sm font-extrabold text-white shadow-lg sm:-left-16 sm:h-12 sm:w-12 sm:text-base'>{i + 1}</span>
                                <h3 className='text-2xl font-bold'>{s.title}</h3>
                                <p className='mt-2 max-w-lg text-muted'>{s.body}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* ── Closing ── */}
            <section className='closing relative mx-auto max-w-6xl px-5 pb-32 text-center sm:px-8'>
                <h2 className='mx-auto max-w-[16ch] text-[clamp(2.3rem,6.4vw,5rem)] leading-[1.02] font-extrabold'>
                    {closing.map((w, i) => (
                        <span key={i} className='closing-word mr-[0.2em] inline-block'>{w}</span>
                    ))}
                </h2>
                <div data-reveal className='mt-10'>
                    <Link to='/app' className='btn-primary !px-9 !py-4 text-base'>Build my strategy <ArrowIcon /></Link>
                </div>
            </section>

            <footer className='border-t border-line px-5 py-8 sm:px-8'>
                <div className='mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-sm text-muted'>
                    <span>Interview Prep Assistant</span>
                    <span>Reports are generated with AI. Check the answers against your own experience.</span>
                </div>
            </footer>
        </div>
    )
}

export default Landing
