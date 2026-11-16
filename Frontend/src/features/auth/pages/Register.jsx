import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import AuthShell from '../components/AuthShell'
import Spinner from '../../ui/Spinner'

const Register = () => {

    const navigate = useNavigate()
    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ error, setError ] = useState("")

    const { loading, handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        const result = await handleRegister({ username, email, password })
        if (result?.ok) {
            navigate("/app")
        } else {
            setError(result?.message || "We could not create your account. Try again.")
        }
    }

    return (
        <AuthShell
            title="Create your account"
            subtitle="It takes a few seconds. Your plans will be saved."
            footer={<>Already have an account? <Link to="/login" className="font-semibold text-accent hover:underline">Log in</Link></>}
        >
            <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                    <label htmlFor="username" className="text-sm font-semibold">Username</label>
                    <input className="field" onChange={(e) => setUsername(e.target.value)} value={username}
                        type="text" id="username" name="username" placeholder="Your name" autoComplete="username" required />
                </div>
                <div className="grid gap-2">
                    <label htmlFor="email" className="text-sm font-semibold">Email</label>
                    <input className="field" onChange={(e) => setEmail(e.target.value)} value={email}
                        type="email" id="email" name="email" placeholder="you@example.com" autoComplete="email" required />
                </div>
                <div className="grid gap-2">
                    <label htmlFor="password" className="text-sm font-semibold">Password</label>
                    <input className="field" onChange={(e) => setPassword(e.target.value)} value={password}
                        type="password" id="password" name="password" placeholder="Choose a password" autoComplete="new-password" required />
                </div>

                {error && <p role="alert" className="rounded-xl border border-accent-2/50 bg-accent-2/10 px-4 py-3 text-sm">{error}</p>}

                <button className="btn-primary mt-1 w-full" disabled={loading}>
                    {loading ? <><Spinner /> Creating account</> : "Create account"}
                </button>
            </form>
        </AuthShell>
    )
}

export default Register
