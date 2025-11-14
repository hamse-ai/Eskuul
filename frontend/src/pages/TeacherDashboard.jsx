import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [pdfs, setPdfs] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    subject: "",
    topic: "",
    grade_level: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [quizForm, setQuizForm] = useState({
    title: "",
    subject: "",
    topic: "",
    grade_level: "",
    time_limit_minutes: ""
  });
  const [questions, setQuestions] = useState([{
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "",
    explanation: "",
    marks: 1
  }]);
  const [quizStatus, setQuizStatus] = useState("");
  const [showQuizForm, setShowQuizForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== "teacher") {
      navigate("/");
    } else {
      fetchMyPdfs();
      fetchMyQuizzes();
    }
  }, [user, navigate]);

  const fetchMyPdfs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/pdfs/my-pdfs", {
        withCredentials: true
      });
      setPdfs(res.data.pdfs);
    } catch (error) {
      console.error("Error fetching PDFs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyQuizzes = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/quizzes/my-quizzes", {
        withCredentials: true
      });
      setQuizzes(res.data.quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setUploadStatus("");
    } else {
      setUploadStatus("Please select a valid PDF file");
      setSelectedFile(null);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setUploadStatus("Please select a PDF file");
      return;
    }

    if (!uploadForm.subject || !uploadForm.topic) {
      setUploadStatus("Subject and topic are required");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", selectedFile);
    formData.append("subject", uploadForm.subject);
    formData.append("topic", uploadForm.topic);
    formData.append("grade_level", uploadForm.grade_level);

    try {
      setLoading(true);
      setUploadStatus("Uploading...");

      const res = await axios.post(
        "http://localhost:3000/api/pdfs/upload",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setUploadStatus("PDF uploaded successfully! Awaiting admin approval.");
      setUploadForm({ subject: "", topic: "", grade_level: "" });
      setSelectedFile(null);

      // Reset file input
      document.getElementById("pdfFileInput").value = "";

      // Refresh PDF list
      fetchMyPdfs();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePdf = async (pdfId) => {
    if (!window.confirm("Are you sure you want to delete this PDF?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/pdfs/${pdfId}`, {
        withCredentials: true
      });
      setUploadStatus("PDF deleted successfully");
      fetchMyPdfs();
    } catch (error) {
      console.error("Delete error:", error);
      setUploadStatus(error.response?.data?.message || "Delete failed");
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "",
      explanation: "",
      marks: 1
    }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();

    if (!quizForm.title || !quizForm.subject || !quizForm.topic) {
      setQuizStatus("Please fill in all required fields");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text || !q.option_a || !q.option_b || !q.option_c || !q.option_d || !q.correct_answer) {
        setQuizStatus(`Please complete all fields for question ${i + 1}`);
        return;
      }
      if (!['A', 'B', 'C', 'D'].includes(q.correct_answer.toUpperCase())) {
        setQuizStatus(`Correct answer for question ${i + 1} must be A, B, C, or D`);
        return;
      }
    }

    try {
      setLoading(true);
      setQuizStatus("Creating quiz...");

      const res = await axios.post(
        "http://localhost:3000/api/quizzes/create",
        {
          ...quizForm,
          questions: questions
        },
        { withCredentials: true }
      );

      setQuizStatus("Quiz created successfully! Awaiting admin approval.");
      setQuizForm({ title: "", subject: "", topic: "", grade_level: "", time_limit_minutes: "" });
      setQuestions([{
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "",
        explanation: "",
        marks: 1
      }]);
      setShowQuizForm(false);
      fetchMyQuizzes();
    } catch (error) {
      console.error("Quiz creation error:", error);
      setQuizStatus(error.response?.data?.message || "Quiz creation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/quizzes/${quizId}`, {
        withCredentials: true
      });
      setQuizStatus("Quiz deleted successfully");
      fetchMyQuizzes();
    } catch (error) {
      console.error("Delete error:", error);
      setQuizStatus(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name}!
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
              onClick={() => setActiveTab("pdfs")}
              className={`px-6 py-4 font-medium ${
                activeTab === "pdfs"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              PDF Summaries
            </button>
            <button
              onClick={() => setActiveTab("quizzes")}
              className={`px-6 py-4 font-medium ${
                activeTab === "quizzes"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Quizzes
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
          {activeTab === "overview" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800">
                    PDF Summaries
                  </h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {pdfs.length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Total uploaded</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800">
                    Quizzes
                  </h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {quizzes.length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Total created</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800">
                    Student Engagement
                  </h3>
                  <p className="text-3xl font-bold text-purple-600 mt-2">--</p>
                  <p className="text-sm text-gray-600 mt-1">Coming soon</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab("pdfs")}
                    className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition text-left"
                  >
                    <h4 className="font-semibold text-lg">Upload PDF Summary</h4>
                    <p className="text-sm mt-1 text-blue-100">
                      Share study materials with students
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveTab("quizzes")}
                    className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition text-left"
                  >
                    <h4 className="font-semibold text-lg">Create Quiz</h4>
                    <p className="text-sm mt-1 text-green-100">
                      Test student knowledge
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pdfs" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">PDF Summaries</h2>

              {/* Upload Form */}
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold mb-4">Upload New PDF Summary</h3>
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Subject *</label>
                      <input
                        type="text"
                        value={uploadForm.subject}
                        onChange={(e) => setUploadForm({...uploadForm, subject: e.target.value})}
                        className="w-full border p-2 rounded"
                        placeholder="e.g., Mathematics, Biology"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Topic *</label>
                      <input
                        type="text"
                        value={uploadForm.topic}
                        onChange={(e) => setUploadForm({...uploadForm, topic: e.target.value})}
                        className="w-full border p-2 rounded"
                        placeholder="e.g., Algebra, Cell Biology"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Grade Level (Optional)</label>
                    <select
                      value={uploadForm.grade_level}
                      onChange={(e) => setUploadForm({...uploadForm, grade_level: e.target.value})}
                      className="w-full border p-2 rounded"
                    >
                      <option value="">Select grade level</option>
                      <option value="9">Grade 9</option>
                      <option value="10">Grade 10</option>
                      <option value="11">Grade 11</option>
                      <option value="12">Grade 12</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">PDF File *</label>
                    <input
                      type="file"
                      id="pdfFileInput"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="w-full border p-2 rounded"
                      required
                    />
                    {selectedFile && (
                      <p className="text-sm text-green-600 mt-1">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                  {uploadStatus && (
                    <div className={`p-3 rounded ${uploadStatus.includes('success') ? 'bg-green-100 text-green-800' : uploadStatus.includes('Uploading') ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                      {uploadStatus}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? "Uploading..." : "Upload PDF"}
                  </button>
                </form>
              </div>

              {/* PDFs List */}
              <div>
                <h3 className="text-xl font-semibold mb-4">My Uploaded PDFs</h3>
                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : pdfs.length === 0 ? (
                  <p className="text-gray-500">No PDFs uploaded yet.</p>
                ) : (
                  <div className="grid gap-4">
                    {pdfs.map((pdf) => (
                      <div key={pdf.file_id} className="bg-white border rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{pdf.topic}</h4>
                            <p className="text-sm text-gray-600">Subject: {pdf.subject}</p>
                            {pdf.grade_level && (
                              <p className="text-sm text-gray-600">Grade: {pdf.grade_level}</p>
                            )}
                            <p className="text-sm text-gray-500">File: {pdf.file_name}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Uploaded: {new Date(pdf.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded text-sm font-medium ${
                              pdf.status === 'approved' ? 'bg-green-100 text-green-800' :
                              pdf.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {pdf.status.charAt(0).toUpperCase() + pdf.status.slice(1)}
                            </span>
                            <button
                              onClick={() => handleDeletePdf(pdf.file_id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
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
              </div>
            </div>
          )}

          {activeTab === "quizzes" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Quizzes</h2>

              {/* Create Quiz Button */}
              <div className="mb-6">
                <button
                  onClick={() => setShowQuizForm(!showQuizForm)}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  {showQuizForm ? "Cancel" : "Create New Quiz"}
                </button>
              </div>

              {/* Quiz Creation Form */}
              {showQuizForm && (
                <div className="bg-green-50 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-semibold mb-4">Create New Quiz</h3>
                  <form onSubmit={handleQuizSubmit} className="space-y-6">
                    {/* Quiz Details */}
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-semibold mb-3">Quiz Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Quiz Title *</label>
                          <input
                            type="text"
                            value={quizForm.title}
                            onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                            className="w-full border p-2 rounded"
                            placeholder="e.g., Algebra Chapter 1 Quiz"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Subject *</label>
                          <input
                            type="text"
                            value={quizForm.subject}
                            onChange={(e) => setQuizForm({...quizForm, subject: e.target.value})}
                            className="w-full border p-2 rounded"
                            placeholder="e.g., Mathematics"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Topic *</label>
                          <input
                            type="text"
                            value={quizForm.topic}
                            onChange={(e) => setQuizForm({...quizForm, topic: e.target.value})}
                            className="w-full border p-2 rounded"
                            placeholder="e.g., Linear Equations"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Grade Level</label>
                          <select
                            value={quizForm.grade_level}
                            onChange={(e) => setQuizForm({...quizForm, grade_level: e.target.value})}
                            className="w-full border p-2 rounded"
                          >
                            <option value="">Select grade level</option>
                            <option value="9">Grade 9</option>
                            <option value="10">Grade 10</option>
                            <option value="11">Grade 11</option>
                            <option value="12">Grade 12</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Time Limit (minutes)</label>
                          <input
                            type="number"
                            value={quizForm.time_limit_minutes}
                            onChange={(e) => setQuizForm({...quizForm, time_limit_minutes: e.target.value})}
                            className="w-full border p-2 rounded"
                            placeholder="e.g., 30"
                            min="1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Questions</h4>
                        <button
                          type="button"
                          onClick={addQuestion}
                          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 text-sm"
                        >
                          + Add Question
                        </button>
                      </div>

                      {questions.map((question, index) => (
                        <div key={index} className="bg-white p-4 rounded border">
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="font-medium">Question {index + 1}</h5>
                            {questions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeQuestion(index)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">Question Text *</label>
                              <textarea
                                value={question.question_text}
                                onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                                className="w-full border p-2 rounded"
                                rows="2"
                                placeholder="Enter your question here..."
                                required
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">Option A *</label>
                                <input
                                  type="text"
                                  value={question.option_a}
                                  onChange={(e) => updateQuestion(index, 'option_a', e.target.value)}
                                  className="w-full border p-2 rounded"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Option B *</label>
                                <input
                                  type="text"
                                  value={question.option_b}
                                  onChange={(e) => updateQuestion(index, 'option_b', e.target.value)}
                                  className="w-full border p-2 rounded"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Option C *</label>
                                <input
                                  type="text"
                                  value={question.option_c}
                                  onChange={(e) => updateQuestion(index, 'option_c', e.target.value)}
                                  className="w-full border p-2 rounded"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Option D *</label>
                                <input
                                  type="text"
                                  value={question.option_d}
                                  onChange={(e) => updateQuestion(index, 'option_d', e.target.value)}
                                  className="w-full border p-2 rounded"
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">Correct Answer *</label>
                                <select
                                  value={question.correct_answer}
                                  onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                                  className="w-full border p-2 rounded"
                                  required
                                >
                                  <option value="">Select correct answer</option>
                                  <option value="A">A</option>
                                  <option value="B">B</option>
                                  <option value="C">C</option>
                                  <option value="D">D</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Marks</label>
                                <input
                                  type="number"
                                  value={question.marks}
                                  onChange={(e) => updateQuestion(index, 'marks', parseInt(e.target.value) || 1)}
                                  className="w-full border p-2 rounded"
                                  min="1"
                                  required
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">Explanation (Optional)</label>
                              <textarea
                                value={question.explanation}
                                onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                                className="w-full border p-2 rounded"
                                rows="2"
                                placeholder="Provide an explanation for the correct answer..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {quizStatus && (
                      <div className={`p-3 rounded ${quizStatus.includes('success') ? 'bg-green-100 text-green-800' : quizStatus.includes('Creating') ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                        {quizStatus}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-green-600 text-white px-8 py-3 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? "Creating Quiz..." : "Create Quiz"}
                    </button>
                  </form>
                </div>
              )}

              {/* My Quizzes List */}
              <div>
                <h3 className="text-xl font-semibold mb-4">My Created Quizzes</h3>
                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : quizzes.length === 0 ? (
                  <p className="text-gray-500">No quizzes created yet.</p>
                ) : (
                  <div className="grid gap-4">
                    {quizzes.map((quiz) => (
                      <div key={quiz.quiz_id} className="bg-white border rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{quiz.title}</h4>
                            <p className="text-sm text-gray-600">Subject: {quiz.subject} | Topic: {quiz.topic}</p>
                            {quiz.grade_level && (
                              <p className="text-sm text-gray-600">Grade: {quiz.grade_level}</p>
                            )}
                            <p className="text-sm text-gray-600">
                              {quiz.question_count} question{quiz.question_count !== 1 ? 's' : ''} | {quiz.total_marks} marks
                            </p>
                            {quiz.time_limit_minutes && (
                              <p className="text-sm text-gray-600">Time Limit: {quiz.time_limit_minutes} minutes</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Created: {new Date(quiz.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded text-sm font-medium ${
                              quiz.status === 'approved' ? 'bg-green-100 text-green-800' :
                              quiz.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                            </span>
                            <button
                              onClick={() => handleDeleteQuiz(quiz.quiz_id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
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
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Analytics</h2>
              <p className="text-gray-600">
                View student performance and engagement metrics.
              </p>
              <div className="mt-4 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <p className="text-gray-500">Analytics feature coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
