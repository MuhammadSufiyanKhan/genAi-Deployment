import React, { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import '../landing.scss'

const sampleCards = [
    {
        kind: 'Technical question',
        question: 'Your service slows down under load. How would you find out why?',
        intention: 'They want to see whether you measure before you change anything.',
        answer: 'Start with metrics and traces, narrow it to the slow endpoint, then check database queries and cache hits. Describe one fix and how you would confirm it worked.'
    },
    {
        kind: 'Behavioral question',
        question: 'Tell me about a time you disagreed with a teammate.',
        intention: 'They are checking how you handle conflict without making it personal.',
        answer: 'Pick a real example. State both positions fairly, explain how the decision was made, and say what you would do differently.'
    },
    {
        kind: 'Technical question',
        question: 'What is the difference between a process and a thread?',
        intention: 'They are testing the fundamentals behind the tools listed on your resume.',
        answer: 'Define both in one sentence each, then give a practical example of when you would choose one over the other.'
    }
]

const steps = [
    {
        title: 'Add your resume',
        body: 'Upload a PDF. Add a few lines about yourself if you want the advice to sound like you.'
    },
    {
        title: 'Paste the job description',
        body: 'Use the real posting. The questions and gaps are based on what that role asks for.'
    },
    {
        title: 'Read your strategy',
        body: 'Get the questions, how to answer them, your skill gaps, and a plan you can start today.'
    }
]

const gaps = [
    { skill: 'Kubernetes', level: 'High', width: '85%' },
    { skill: 'GraphQL', level: 'Medium', width: '55%' },
    { skill: 'Terraform', level: 'Low', width: '28%' }
]

const plan = [
    { day: 'Day 1', task: 'Review system design basics and write down two examples from your own work.' },
    { day: 'Day 2', task: 'Build a small GraphQL endpoint so you can talk about it from experience.' },
    { day: 'Day 3', task: 'Practice three behavioral stories out loud, two minutes each.' }
]

const Landing = () => {
    const { user } = useAuth()
    const [ open, setOpen ] = useState(0)

    const primaryTo = user ? '/app' : '/register'
    const primaryLabel = user ? 'Open my reports' : 'Build my strategy'

    return (
        <div className='landing'>
            <header className='landing__nav'>
                <Link to='/' className='landing__brand'>Interview Prep Assistant</Link>
                <nav className='landing__nav-links' aria-label='Account'>
                    {user ? (
                        <Link to='/app' className='landing__link'>My reports</Link>
                    ) : (
                        <>
                            <Link to='/login' className='landing__link'>Log in</Link>
                            <Link to='/register' className='landing__btn landing__btn--small'>Sign up</Link>
                        </>
                    )}
                </nav>
            </header>

            <main>
                <section className='hero'>
                    <div className='hero__copy'>
                        <h1>Walk into the interview knowing what they will ask.</h1>
                        <p className='hero__lead'>
                            Upload your resume and the job description. You get the questions
                            you are likely to face, what each one is really testing, how to
                            answer it, and a day-by-day plan to close your gaps.
                        </p>
                        <div className='hero__actions'>
                            <Link to={primaryTo} className='landing__btn'>{primaryLabel}</Link>
                            <a href='#report' className='landing__link'>See what the report includes</a>
                        </div>
                        <p className='hero__note'>Free to try. Takes about a minute to generate.</p>
                    </div>

                    <div className='hero__cards' aria-label='Example interview questions'>
                        {sampleCards.map((card, i) => {
                            const isOpen = open === i
                            return (
                                <article
                                    key={card.question}
                                    className={`flashcard ${isOpen ? 'flashcard--open' : ''}`}
                                    style={{ '--i': i }}
                                >
                                    <button
                                        type='button'
                                        className='flashcard__head'
                                        aria-expanded={isOpen}
                                        aria-controls={`card-body-${i}`}
                                        onClick={() => setOpen(isOpen ? -1 : i)}
                                    >
                                        <span className='flashcard__kind'>{card.kind}</span>
                                        <span className='flashcard__question'>{card.question}</span>
                                    </button>
                                    <div id={`card-body-${i}`} className='flashcard__body' hidden={!isOpen}>
                                        <p><strong>What they are really asking.</strong> {card.intention}</p>
                                        <p><strong>How to answer.</strong> {card.answer}</p>
                                    </div>
                                </article>
                            )
                        })}
                        <p className='hero__caption'>Example from a backend engineer report. Tap a card to open it.</p>
                    </div>
                </section>

                <section className='steps' aria-labelledby='steps-title'>
                    <h2 id='steps-title'>From resume to plan in three steps</h2>
                    <ol className='steps__list'>
                        {steps.map((step, i) => (
                            <li key={step.title}>
                                <span className='steps__num'>{i + 1}</span>
                                <div>
                                    <h3>{step.title}</h3>
                                    <p>{step.body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                <section id='report' className='report' aria-labelledby='report-title'>
                    <div className='report__intro'>
                        <h2 id='report-title'>One report that tells you where to spend your time</h2>
                        <p>
                            See how well you match the role, which skills are holding you
                            back, and what to do each day before the interview. You can also
                            download a resume tailored to the job.
                        </p>
                    </div>

                    <div className='report__sheet' role='img' aria-label='Example report with a match score of 78, three skill gaps and a three day plan'>
                        <div className='report__score'>
                            <span className='report__score-value'>78</span>
                            <span className='report__score-text'>match with the job description</span>
                        </div>

                        <div className='report__gaps'>
                            <h3>Skill gaps</h3>
                            <ul>
                                {gaps.map((g) => (
                                    <li key={g.skill}>
                                        <span className='report__gap-name'>{g.skill}</span>
                                        <span className='report__bar'><span style={{ width: g.width }} /></span>
                                        <span className='report__gap-level'>{g.level}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className='report__plan'>
                            <h3>Your plan</h3>
                            <ul>
                                {plan.map((p) => (
                                    <li key={p.day}>
                                        <span className='report__day'>{p.day}</span>
                                        <span>{p.task}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section className='closing'>
                    <h2>Your next interview is easier with a plan.</h2>
                    <Link to={primaryTo} className='landing__btn'>{primaryLabel}</Link>
                </section>
            </main>

            <footer className='landing__footer'>
                <span>Interview Prep Assistant</span>
                <span>Reports are generated with AI. Check the answers against your own experience.</span>
            </footer>
        </div>
    )
}

export default Landing
