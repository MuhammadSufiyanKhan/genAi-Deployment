import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, deleteInterviewReport, setInterviewReportSaved } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"
import { useAuth } from "../../auth/hooks/useAuth"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()
    const { user } = useAuth()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
            const message = error?.response?.data?.message || "We could not create your plan. Check your connection and try again."
            return { error: message }
        } finally {
            setLoading(false)
        }

        return response.interviewReport
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
            return null
        } finally {
            setLoading(false)
        }
        return response.interviewReport
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.log(error)
            return []
        } finally {
            setLoading(false)
        }

        return response.interviewReports
    }

    const deleteReport = async (interviewId) => {
        try {
            await deleteInterviewReport(interviewId)
            setReports((current) => current.filter((r) => r._id !== interviewId))
            return { ok: true }
        } catch (error) {
            console.log(error)
            return { ok: false, message: error?.response?.data?.message || "We could not delete this plan. Try again." }
        }
    }

    const saveReport = async (interviewId, saved) => {
        try {
            await setInterviewReportSaved(interviewId, saved)
            // keep the open report in sync: it belongs to the user when saved
            setReport((current) => (current ? { ...current, user: saved ? user?.id : null } : current))
            return { ok: true }
        } catch (error) {
            console.log(error)
            return { ok: false, message: error?.response?.data?.message || "We could not update this report. Try again." }
        }
    }

    const getResumePdf = async (interviewReportId) => {
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            return true
        }
        catch (error) {
            console.log(error)
            return false
        }
    }

    const userId = user?.id

    useEffect(() => {
        // the report page loads its own plan by id; here we only load the user's list
        if (!interviewId && userId) {
            getReports()
        }
    }, [ interviewId, userId ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf, deleteReport, saveReport }

}