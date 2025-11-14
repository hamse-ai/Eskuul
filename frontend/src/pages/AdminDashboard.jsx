import { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingPdfs, setPendingPdfs] = useState([]);
  const [pendingQuizzes, setPendingQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingPdfId, setRejectingPdfId] = useState(null);
  const [rejectingQuizId, setRejectingQuizId] = useState(null);
  const [quizRejectionReason, setQuizRejectionReason] = useState("");

  useEffect(() => {
    fetchPendingContent();
    fetchPendingQuizzes();
  }, []);

  const fetchPendingContent = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/pdfs/pending", {
        withCredentials: true
      });
      setPendingPdfs(res.data.pdfs);
    } catch (error) {
      console.error("Error fetching pending content:", error);
      setActionStatus(error.response?.data?.message || "Failed to load pending content");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePdf = async (pdfId) => {
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:3000/api/pdfs/approve/${pdfId}`,
        {},
        { withCredentials: true }
      );
      setActionStatus("PDF approved successfully!");
      fetchPendingContent();
      setTimeout(() => setActionStatus(""), 3000);
    } catch (error) {
      console.error("Approve error:", error);
      setActionStatus(error.response?.data?.message || "Approval failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPdf = async (pdfId) => {
    if (!rejectionReason.trim()) {
      setActionStatus("Please provide a rejection reason");
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        `http://localhost:3000/api/pdfs/reject/${pdfId}`,
        { rejection_reason: rejectionReason },
        { withCredentials: true }
      );
      setActionStatus("PDF rejected successfully");
      setRejectionReason("");
      setRejectingPdfId(null);
      fetchPendingContent();
      setTimeout(() => setActionStatus(""), 3000);
    } catch (error) {
      console.error("Reject error:", error);
      setActionStatus(error.response?.data?.message || "Rejection failed");
    } finally {
      setLoading(false);
    }
  };

  const startReject = (pdfId) => {
    setRejectingPdfId(pdfId);
    setRejectionReason("");
    setActionStatus("");
  };

  const cancelReject = () => {
    setRejectingPdfId(null);
    setRejectionReason("");
  };

  const fetchPendingQuizzes = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/quizzes/admin/pending", {
        withCredentials: true
      });
      setPendingQuizzes(res.data.quizzes);
    } catch (error) {
      console.error("Error fetching pending quizzes:", error);
      setActionStatus(error.response?.data?.message || "Failed to load pending quizzes");
    }
  };

  const handleApproveQuiz = async (quizId) => {
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:3000/api/quizzes/approve/${quizId}`,
        {},
        { withCredentials: true }
      );
      setActionStatus("Quiz approved successfully!");
      fetchPendingQuizzes();
      setTimeout(() => setActionStatus(""), 3000);
    } catch (error) {
      console.error("Approve error:", error);
      setActionStatus(error.response?.data?.message || "Approval failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectQuiz = async (quizId) => {
    if (!quizRejectionReason.trim()) {
      setActionStatus("Please provide a rejection reason");
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        `http://localhost:3000/api/quizzes/reject/${quizId}`,
        { rejection_reason: quizRejectionReason },
        { withCredentials: true }
      );
      setActionStatus("Quiz rejected successfully");
      setQuizRejectionReason("");
      setRejectingQuizId(null);
      fetchPendingQuizzes();
      setTimeout(() => setActionStatus(""), 3000);
    } catch (error) {
      console.error("Reject error:", error);
      setActionStatus(error.response?.data?.message || "Rejection failed");
    } finally {
      setLoading(false);
    }
  };

  const startRejectQuiz = (quizId) => {
    setRejectingQuizId(quizId);
    setQuizRejectionReason("");
    setActionStatus("");
  };

  const cancelRejectQuiz = () => {
    setRejectingQuizId(null);
    setQuizRejectionReason("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Review and manage content submissions
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-4 font-medium ${
                activeTab === "overview"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("pending-pdfs")}
              className={`px-6 py-4 font-medium ${
                activeTab === "pending-pdfs"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Pending PDFs
              {pendingPdfs.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingPdfs.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("pending-quizzes")}
              className={`px-6 py-4 font-medium ${
                activeTab === "pending-quizzes"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Pending Quizzes
              {pendingQuizzes.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingQuizzes.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-6 py-4 font-medium ${
                activeTab === "analytics"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {actionStatus && (
            <div
              className={`mb-4 p-3 rounded ${
                actionStatus.includes("success")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {actionStatus}
            </div>
          )}

          {activeTab === "overview" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">System Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-800">
                    Pending PDFs
                  </h3>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">
                    {pendingPdfs.length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Awaiting review</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800">
                    Pending Quizzes
                  </h3>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {pendingQuizzes.length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Awaiting review</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800">
                    Total Pending
                  </h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {pendingPdfs.length + pendingQuizzes.length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Items to review</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab("pending-pdfs")}
                    className="bg-yellow-500 text-white p-4 rounded-lg hover:bg-yellow-600 transition text-left"
                  >
                    <h4 className="font-semibold text-lg">Review PDFs</h4>
                    <p className="text-sm mt-1 text-yellow-100">
                      {pendingPdfs.length} PDF{pendingPdfs.length !== 1 ? "s" : ""} waiting
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveTab("pending-quizzes")}
                    className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition text-left"
                  >
                    <h4 className="font-semibold text-lg">Review Quizzes</h4>
                    <p className="text-sm mt-1 text-purple-100">
                      {pendingQuizzes.length} quiz{pendingQuizzes.length !== 1 ? "zes" : ""} waiting
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pending-pdfs" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Pending PDF Submissions</h2>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : pendingPdfs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No pending PDFs to review</p>
                  <p className="text-gray-400 text-sm mt-2">
                    All submissions have been reviewed!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingPdfs.map((pdf) => (
                    <div
                      key={pdf.file_id}
                      className="border-2 border-yellow-200 rounded-lg p-6 bg-yellow-50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800">
                            {pdf.topic}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            <strong>Subject:</strong> {pdf.subject}
                          </p>
                          {pdf.grade_level && (
                            <p className="text-gray-600">
                              <strong>Grade Level:</strong> {pdf.grade_level}
                            </p>
                          )}
                          <p className="text-gray-500 text-sm mt-2">
                            <strong>File:</strong> {pdf.file_name}
                          </p>
                          <p className="text-gray-500 text-sm">
                            <strong>Uploaded by:</strong> {pdf.teacher_name} ({pdf.teacher_email})
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Submitted: {new Date(pdf.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {rejectingPdfId === pdf.file_id ? (
                        <div className="mt-4 p-4 bg-white rounded border-2 border-red-300">
                          <h4 className="font-semibold text-red-800 mb-2">
                            Provide Rejection Reason
                          </h4>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full border p-2 rounded mb-3"
                            rows="3"
                            placeholder="Explain why this PDF is being rejected (e.g., not aligned with curriculum, poor quality, etc.)"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRejectPdf(pdf.file_id)}
                              disabled={loading || !rejectionReason.trim()}
                              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              Confirm Reject
                            </button>
                            <button
                              onClick={cancelReject}
                              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => handleApprovePdf(pdf.file_id)}
                            disabled={loading}
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => startReject(pdf.file_id)}
                            disabled={loading}
                            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "pending-quizzes" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Pending Quiz Submissions</h2>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : pendingQuizzes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No pending quizzes to review</p>
                  <p className="text-gray-400 text-sm mt-2">
                    All quiz submissions have been reviewed!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingQuizzes.map((quiz) => (
                    <div
                      key={quiz.quiz_id}
                      className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800">
                            {quiz.title}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            <strong>Subject:</strong> {quiz.subject} | <strong>Topic:</strong> {quiz.topic}
                          </p>
                          {quiz.grade_level && (
                            <p className="text-gray-600">
                              <strong>Grade Level:</strong> {quiz.grade_level}
                            </p>
                          )}
                          <p className="text-gray-600">
                            <strong>Questions:</strong> {quiz.question_count} | <strong>Total Marks:</strong> {quiz.total_marks}
                          </p>
                          {quiz.time_limit_minutes && (
                            <p className="text-gray-600">
                              <strong>Time Limit:</strong> {quiz.time_limit_minutes} minutes
                            </p>
                          )}
                          <p className="text-gray-500 text-sm mt-2">
                            <strong>Created by:</strong> {quiz.teacher_name} ({quiz.teacher_email})
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Submitted: {new Date(quiz.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {rejectingQuizId === quiz.quiz_id ? (
                        <div className="mt-4 p-4 bg-white rounded border-2 border-red-300">
                          <h4 className="font-semibold text-red-800 mb-2">
                            Provide Rejection Reason
                          </h4>
                          <textarea
                            value={quizRejectionReason}
                            onChange={(e) => setQuizRejectionReason(e.target.value)}
                            className="w-full border p-2 rounded mb-3"
                            rows="3"
                            placeholder="Explain why this quiz is being rejected (e.g., questions are unclear, incorrect answers, etc.)"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRejectQuiz(quiz.quiz_id)}
                              disabled={loading || !quizRejectionReason.trim()}
                              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              Confirm Reject
                            </button>
                            <button
                              onClick={cancelRejectQuiz}
                              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => handleApproveQuiz(quiz.quiz_id)}
                            disabled={loading}
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => startRejectQuiz(quiz.quiz_id)}
                            disabled={loading}
                            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">System Analytics</h2>
              <div className="text-center py-8">
                <p className="text-gray-500">Analytics dashboard coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
