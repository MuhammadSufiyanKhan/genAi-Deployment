import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { useInterview } from '../hooks/useInterview.js'
import { useParams, Link } from 'react-router'
import SiteHeader from '../../ui/SiteHeader'
import GeneratingScreen from '../../ui/GeneratingScreen'
import Spinner from '../../ui/Spinner'

const NAV_ITEMS = [
    { id: 'technical', label: 'Technical questions', icon: <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" /> },
    { id: 'behavioral', label: 'Behavioral questions', icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /> },
    { id: 'roadmap', label: 'Road map', icon: <path d="M3 11l19-9-9 19-2-8-8-2z" /> },
]

const severityStyle = {
    high: 'border-accent-2/60 bg-accent-2/15 text-accent-2',
    medium: 'border-accent/60 bg-accent/15 text-accent',
    low: 'border-accent-3/60 bg-accent-3/15 text-accent-3',
}

const Icon = ({ children }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
)

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [ open, setOpen ] = useState(false)
    return (
        <div className={`glass overflow-hidden rounded-2xl transition-all duration-300 ${open ? 'border-accent shadow-[0_20px_60px_-30px_var(--glow)]' : ''}`}>
            <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex w-full cursor-pointer items-start gap-4 p-5 text-left">
                <span className="mt-0.5 rounded-lg bg-accent/15 px-2.5 py-1 text-xs font-extrabold text-accent">Q{index + 1}</span>
                <p className="flex-1 font-semibold leading-snug">{item.question}</p>
                <span className={`mt-0.5 shrink-0 text-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
                    <Icon><path d="M6 9l6 6 6-6" /></Icon>
                </span>
            </button>
            <div className={`grid transition-all duration-500 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="grid gap-5 px-5 pb-5">
                        <div>
                            <span className="rounded-full bg-accent-3/15 px-3 py-1 text-xs font-bold text-accent-3">Intention</span>
                            <p className="mt-2 text-muted">{item.intention}</p>
                        </div>
                        <div>
                            <span className="rounded-full bg-accent-2/15 px-3 py-1 text-xs font-bold text-accent-2">Model answer</span>
                            <p className="mt-2 text-muted">{item.answer}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const RoadMapDay = ({ day }) => (
    <div className="glass relative rounded-2xl p-5">
        <div className="flex items-center gap-3">
            <span className="rounded-lg bg-gradient-to-br from-accent to-accent-2 px-3 py-1 text-sm font-extrabold text-white">Day {day.day}</span>
            <h3 className="text-lg font-bold">{day.focus}</h3>
        </div>
        <ul className="mt-4 grid gap-2.5">
            {day.tasks.map((task, i) => (
                <li key={i} className="flex gap-3 text-muted">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-3" />
                    {task}
                </li>
            ))}
        </ul>
    </div>
)

const ScoreRing = ({ value }) => {
    const ref = useRef(null)
    const R = 52
    const C = 2 * Math.PI * R

    useLayoutEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const target = C * (1 - value / 100)
        const ctx = gsap.context(() => {
            if (reduce) { gsap.set('.ring', { strokeDashoffset: target }); return }
            gsap.fromTo('.ring', { strokeDashoffset: C }, { strokeDashoffset: target, duration: 1.6, ease: 'power3.out' })
            gsap.fromTo('.num', { textContent: 0 }, { textContent: value, duration: 1.6, ease: 'power3.out', snap: { textContent: 1 } })
        }, ref)
        return () => ctx.revert()
    }, [ value, C ])

    return (
        <div ref={ref} className="relative mx-auto h-44 w-44" role="img" aria-label={`Match score ${value} percent`}>
            <svg viewBox="0 0 120 120" className="-rotate-90">
                <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="var(--accent-3)" />
                        <stop offset="1" stopColor="var(--accent-2)" />
                    </linearGradient>
                </defs>
                <circle cx="60" cy="60" r={R} fill="none" stroke="var(--line)" strokeWidth="9" />
                <circle className="ring" cx="60" cy="60" r={R} fill="none" stroke="url(#scoreGrad)" strokeWidth="9" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C} />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
                <span className="font-display text-4xl font-extrabold"><span className="num">0</span><span className="text-lg text-muted">%</span></span>
            </div>
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [ activeNav, setActiveNav ] = useState('technical')
    const { report, getReportById, loading, getResumePdf } = useInterview()
    const { interviewId } = useParams()

    const [ notFound, setNotFound ] = useState(false)
    const [ downloading, setDownloading ] = useState(false)
    const [ downloadError, setDownloadError ] = useState("")

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId).then((r) => setNotFound(!r))
        }
    }, [ interviewId ])

    const handleDownload = async () => {
        setDownloadError("")
        setDownloading(true)
        const ok = await getResumePdf(interviewId)
        setDownloading(false)
        if (!ok) setDownloadError("We could not create your resume. Try again in a moment.")
    }

    if (notFound) {
        return (
            <>
                <SiteHeader />
                <main className="grid min-h-[60vh] place-items-center px-5 text-center">
                    <div>
                        <h1 className="text-3xl font-extrabold">We could not find this plan.</h1>
                        <p className="mt-3 text-muted">The link may be wrong, or the plan belongs to another account.</p>
                        <Link to="/app" className="btn-primary mt-8">Create a new plan</Link>
                    </div>
                </main>
            </>
        )
    }

    if (loading || !report) {
        return (
            <>
                <SiteHeader />
                <GeneratingScreen title="Loading your interview plan" />
            </>
        )
    }

    const list = activeNav === 'technical' ? report.technicalQuestions : activeNav === 'behavioral' ? report.behavioralQuestions : report.preparationPlan
    const heading = NAV_ITEMS.find((n) => n.id === activeNav).label
    const countLabel = activeNav === 'roadmap' ? `${list.length}-day plan` : `${list.length} questions`
    const verdict = report.matchScore >= 80 ? 'Strong match for this role' : report.matchScore >= 60 ? 'Good match, with a few gaps to close' : 'There are gaps to work on before you apply'

    return (
        <div className="min-h-screen">
            <SiteHeader />

            <main className="mx-auto max-w-6xl px-5 pt-10 pb-24 sm:px-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <Link to="/app" className="text-sm font-semibold text-muted hover:text-fg">&larr; New plan</Link>
                        <h1 className="mt-2 text-[clamp(1.6rem,3.4vw,2.5rem)] leading-tight font-extrabold">{report.title || 'Your interview plan'}</h1>
                    </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)_18rem]">
                    {/* Left nav */}
                    <nav aria-label="Report sections" className="lg:sticky lg:top-28 lg:self-start">
                        <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible">
                            {NAV_ITEMS.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveNav(item.id)}
                                    aria-current={activeNav === item.id ? 'page' : undefined}
                                    className={`flex shrink-0 cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold whitespace-nowrap transition-all duration-300 ${activeNav === item.id ? 'bg-gradient-to-r from-accent to-accent-2 text-white shadow-[0_10px_30px_-12px_var(--glow)]' : 'glass text-muted hover:text-fg'}`}
                                >
                                    <Icon>{item.icon}</Icon>
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <button onClick={handleDownload} disabled={downloading} className="btn-primary mt-4 w-full">
                            {downloading ? (<><Spinner className="h-4 w-4" /> Preparing resume</>) : (<>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 4v12M6 12l6 6 6-6M4 20h16" /></svg>
                                Download resume
                            </>)}
                        </button>
                        {downloading && <p className="mt-2 text-xs text-muted">This can take up to 30 seconds.</p>}
                        {downloadError && <p role="alert" className="mt-2 text-xs text-accent-2">{downloadError}</p>}
                    </nav>

                    {/* Center */}
                    <section aria-labelledby="section-title" className="min-w-0 lg:order-none">
                        <div className="mb-5 flex items-baseline justify-between gap-3">
                            <h2 id="section-title" className="text-2xl font-extrabold">{heading}</h2>
                            <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted">{countLabel}</span>
                        </div>
                        <div key={activeNav} className="grid gap-3">
                            {activeNav === 'roadmap'
                                ? list.map((day) => <RoadMapDay key={day.day} day={day} />)
                                : list.map((q, i) => <QuestionCard key={i} item={q} index={i} />)}
                        </div>
                    </section>

                    {/* Right sidebar */}
                    <aside className="grid content-start gap-4 lg:sticky lg:top-28 lg:self-start">
                        <div className="glass rounded-3xl p-6 text-center">
                            <p className="mb-4 text-sm font-semibold text-muted">Match score</p>
                            <ScoreRing value={report.matchScore} />
                            <p className="mt-4 text-sm text-muted">{verdict}</p>
                        </div>

                        <div className="glass rounded-3xl p-6">
                            <p className="mb-4 text-sm font-semibold text-muted">Skill gaps</p>
                            {report.skillGaps.length === 0 ? (
                                <p className="text-sm text-muted">No major gaps found.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {report.skillGaps.map((gap, i) => (
                                        <span key={i} className={`rounded-full border px-3 py-1 text-xs font-bold ${severityStyle[ gap.severity ] || severityStyle.low}`} title={`${gap.severity} priority`}>
                                            {gap.skill}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <p className="mt-4 text-xs text-muted">Pink is high priority, purple is medium, cyan is low.</p>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}

export default Interview
