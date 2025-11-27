import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Card, CardHeader, StatCard, Button, EmptyState, Input, Select } from "../components/ui";

const StudentDashboard = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [pdfs, setPdfs] = useState([]);
  const [filteredPdfs, setFilteredPdfs] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "pdfs", label: "Study Materials", icon: "📚", badge: pdfs.length },
    { id: "quizzes", label: "Quizzes", icon: "📝", badge: quizzes.length },
  ];

  useEffect(() => {
    if (user?.role !== "student") {
      navigate("/");
    } else {
      fetchApprovedPdfs();
      fetchApprovedQuizzes();
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "pdfs") filterPdfs();
    else if (activeTab === "quizzes") filterQuizzes();
  }, [pdfs, quizzes, searchTerm, selectedSubject, selectedGrade, activeTab]);

  useEffect(() => {
    if (quizData && quizData.quiz.time_limit_minutes && timeRemaining !== null) {
      if (timeRemaining <= 0) { handleQuizSubmit(); return; }
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, quizData]);

  const fetchApprovedPdfs = async () => {
    try {
      setLoading(true);
      const api = import.meta.env.VITE_API_URL;
      const res = await axios.get(`${api}/api/pdfs/approved`);
      setPdfs(res.data.pdfs);
      setFilteredPdfs(res.data.pdfs);
    } catch (error) {
      console.error("Error fetching PDFs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedQuizzes = async () => {
    try {
      const api = import.meta.env.VITE_API_URL;
      const res = await axios.get(`${api}/api/quizzes/approved`);
      setQuizzes(res.data.quizzes);
      setFilteredQuizzes(res.data.quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const filterPdfs = () => {
    let filtered = [...pdfs];
    if (searchTerm) filtered = filtered.filter((pdf) => pdf.topic.toLowerCase().includes(searchTerm.toLowerCase()) || pdf.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedSubject) filtered = filtered.filter((pdf) => pdf.subject === selectedSubject);
    if (selectedGrade) filtered = filtered.filter((pdf) => pdf.grade_level === selectedGrade);
    setFilteredPdfs(filtered);
  };

  const filterQuizzes = () => {
    let filtered = [...quizzes];
    if (searchTerm) filtered = filtered.filter((quiz) => quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) || quiz.subject.toLowerCase().includes(searchTerm.toLowerCase()) || quiz.topic.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedSubject) filtered = filtered.filter((quiz) => quiz.subject === selectedSubject);
    if (selectedGrade) filtered = filtered.filter((quiz) => quiz.grade_level === selectedGrade);
    setFilteredQuizzes(filtered);
  };

  const handleDownload = async (pdfId, fileName) => {
    try {
      const api = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${api}/api/pdfs/download/${pdfId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download PDF");
    }
  };

  const startQuiz = async (quizId) => {
    try {
      setLoading(true);
      const api = import.meta.env.VITE_API_URL;
      const res = await axios.get(`${api}/api/quizzes/${quizId}`);
      setQuizData(res.data);
      setSelectedQuiz(quizId);
      setAnswers({});
      setQuizResults(null);
      setQuizStartTime(Date.now());
      if (res.data.quiz.time_limit_minutes) setTimeRemaining(res.data.quiz.time_limit_minutes * 60);
    } catch (error) {
      console.error("Error loading quiz:", error);
      alert("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleQuizSubmit = async () => {
    if (!window.confirm("Are you sure you want to submit your quiz?")) return;
    try {
      setLoading(true);
      const timeTaken = quizStartTime ? Math.floor((Date.now() - quizStartTime) / 1000) : null;
      const api = import.meta.env.VITE_API_URL;
      const res = await axios.post(`${api}/api/quizzes/submit/${selectedQuiz}`, { answers, time_taken_seconds: timeTaken }, { withCredentials: true });
      setQuizResults(res.data);
      setTimeRemaining(null);
    } catch (error) {
      console.error("Quiz submission error:", error);
      alert(error.response?.data?.message || "Failed to submit quiz");
    } finally {
      setLoading(false);
    }
  };

  const exitQuiz = () => {
    if (!quizResults && !window.confirm("Are you sure you want to exit? Your progress will be lost.")) return;
    setSelectedQuiz(null);
    setQuizData(null);
    setAnswers({});
    setQuizResults(null);
    setTimeRemaining(null);
    setQuizStartTime(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSubject("");
    setSelectedGrade("");
  };

  const getPageTitle = () => {
    const titles = { overview: "Dashboard Overview", pdfs: "Study Materials", quizzes: "Quizzes" };
    return titles[activeTab] || "Student Dashboard";
  };

  const uniqueSubjects = activeTab === "pdfs" ? [...new Set(pdfs.map((pdf) => pdf.subject))].sort() : [...new Set(quizzes.map((quiz) => quiz.subject))].sort();

  const gradeOptions = [
    { value: "9", label: "Grade 9" },
    { value: "10", label: "Grade 10" },
    { value: "11", label: "Grade 11" },
    { value: "12", label: "Grade 12" },
  ];

  const subjectOptions = uniqueSubjects.map((s) => ({ value: s, label: s }));

  // If taking a quiz, show only quiz interface
  if (selectedQuiz && quizData) {
    return (
      <DashboardLayout user={user} setUser={setUser} menuItems={menuItems} activeItem="quizzes" onItemClick={() => {}} title={quizData.quiz.title}>
        <Card>
          {!quizResults ? (
            <>
              <div className="border-b pb-4 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{quizData.quiz.title}</h2>
                    <p className="text-gray-600 mt-1">{quizData.quiz.subject} - {quizData.quiz.topic}</p>
                    <p className="text-sm text-gray-500 mt-1">{quizData.quiz.questions.length} questions | {quizData.quiz.total_marks} marks</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {timeRemaining !== null && (
                      <div className={`text-lg font-bold px-4 py-2 rounded-lg ${timeRemaining < 300 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                        {formatTime(timeRemaining)}
                      </div>
                    )}
                    <button onClick={exitQuiz} className="text-red-600 hover:text-red-800 text-sm">Exit Quiz</button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {quizData.quiz.questions.map((question, index) => (
                  <div key={question.question_id} className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold text-lg mb-2">Question {index + 1} <span className="text-sm font-normal text-gray-500">({question.marks} {question.marks === 1 ? "mark" : "marks"})</span></h3>
                    <p className="text-gray-800 mb-4">{question.question_text}</p>
                    <div className="space-y-2">
                      {["A", "B", "C", "D"].map((option) => (
                        <label key={option} className={`flex items-start p-3 border rounded-lg cursor-pointer transition ${answers[question.question_id] === option ? "bg-blue-100 border-blue-500" : "bg-white hover:bg-gray-100"}`}>
                          <input type="radio" name={`question-${question.question_id}`} value={option} checked={answers[question.question_id] === option} onChange={() => handleAnswerChange(question.question_id, option)} className="mt-1 mr-3" />
                          <span><strong>{option}.</strong> {question[`option_${option.toLowerCase()}`]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t flex justify-between items-center">
                <p className="text-sm text-gray-600">Answered: {Object.keys(answers).length} / {quizData.quiz.questions.length}</p>
                <Button onClick={handleQuizSubmit} variant="success" disabled={loading}>{loading ? "Submitting..." : "Submit Quiz"}</Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
                <div className="inline-block bg-blue-50 rounded-xl p-6 mt-4">
                  <p className="text-sm text-gray-600 mb-2">Your Score</p>
                  <p className="text-5xl font-bold text-blue-600">{quizResults.percentage}%</p>
                  <p className="text-lg text-gray-700 mt-2">{quizResults.score} / {quizResults.total_marks} marks</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h3 className="text-xl font-bold">Detailed Results</h3>
                {quizResults.results.map((result, index) => (
                  <div key={result.question_id} className={`border-2 rounded-lg p-4 ${result.is_correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">Question {index + 1}</h4>
                      <span className={`px-3 py-1 rounded text-sm font-medium ${result.is_correct ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                        {result.is_correct ? "Correct" : "Incorrect"}
                      </span>
                    </div>
                    <p className="text-gray-800 mb-3">{result.question_text}</p>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm"><strong>Your answer:</strong> <span className={result.is_correct ? "text-green-700" : "text-red-700"}>{result.student_answer || "No answer"}</span></p>
                      {!result.is_correct && <p className="text-sm mt-1"><strong>Correct answer:</strong> <span className="text-green-700">{result.correct_answer}</span></p>}
                      {result.explanation && <p className="text-sm mt-2 text-gray-600"><strong>Explanation:</strong> {result.explanation}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={exitQuiz} className="w-full">Back to Dashboard</Button>
            </>
          )}
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} setUser={setUser} menuItems={menuItems} activeItem={activeTab} onItemClick={setActiveTab} title={getPageTitle()}>
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Study Materials" value={pdfs.length} subtitle="Available PDFs" color="blue" onClick={() => setActiveTab("pdfs")} />
            <StatCard title="Quizzes" value={quizzes.length} subtitle="Available to take" color="green" onClick={() => setActiveTab("quizzes")} />
            <StatCard title="Subjects" value={[...new Set([...pdfs.map(p => p.subject), ...quizzes.map(q => q.subject)])].length} subtitle="Different subjects" color="purple" />
          </div>

          <Card>
            <CardHeader title="Quick Actions" subtitle="Start learning" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => setActiveTab("pdfs")} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 rounded-xl hover:from-blue-600 hover:to-blue-700 transition text-left">
                <h4 className="font-semibold text-lg">Browse Study Materials</h4>
                <p className="text-sm mt-1 text-blue-100">{pdfs.length} PDF{pdfs.length !== 1 ? "s" : ""} available</p>
              </button>
              <button onClick={() => setActiveTab("quizzes")} className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5 rounded-xl hover:from-green-600 hover:to-green-700 transition text-left">
                <h4 className="font-semibold text-lg">Take a Quiz</h4>
                <p className="text-sm mt-1 text-green-100">{quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""} available</p>
              </button>
            </div>
          </Card>
        </div>
      )}

      {(activeTab === "pdfs" || activeTab === "quizzes") && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input label="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." />
              <Select label="Subject" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} options={subjectOptions} placeholder="All Subjects" />
              <Select label="Grade" value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} options={gradeOptions} placeholder="All Grades" />
              <div className="flex items-end">
                {(searchTerm || selectedSubject || selectedGrade) && (
                  <button onClick={clearFilters} className="text-blue-600 hover:text-blue-800 text-sm pb-2">Clear filters</button>
                )}
              </div>
            </div>
          </Card>

          {activeTab === "pdfs" && (
            <>
              <p className="text-gray-600">Showing {filteredPdfs.length} of {pdfs.length} study materials</p>
              <Card>
                {loading ? (
                  <p className="text-gray-500 text-center py-8">Loading study materials...</p>
                ) : filteredPdfs.length === 0 ? (
                  <EmptyState title="No study materials found" description="Try adjusting your filters or check back later for new materials." />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPdfs.map((pdf) => (
                      <div key={pdf.file_id} className="border rounded-lg p-4 hover:shadow-lg transition">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-800 mb-1">{pdf.topic}</h3>
                            <p className="text-sm text-gray-600"><span className="font-medium">Subject:</span> {pdf.subject}</p>
                            {pdf.grade_level && <p className="text-sm text-gray-600"><span className="font-medium">Grade:</span> {pdf.grade_level}</p>}
                          </div>
                          <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">PDF</div>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">By {pdf.uploaded_by_name}</p>
                        <Button onClick={() => handleDownload(pdf.file_id, pdf.file_name)} className="w-full">Download PDF</Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}

          {activeTab === "quizzes" && (
            <>
              <p className="text-gray-600">Showing {filteredQuizzes.length} of {quizzes.length} quizzes</p>
              <Card>
                {loading ? (
                  <p className="text-gray-500 text-center py-8">Loading quizzes...</p>
                ) : filteredQuizzes.length === 0 ? (
                  <EmptyState title="No quizzes found" description="Try adjusting your filters or check back later for new quizzes." />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredQuizzes.map((quiz) => (
                      <div key={quiz.quiz_id} className="border rounded-lg p-4 hover:shadow-lg transition">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-800 mb-1">{quiz.title}</h3>
                            <p className="text-sm text-gray-600"><span className="font-medium">Subject:</span> {quiz.subject}</p>
                            <p className="text-sm text-gray-600"><span className="font-medium">Topic:</span> {quiz.topic}</p>
                            {quiz.grade_level && <p className="text-sm text-gray-600"><span className="font-medium">Grade:</span> {quiz.grade_level}</p>}
                          </div>
                          <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">QUIZ</div>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          <p>{quiz.question_count} questions | {quiz.total_marks} marks</p>
                          {quiz.time_limit_minutes && <p>{quiz.time_limit_minutes} minutes</p>}
                        </div>
                        <p className="text-xs text-gray-500 mb-3">By {quiz.created_by_name}</p>
                        <Button onClick={() => startQuiz(quiz.quiz_id)} variant="success" className="w-full">Start Quiz</Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;
