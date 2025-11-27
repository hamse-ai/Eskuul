import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Card, CardHeader, StatCard, Button, EmptyState, Alert, Textarea } from "../components/ui";

const AdminDashboard = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingPdfs, setPendingPdfs] = useState([]);
  const [pendingQuizzes, setPendingQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState({ type: "", message: "" });
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingPdfId, setRejectingPdfId] = useState(null);
  const [rejectingQuizId, setRejectingQuizId] = useState(null);
  const [quizRejectionReason, setQuizRejectionReason] = useState("");
  const api = import.meta.env.VITE_API_URL;

  const menuItems = [
    { id: "overview", label: "Overview", icon: "grid" },
    { id: "pending-pdfs", label: "Pending PDFs", icon: "file", badge: pendingPdfs.length },
    { id: "pending-quizzes", label: "Pending Quizzes", icon: "clipboard", badge: pendingQuizzes.length },
    { id: "analytics", label: "Analytics", icon: "chart" },
  ];

  useEffect(() => {
    fetchPendingContent();
    fetchPendingQuizzes();
  }, []);

  const showStatus = (type, message) => {
    setActionStatus({ type, message });
    setTimeout(() => setActionStatus({ type: "", message: "" }), 4000);
  };

  const fetchPendingContent = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${api}/api/pdfs/pending`, { withCredentials: true });
      setPendingPdfs(res.data.pdfs);
    } catch (error) {
      console.error("Error fetching pending content:", error);
      showStatus("error", error.response?.data?.message || "Failed to load pending content");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingQuizzes = async () => {
    try {
      const res = await axios.get(`${api}/api/quizzes/admin/pending`, { withCredentials: true });
      setPendingQuizzes(res.data.quizzes);
    } catch (error) {
      console.error("Error fetching pending quizzes:", error);
    }
  };

  const handleApprovePdf = async (pdfId) => {
    try {
      setLoading(true);
      await axios.put(`${api}/api/pdfs/approve/${pdfId}`, {}, { withCredentials: true });
      showStatus("success", "PDF approved successfully!");
      fetchPendingContent();
    } catch (error) {
      showStatus("error", error.response?.data?.message || "Approval failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPdf = async (pdfId) => {
    if (!rejectionReason.trim()) {
      showStatus("error", "Please provide a rejection reason");
      return;
    }
    try {
      setLoading(true);
      await axios.put(`${api}/api/pdfs/reject/${pdfId}`, { rejection_reason: rejectionReason }, { withCredentials: true });
      showStatus("success", "PDF rejected successfully");
      setRejectionReason("");
      setRejectingPdfId(null);
      fetchPendingContent();
    } catch (error) {
      showStatus("error", error.response?.data?.message || "Rejection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveQuiz = async (quizId) => {
    try {
      setLoading(true);
      await axios.put(`${api}/api/quizzes/approve/${quizId}`, {}, { withCredentials: true });
      showStatus("success", "Quiz approved successfully!");
      fetchPendingQuizzes();
    } catch (error) {
      showStatus("error", error.response?.data?.message || "Approval failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectQuiz = async (quizId) => {
    if (!quizRejectionReason.trim()) {
      showStatus("error", "Please provide a rejection reason");
      return;
    }
    try {
      setLoading(true);
      await axios.put(`${api}/api/quizzes/reject/${quizId}`, { rejection_reason: quizRejectionReason }, { withCredentials: true });
      showStatus("success", "Quiz rejected successfully");
      setQuizRejectionReason("");
      setRejectingQuizId(null);
      fetchPendingQuizzes();
    } catch (error) {
      showStatus("error", error.response?.data?.message || "Rejection failed");
    } finally {
      setLoading(false);
    }
  };

  const getPageTitle = () => {
    const titles = { overview: "Dashboard Overview", "pending-pdfs": "Pending PDF Reviews", "pending-quizzes": "Pending Quiz Reviews", analytics: "Analytics" };
    return titles[activeTab] || "Admin Dashboard";
  };

  return (
    <DashboardLayout user={user} setUser={setUser} menuItems={menuItems} activeItem={activeTab} onItemClick={setActiveTab} title={getPageTitle()}>
      {actionStatus.message && (
        <div className="mb-6">
          <Alert type={actionStatus.type} message={actionStatus.message} onClose={() => setActionStatus({ type: "", message: "" })} />
        </div>
      )}

      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Pending PDFs" value={pendingPdfs.length} subtitle="Awaiting review" color="yellow" onClick={() => setActiveTab("pending-pdfs")} />
            <StatCard title="Pending Quizzes" value={pendingQuizzes.length} subtitle="Awaiting review" color="purple" onClick={() => setActiveTab("pending-quizzes")} />
            <StatCard title="Total Pending" value={pendingPdfs.length + pendingQuizzes.length} subtitle="Items to review" color="blue" />
          </div>
          <Card>
            <CardHeader title="Quick Actions" subtitle="Jump to common tasks" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => setActiveTab("pending-pdfs")} className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-5 rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition text-left">
                <h4 className="font-semibold text-lg">Review PDFs</h4>
                <p className="text-sm mt-1 text-yellow-100">{pendingPdfs.length} PDF{pendingPdfs.length !== 1 ? "s" : ""} waiting</p>
              </button>
              <button onClick={() => setActiveTab("pending-quizzes")} className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-5 rounded-xl hover:from-purple-600 hover:to-purple-700 transition text-left">
                <h4 className="font-semibold text-lg">Review Quizzes</h4>
                <p className="text-sm mt-1 text-purple-100">{pendingQuizzes.length} quiz{pendingQuizzes.length !== 1 ? "zes" : ""} waiting</p>
              </button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "pending-pdfs" && (
        <div className="space-y-6">
          {loading ? (
            <Card><p className="text-gray-500 text-center py-8">Loading...</p></Card>
          ) : pendingPdfs.length === 0 ? (
            <Card><EmptyState title="No pending PDFs" description="All PDF submissions have been reviewed!" /></Card>
          ) : (
            pendingPdfs.map((pdf) => (
              <Card key={pdf.file_id} className="border-l-4 border-l-yellow-400">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{pdf.topic}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Subject:</span> {pdf.subject}</p>
                      {pdf.grade_level && <p><span className="font-medium">Grade:</span> {pdf.grade_level}</p>}
                      <p><span className="font-medium">File:</span> {pdf.file_name}</p>
                      <p><span className="font-medium">Uploaded by:</span> {pdf.teacher_name} ({pdf.teacher_email})</p>
                      <p className="text-gray-400 text-xs mt-2">Submitted: {new Date(pdf.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {rejectingPdfId === pdf.file_id ? (
                    <div className="w-full lg:w-96 p-4 bg-red-50 rounded-xl border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-3">Rejection Reason</h4>
                      <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Explain why this PDF is being rejected..." rows={3} />
                      <div className="flex gap-2 mt-3">
                        <Button variant="danger" onClick={() => handleRejectPdf(pdf.file_id)} disabled={loading || !rejectionReason.trim()}>Confirm Reject</Button>
                        <Button variant="secondary" onClick={() => { setRejectingPdfId(null); setRejectionReason(""); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Button variant="success" onClick={() => handleApprovePdf(pdf.file_id)} disabled={loading}>Approve</Button>
                      <Button variant="danger" onClick={() => setRejectingPdfId(pdf.file_id)} disabled={loading}>Reject</Button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "pending-quizzes" && (
        <div className="space-y-6">
          {loading ? (
            <Card><p className="text-gray-500 text-center py-8">Loading...</p></Card>
          ) : pendingQuizzes.length === 0 ? (
            <Card><EmptyState title="No pending quizzes" description="All quiz submissions have been reviewed!" /></Card>
          ) : (
            pendingQuizzes.map((quiz) => (
              <Card key={quiz.quiz_id} className="border-l-4 border-l-purple-400">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Subject:</span> {quiz.subject} | <span className="font-medium">Topic:</span> {quiz.topic}</p>
                      {quiz.grade_level && <p><span className="font-medium">Grade:</span> {quiz.grade_level}</p>}
                      <p><span className="font-medium">Questions:</span> {quiz.question_count} | <span className="font-medium">Total Marks:</span> {quiz.total_marks}</p>
                      {quiz.time_limit_minutes && <p><span className="font-medium">Time Limit:</span> {quiz.time_limit_minutes} minutes</p>}
                      <p><span className="font-medium">Created by:</span> {quiz.teacher_name} ({quiz.teacher_email})</p>
                      <p className="text-gray-400 text-xs mt-2">Submitted: {new Date(quiz.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {rejectingQuizId === quiz.quiz_id ? (
                    <div className="w-full lg:w-96 p-4 bg-red-50 rounded-xl border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-3">Rejection Reason</h4>
                      <Textarea value={quizRejectionReason} onChange={(e) => setQuizRejectionReason(e.target.value)} placeholder="Explain why this quiz is being rejected..." rows={3} />
                      <div className="flex gap-2 mt-3">
                        <Button variant="danger" onClick={() => handleRejectQuiz(quiz.quiz_id)} disabled={loading || !quizRejectionReason.trim()}>Confirm Reject</Button>
                        <Button variant="secondary" onClick={() => { setRejectingQuizId(null); setQuizRejectionReason(""); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Button variant="success" onClick={() => handleApproveQuiz(quiz.quiz_id)} disabled={loading}>Approve</Button>
                      <Button variant="danger" onClick={() => setRejectingQuizId(quiz.quiz_id)} disabled={loading}>Reject</Button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "analytics" && (
        <Card><EmptyState title="Analytics Coming Soon" description="We're working on bringing you detailed analytics and insights." /></Card>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;