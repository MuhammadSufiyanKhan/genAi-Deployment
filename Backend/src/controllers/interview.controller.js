const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const mongoose = require("mongoose")
const interviewReportModel = require("../models/interviewReport.model")




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {

    const { selfDescription = "", jobDescription = "" } = req.body

    if (!jobDescription.trim()) {
        return res.status(400).json({ message: "Add the job description to continue." })
    }

    let resumeText = ""

    if (req.file) {
        const isPdf = req.file.mimetype === "application/pdf" || /\.pdf$/i.test(req.file.originalname || "")
        if (!isPdf) {
            return res.status(400).json({ message: "Upload your resume as a PDF, or describe yourself in the text box." })
        }
        // unpdf works in serverless (no DOM/canvas needed), unlike pdf-parse
        const { extractText, getDocumentProxy } = await import("unpdf")
        const pdf = await getDocumentProxy(new Uint8Array(req.file.buffer))
        const { text } = await extractText(pdf, { mergePages: true })
        resumeText = text
    }

    if (!resumeText.trim() && !selfDescription.trim()) {
        return res.status(400).json({ message: "Add a resume or a short description of yourself to continue." })
    }

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeText,
        selfDescription,
        jobDescription
    })

    const interviewReport = await interviewReportModel.create({
        // guests have no account: the report is reachable only through its link
        user: req.user ? req.user.id : undefined,
        resume: resumeText,
        selfDescription,
        jobDescription,
        ...interViewReportByAi
    })

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })

}

// A logged-in user can open their own reports; guest reports (no owner) open by link.
function reportAccessFilter(req, id) {
    return req.user
        ? { _id: id, $or: [ { user: req.user.id }, { user: { $exists: false } }, { user: null } ] }
        : { _id: id, $or: [ { user: { $exists: false } }, { user: null } ] }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne(reportAccessFilter(req, interviewId))

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findOne(reportAccessFilter(req, interviewReportId))

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

/**
 * @description Controller to delete one of the logged in user's interview reports.
 */
async function deleteInterviewReportController(req, res) {
    const { interviewId } = req.params

    if (!mongoose.isValidObjectId(interviewId)) {
        return res.status(404).json({ message: "Interview report not found." })
    }

    // only the owner can delete; guest reports have no owner and cannot be deleted by anyone
    const deleted = await interviewReportModel.findOneAndDelete({ _id: interviewId, user: req.user.id })

    if (!deleted) {
        return res.status(404).json({ message: "Interview report not found." })
    }

    res.status(200).json({ message: "Interview report deleted successfully." })
}

/**
 * @description Controller to save a report to the logged in user's account (saved: true)
 * or release it from the account (saved: false).
 */
async function setInterviewReportSavedController(req, res) {
    const { interviewId } = req.params
    const { saved } = req.body || {}

    if (typeof saved !== "boolean") {
        return res.status(400).json({ message: "Send saved as true or false." })
    }

    if (!mongoose.isValidObjectId(interviewId)) {
        return res.status(404).json({ message: "Interview report not found." })
    }

    const report = saved
        // a guest report (no owner) or one the user already owns can be saved
        ? await interviewReportModel.findOneAndUpdate(
            { _id: interviewId, $or: [ { user: { $exists: false } }, { user: null }, { user: req.user.id } ] },
            { $set: { user: req.user.id } },
            { new: true }
        )
        // only the owner can release it
        : await interviewReportModel.findOneAndUpdate(
            { _id: interviewId, user: req.user.id },
            { $unset: { user: 1 } },
            { new: true }
        )

    if (!report) {
        return res.status(404).json({ message: "Interview report not found." })
    }

    res.status(200).json({
        message: saved ? "Report saved to your account." : "Report removed from your account.",
        saved
    })
}

module.exports = { setInterviewReportSavedController, generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController, deleteInterviewReportController }