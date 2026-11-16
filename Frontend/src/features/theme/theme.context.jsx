import { createContext, useCallback, useContext, useEffect, useState } from "react"

const ThemeContext = createContext({ theme: "dark", toggleTheme: () => { } })

const readInitialTheme = () => {
    if (typeof document === "undefined") return "dark"
    return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

export const ThemeProvider = ({ children }) => {
    const [ theme, setTheme ] = useState(readInitialTheme)

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark")
        try { localStorage.setItem("theme", theme) } catch { /* storage can be blocked */ }
    }, [ theme ])

    const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), [])

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext)
