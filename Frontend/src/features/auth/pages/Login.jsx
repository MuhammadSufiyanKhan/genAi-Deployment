import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import AuthShell from '../components/AuthShell'
import Spinner from '../../ui/Spinner'

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ error, setError ] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        const result = await handleLogin({ email, password })
        if (result?.ok) {
            navigate('/app')
        } else {
            setError(result?.message || "We could not log you in. Try again.")
        }
    }

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Log in to see your saved plans."
            footer={<>Don't have an account? <Link to="/register" className="font-semibold text-accent hover:underline">Register</Link></>}
        >
            <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                    <label htmlFor="email" className="text-sm font-semibold">Email</label>
                    <input className="field" onChange={(e) => setEmail(e.target.value)} value={email}
                        type="email" id="email" name="email" placeholder="you@example.com" autoComplete="email" required />
                </div>
                <div className="grid gap-2">
                    <label htmlFor="password" className="text-sm font-semibold">Password</label>
                    <input className="field" onChange={(e) => setPassword(e.target.value)} value={password}
                        type="password" id="password" name="password" placeholder="Your password" autoComplete="current-password" required />
                </div>

                {error && <p role="alert" className="rounded-xl border border-accent-2/50 bg-accent-2/10 px-4 py-3 text-sm">{error}</p>}

                <button className="btn-primary mt-1 w-full" disabled={loading}>
                    {loading ? <><Spinner /> Logging in</> : "Log in"}
                </button>
            </form>
        </AuthShell>
    )
}

export default Login
