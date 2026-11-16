import React, { useState, useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth.js'
import SiteHeader from '../../ui/SiteHeader'
import GeneratingScreen from '../../ui/GeneratingScreen'

const MAX_JD = 5000
const MAX_FILE_MB = 3

const scoreTone = (n) => (n >= 80 ? 'text-success' : n >= 60 ? 'text-accent-2' : 'text-danger')

const Home = () => {

    const { generateReport, reports, deleteReport } = useInterview()
    const [ generating, setGenerating ] = useState(false)
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ uploadedFileName, setUploadedFileName ] = useState("")
    const [ uploadSuccess, setUploadSuccess ] = useState(false)
    const [ dragging, setDragging ] = useState(false)
    const resumeInputRef = useRef()
    const pageRef = useRef(null)

    const navigate = useNavigate()
    const { user } = useAuth()
    const [ error, setError ] = useState("")
    const [ confirmId, setConfirmId ] = useState(null)
    const [ deletingId, setDeletingId ] = useState(null)
    const [ deleteError, setDeleteError ] = useState("")

    useLayoutEffect(() => {
        // the form is not on screen while a plan is generating, so there is nothing to animate
        if (!pageRef.current) return
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const ctx = gsap.context(() => {
            gsap.from('.enter', { y: 36, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'expo.out' })
        }, pageRef)
        return () => ctx.revert()
    }, [ generating ])

    const handleResumeChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
            setError(`That file is larger than ${MAX_FILE_MB}MB. Upload a smaller PDF.`)
            resumeInputRef.current.value = ""
            return
        }
        setError("")
        setUploadedFileName(file.name)
        setUploadSuccess(true)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files?.[ 0 ]
        if (!file) return
        const dt = new DataTransfer()
        dt.items.add(file)
        resumeInputRef.current.files = dt.files
        handleResumeChange({ target: resumeInputRef.current })
    }

    const handleGenerateReport = async () => {
        setError("")
        const resumeFile = resumeInputRef.current.files[ 0 ]
        setGenerating(true)
        const data = await generateReport({ jobDescription, selfDescription, resumeFile })
        setGenerating(false)
        if (!data || data.error) {
            setError(data?.error || "We could not create your plan. Try again.")
            return
        }
        navigate(`/interview/${data._id}`)
    }

    const handleDelete = async (id) => {
        setDeleteError("")
        setDeletingId(id)
        const result = await deleteReport(id)
        setDeletingId(null)
        setConfirmId(null)
        if (!result.ok) setDeleteError(result.message)
    }

    if (generating) {
        return (
            <>
                <SiteHeader />
                <GeneratingScreen
                    title="Building your interview plan"
                    steps={[ 'Reading your resume and the job description', 'Writing questions and model answers', 'Finding your skill gaps', 'Planning your preparation days' ]}
                />
            </>
        )
    }

    const canSubmit = jobDescription.trim().length > 0 && (uploadSuccess || selfDescription.trim().length > 0)

    return (
        <div ref={pageRef} className="min-h-screen">
            <SiteHeader />

            <main className="mx-auto max-w-6xl px-5 pt-12 pb-24 sm:px-8 sm:pt-16">
                <header className="enter max-w-3xl">
                    <h1 className="text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.05] font-extrabold">
                        Create your custom <span className="text-gradient">interview plan</span>
                    </h1>
                    <p className="mt-5 text-lg text-muted">
                        Paste the job description and add your resume or a few lines about yourself. We will build the questions, answers and a plan to get you ready.
                    </p>
                    {!user && (
                        <p className="mt-3 text-sm text-muted">
                            No account needed. <Link to="/login" className="font-semibold text-accent hover:underline">Log in</Link> if you want your plans saved.
                        </p>
                    )}
                </header>

                <div className="enter glass mt-10 overflow-hidden rounded-[2rem] shadow-[0_40px_100px_-50px_var(--glow)]">
                    <div className="grid lg:grid-cols-2">
                        {/* Job description */}
                        <section className="flex flex-col gap-4 p-6 sm:p-8">
                            <div className="flex items-center gap-3">
                                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent" aria-hidden>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                                </span>
                                <h2 className="text-xl font-bold">Target job description</h2>
                                <span className="ml-auto rounded-full bg-accent-2/15 px-3 py-1 text-xs font-bold text-accent-2">Required</span>
                            </div>
                            <label htmlFor="jobDescription" className="sr-only">Job description</label>
                            <textarea
                                id="jobDescription"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="field min-h-72 flex-1 resize-y leading-relaxed"
                                placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer requires React, TypeScript and large-scale system design...'`}
                                maxLength={MAX_JD}
                            />
                            <p className="text-right text-xs text-muted">{jobDescription.length} / {MAX_JD}</p>
                        </section>

                        {/* Profile */}
                        <section className="flex flex-col gap-5 border-t border-line p-6 sm:p-8 lg:border-t-0 lg:border-l">
                            <div className="flex items-center gap-3">
                                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-3/15 text-accent-3" aria-hidden>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </span>
                                <h2 className="text-xl font-bold">Your profile</h2>
                            </div>

                            <div>
                                <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                    Upload resume <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-bold text-accent">Best results</span>
                                </p>
                                <label
                                    htmlFor="resume"
                                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                                    onDragLeave={() => setDragging(false)}
                                    onDrop={handleDrop}
                                    className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-all duration-300 ${uploadSuccess ? 'border-success bg-success/10' : dragging ? 'scale-[1.01] border-accent bg-accent/10' : 'border-line hover:border-accent hover:bg-accent/5'}`}
                                >
                                    {uploadSuccess ? (
                                        <>
                                            <span className="grid h-11 w-11 place-items-center rounded-full bg-success text-on-accent" aria-hidden>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
                                            </span>
                                            <p className="font-semibold break-all">{uploadedFileName}</p>
                                            <p className="text-sm text-muted">Uploaded. Click to choose a different file.</p>
                                        </>
                                    ) : (
                                        <>
                                            <span className="grid h-11 w-11 place-items-center rounded-full bg-accent/15 text-accent" aria-hidden>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M6 10l6-6 6 6M4 20h16" /></svg>
                                            </span>
                                            <p className="font-semibold">Click to upload or drag and drop</p>
                                            <p className="text-sm text-muted">PDF only, up to {MAX_FILE_MB}MB</p>
                                        </>
                                    )}
                                    <input ref={resumeInputRef} onChange={handleResumeChange} hidden type="file" id="resume" name="resume" accept=".pdf,application/pdf" />
                                </label>
                            </div>

                            <div className="flex items-center gap-4 text-xs font-bold text-muted" aria-hidden>
                                <span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" />
                            </div>

                            <div>
                                <label htmlFor="selfDescription" className="mb-2 block text-sm font-semibold">Quick self-description</label>
                                <textarea
                                    id="selfDescription"
                                    value={selfDescription}
                                    onChange={(e) => setSelfDescription(e.target.value)}
                                    className="field min-h-32 resize-y"
                                    placeholder="Briefly describe your experience, key skills and years of experience if you don't have a resume handy..."
                                />
                            </div>
                        </section>
                    </div>

                    {error && (
                        <p role="alert" className="mx-6 mb-2 rounded-xl border border-danger/50 bg-danger/10 px-4 py-3 text-sm sm:mx-8">{error}</p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-6 py-5 sm:px-8">
                        <p className="text-sm text-muted">Add the job description, plus a resume or a short description. Your report has 20+ questions and takes up to a minute to build.</p>
                        <button onClick={handleGenerateReport} disabled={!canSubmit} className="btn-primary !px-8 !py-4">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                            Generate my interview strategy
                        </button>
                    </div>
                </div>

                {/* Recent reports (logged-in users) */}
                {reports.length > 0 && (
                    <section className="enter mt-16">
                        <h2 className="text-2xl font-bold">My recent interview plans</h2>
                        {deleteError && <p role="alert" className="mt-4 rounded-xl border border-danger/50 bg-danger/10 px-4 py-3 text-sm">{deleteError}</p>}
                        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {reports.map((report) => {
                                const confirming = confirmId === report._id
                                const deleting = deletingId === report._id
                                return (
                                    <li key={report._id} className="glass group relative rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-accent">
                                        <button
                                            onClick={() => navigate(`/interview/${report._id}`)}
                                            className="w-full cursor-pointer rounded-2xl p-5 pr-14 text-left"
                                        >
                                            <h3 className="text-lg font-bold">{report.title || 'Untitled position'}</h3>
                                            <p className="mt-1 text-sm text-muted">Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                            <p className={`mt-4 text-sm font-bold ${scoreTone(report.matchScore)}`}>Match score: {report.matchScore}%</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setConfirmId(report._id)}
                                            aria-label={`Delete plan ${report.title || 'Untitled position'}`}
                                            title="Delete this plan"
                                            className="absolute top-4 right-4 grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-line text-muted transition-colors hover:border-danger hover:bg-danger/10 hover:text-danger"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" /></svg>
                                        </button>

                                        {confirming && (
                                            <div role="alertdialog" aria-label="Confirm delete" className="absolute inset-0 grid content-center gap-3 rounded-2xl bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] p-5 text-center backdrop-blur-sm">
                                                <p className="font-bold">Delete this plan?</p>
                                                <p className="text-sm text-muted">This cannot be undone.</p>
                                                <div className="flex justify-center gap-3">
                                                    <button onClick={() => setConfirmId(null)} disabled={deleting} className="btn-ghost !px-5 !py-2 text-sm">Cancel</button>
                                                    <button
                                                        onClick={() => handleDelete(report._id)}
                                                        disabled={deleting}
                                                        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-danger px-5 py-2 text-sm font-bold text-on-accent transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                                                    >
                                                        {deleting ? 'Deleting' : 'Delete'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    </section>
                )}
            </main>
        </div>
    )
}

export default Home
