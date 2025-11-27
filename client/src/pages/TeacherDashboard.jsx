import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Card, CardHeader, StatCard, Button, EmptyState, Alert, Input, Select, Textarea, StatusBadge } from "../components/ui";

const TeacherDashboard = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [pdfs, setPdfs] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ subject: "", topic: "", grade_level: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ type: "", message: "" });
  const [quizForm, setQuizForm] = useState({ title: "", subject: "", topic: "", grade_level: "", time_limit_minutes: "" });
  const [questions, setQuestions] = useState([{ question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_answer: "", explanation: "", marks: 1 }]);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const navigate = useNavigate();
  const api = import.meta.env.VITE_API_URL;

  const menuItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "pdfs", label: "PDF Summaries", icon: "📄", badge: pdfs.filter(p => p.status === "pending").length },
    { id: "quizzes", label: "Quizzes", icon: "📝", badge: quizzes.filter(q => q.status === "pending").length },
    { id: "analytics", label: "Analytics", icon: "📈" },
  ];

  useEffect(() => {
    if (user?.role !== "teacher") {
      navigate("/");
    } else {
      fetchMyPdfs();
      fetchMyQuizzes();
    }
  }, [user, navigate]);

  const showStatus = (type, message) => {
    setUploadStatus({ type, message });
    setTimeout(() => setUploadStatus({ type: "", message: "" }), 4000);
  };

  const fetchMyPdfs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${api}/api/pdfs/my-pdfs`, { withCredentials: true });
      setPdfs(res.data.pdfs);
    } catch (error) {
      console.error("Error fetching PDFs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyQuizzes = async () => {
    try {
      const res = await axios.get(`${api}/api/quizzes/my-quizzes`, { withCredentials: true });
      setQuizzes(res.data.quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      showStatus("error", "Please select a valid PDF file");
      setSelectedFile(null);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) { showStatus("error", "Please select a PDF file"); return; }
    if (!uploadForm.subject || !uploadForm.topic) { showStatus("error", "Subject and topic are required"); return; }

    const formData = new FormData();
    formData.append("pdf", selectedFile);
    formData.append("subject", uploadForm.subject);
    formData.append("topic", uploadForm.topic);
    formData.append("grade_level", uploadForm.grade_level);

    try {
      setLoading(true);
      await axios.post(`${api}/api/pdfs/upload`, formData, { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } });
      showStatus("success", "PDF uploaded successfully! Awaiting admin approval.");
      setUploadForm({ subject: "", topic: "", grade_level: "" });
      setSelectedFile(null);
      document.getElementById("pdfFileInput").value = "";
      fetchMyPdfs();
    } catch (error) {
      showStatus("error", error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePdf = async (pdfId) => {
    if (!window.confirm("Are you sure you want to delete this PDF?")) return;
    try {
      await axios.delete(`${api}/api/pdfs/${pdfId}`, { withCredentials: true });
      showStatus("success", "PDF deleted successfully");
      fetchMyPdfs();
    } catch (error) {
      showStatus("error", error.response?.data?.message || "Delete failed");
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_answer: "", explanation: "", marks: 1 }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (!quizForm.title || !quizForm.subject || !quizForm.topic) { showStatus("error", "Please fill in all required fields"); return; }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text || !q.option_a || !q.option_b || !q.option_c || !q.option_d || !q.correct_answer) {
        showStatus("error", `Please complete all fields for question ${i + 1}`);
        return;
      }
      if (!["A", "B", "C", "D"].includes(q.correct_answer.toUpperCase())) {
        showStatus("error", `Correct answer for question ${i + 1} must be A, B, C, or D`);
        return;
      }
    }

    try {
      setLoading(true);
      await axios.post(`${api}/api/quizzes/create`, { ...quizForm, questions }, { withCredentials: true });
      showStatus("success", "Quiz created successfully! Awaiting admin approval.");
      setQuizForm({ title: "", subject: "", topic: "", grade_level: "", time_limit_minutes: "" });
      setQuestions([{ question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_answer: "", explanation: "", marks: 1 }]);
      setShowQuizForm(false);
      fetchMyQuizzes();
    } catch (error) {
      showStatus("error", error.response?.data?.message || "Quiz creation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await axios.delete(`${api}/api/quizzes/${quizId}`, { withCredentials: true });
      showStatus("success", "Quiz deleted successfully");
      fetchMyQuizzes();
    } catch (error) {
      showStatus("error", error.response?.data?.message || "Delete failed");
    }
  };

  const getPageTitle = () => {
    const titles = { overview: "Dashboard Overview", pdfs: "PDF Summaries", quizzes: "Quizzes", analytics: "Analytics" };
    return titles[activeTab] || "Teacher Dashboard";
  };

  const gradeOptions = [
    { value: "9", label: "Grade 9" },
    { value: "10", label: "Grade 10" },
    { value: "11", label: "Grade 11" },
    { value: "12", label: "Grade 12" },
  ];

  return (
    <DashboardLayout user={user} setUser={setUser} menuItems={menuItems} activeItem={activeTab} onItemClick={setActiveTab} title={getPageTitle()}>
      {uploadStatus.message && (
        <div className="mb-6">
          <Alert type={uploadStatus.type} message={uploadStatus.message} onClose={() => setUploadStatus({ type: "", message: "" })} />
        </div>
      )}

      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="PDF Summaries" value={pdfs.length} subtitle="Total uploaded" color="blue" onClick={() => setActiveTab("pdfs")} />
            <StatCard title="Quizzes" value={quizzes.length} subtitle="Total created" color="green" onClick={() => setActiveTab("quizzes")} />
            <StatCard title="Pending Review" value={pdfs.filter(p => p.status === "pending").length + quizzes.filter(q => q.status === "pending").length} subtitle="Awaiting approval" color="yellow" />
          </div>

          <Card>
            <CardHeader title="Quick Actions" subtitle="Jump to common tasks" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => setActiveTab("pdfs")} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 rounded-xl hover:from-blue-600 hover:to-blue-700 transition text-left">
                <h4 className="font-semibold text-lg">Upload PDF Summary</h4>
                <p className="text-sm mt-1 text-blue-100">Share study materials with students</p>
              </button>
              <button onClick={() => { setActiveTab("quizzes"); setShowQuizForm(true); }} className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5 rounded-xl hover:from-green-600 hover:to-green-700 transition text-left">
                <h4 className="font-semibold text-lg">Create Quiz</h4>
                <p className="text-sm mt-1 text-green-100">Test student knowledge</p>
              </button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "pdfs" && (
        <div className="space-y-6">
          {/* Upload Form */}
          <Card className="border-l-4 border-l-blue-400">
            <CardHeader title="Upload New PDF Summary" subtitle="Share study materials with your students" />
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Subject" value={uploadForm.subject} onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })} placeholder="e.g., Mathematics, Biology" required />
                <Input label="Topic" value={uploadForm.topic} onChange={(e) => setUploadForm({ ...uploadForm, topic: e.target.value })} placeholder="e.g., Algebra, Cell Biology" required />
              </div>
              <Select label="Grade Level (Optional)" value={uploadForm.grade_level} onChange={(e) => setUploadForm({ ...uploadForm, grade_level: e.target.value })} options={gradeOptions} placeholder="Select grade level" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PDF File <span className="text-red-500">*</span></label>
                <input type="file" id="pdfFileInput" accept=".pdf" onChange={handleFileChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                {selectedFile && <p className="text-sm text-green-600 mt-1">Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>}
              </div>
              <Button type="submit" disabled={loading}>{loading ? "Uploading..." : "Upload PDF"}</Button>
            </form>
          </Card>

          {/* PDFs List */}
          <Card>
            <CardHeader title="My Uploaded PDFs" subtitle={`${pdfs.length} total uploads`} />
            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading...</p>
            ) : pdfs.length === 0 ? (
              <EmptyState title="No PDFs uploaded" description="Upload your first PDF summary to share with students." />
            ) : (
              <div className="space-y-4">
                {pdfs.map((pdf) => (
                  <div key={pdf.file_id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-900">{pdf.topic}</h4>
                        <p className="text-sm text-gray-600">Subject: {pdf.subject}</p>
                        {pdf.grade_level && <p className="text-sm text-gray-600">Grade: {pdf.grade_level}</p>}
                        <p className="text-sm text-gray-500">File: {pdf.file_name}</p>
                        <p className="text-xs text-gray-400 mt-1">Uploaded: {new Date(pdf.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={pdf.status} />
                        <button onClick={() => handleDeletePdf(pdf.file_id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                      </div>
                    </div>
                    {pdf.rejection_reason && (
                      <div className="mt-3 p-2 bg-red-50 border-l-4 border-red-500 text-sm">
                        <strong>Rejection Reason:</strong> {pdf.rejection_reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "quizzes" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setShowQuizForm(!showQuizForm)} variant={showQuizForm ? "secondary" : "success"}>
              {showQuizForm ? "Cancel" : "Create New Quiz"}
            </Button>
          </div>

          {showQuizForm && (
            <Card className="border-l-4 border-l-green-400">
              <CardHeader title="Create New Quiz" subtitle="Design a quiz to test student knowledge" />
              <form onSubmit={handleQuizSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Quiz Title" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} placeholder="e.g., Algebra Chapter 1 Quiz" required />
                  <Input label="Subject" value={quizForm.subject} onChange={(e) => setQuizForm({ ...quizForm, subject: e.target.value })} placeholder="e.g., Mathematics" required />
                  <Input label="Topic" value={quizForm.topic} onChange={(e) => setQuizForm({ ...quizForm, topic: e.target.value })} placeholder="e.g., Linear Equations" required />
                  <Select label="Grade Level" value={quizForm.grade_level} onChange={(e) => setQuizForm({ ...quizForm, grade_level: e.target.value })} options={gradeOptions} placeholder="Select grade level" />
                  <Input label="Time Limit (minutes)" type="number" value={quizForm.time_limit_minutes} onChange={(e) => setQuizForm({ ...quizForm, time_limit_minutes: e.target.value })} placeholder="e.g., 30" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-900">Questions</h4>
                    <Button type="button" onClick={addQuestion} variant="outline" className="text-sm">+ Add Question</Button>
                  </div>

                  {questions.map((question, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-medium text-gray-800">Question {index + 1}</h5>
                        {questions.length > 1 && (
                          <button type="button" onClick={() => removeQuestion(index)} className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <Textarea label="Question Text" value={question.question_text} onChange={(e) => updateQuestion(index, "question_text", e.target.value)} placeholder="Enter your question here..." rows={2} required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input label="Option A" value={question.option_a} onChange={(e) => updateQuestion(index, "option_a", e.target.value)} required />
                          <Input label="Option B" value={question.option_b} onChange={(e) => updateQuestion(index, "option_b", e.target.value)} required />
                          <Input label="Option C" value={question.option_c} onChange={(e) => updateQuestion(index, "option_c", e.target.value)} required />
                          <Input label="Option D" value={question.option_d} onChange={(e) => updateQuestion(index, "option_d", e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Select label="Correct Answer" value={question.correct_answer} onChange={(e) => updateQuestion(index, "correct_answer", e.target.value)} options={[{ value: "A", label: "A" }, { value: "B", label: "B" }, { value: "C", label: "C" }, { value: "D", label: "D" }]} placeholder="Select correct answer" required />
                          <Input label="Marks" type="number" value={question.marks} onChange={(e) => updateQuestion(index, "marks", parseInt(e.target.value) || 1)} />
                        </div>
                        <Textarea label="Explanation (Optional)" value={question.explanation} onChange={(e) => updateQuestion(index, "explanation", e.target.value)} placeholder="Provide an explanation for the correct answer..." rows={2} />
                      </div>
                    </div>
                  ))}
                </div>

                <Button type="submit" variant="success" disabled={loading} className="w-full">
                  {loading ? "Creating Quiz..." : "Create Quiz"}
                </Button>
              </form>
            </Card>
          )}

          <Card>
            <CardHeader title="My Created Quizzes" subtitle={`${quizzes.length} total quizzes`} />
            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading...</p>
            ) : quizzes.length === 0 ? (
              <EmptyState title="No quizzes created" description="Create your first quiz to test student knowledge." />
            ) : (
              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <div key={quiz.quiz_id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-900">{quiz.title}</h4>
                        <p className="text-sm text-gray-600">Subject: {quiz.subject} | Topic: {quiz.topic}</p>
                        {quiz.grade_level && <p className="text-sm text-gray-600">Grade: {quiz.grade_level}</p>}
                        <p className="text-sm text-gray-600">{quiz.question_count} question{quiz.question_count !== 1 ? "s" : ""} | {quiz.total_marks} marks</p>
                        {quiz.time_limit_minutes && <p className="text-sm text-gray-600">Time Limit: {quiz.time_limit_minutes} minutes</p>}
                        <p className="text-xs text-gray-400 mt-1">Created: {new Date(quiz.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={quiz.status} />
                        <button onClick={() => handleDeleteQuiz(quiz.quiz_id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                      </div>
                    </div>
                    {quiz.rejection_reason && (
                      <div className="mt-3 p-2 bg-red-50 border-l-4 border-red-500 text-sm">
                        <strong>Rejection Reason:</strong> {quiz.rejection_reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "analytics" && (
        <Card>
          <EmptyState title="Analytics Coming Soon" description="We're working on bringing you detailed analytics and insights about your content and student performance." />
        </Card>
      )}
    </DashboardLayout>
  );
};

export default TeacherDashboard;
