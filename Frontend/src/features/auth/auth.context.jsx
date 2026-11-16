import { createContext, useEffect, useState } from "react";
import { getMe } from "./services/auth.api";


export const AuthContext = createContext()


export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Ask the server who is logged in once, when the app starts (not once per component)
    useEffect(() => {
        let cancelled = false

        const loadUser = async () => {
            try {
                const data = await getMe()
                if (!cancelled) setUser(data?.user ?? null)
            } catch {
                // not logged in
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadUser()
        return () => { cancelled = true }
    }, [])

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }} >
            {children}
        </AuthContext.Provider>
    )

}
