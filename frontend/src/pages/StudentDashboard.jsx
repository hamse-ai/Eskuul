import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StudentDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState("pdfs");
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

  useEffect(() => {
    if (user?.role !== "student") {
      navigate("/");
    } else {
      fetchApprovedPdfs();
      fetchApprovedQuizzes();
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "pdfs") {
      filterPdfs();
    } else if (activeTab === "quizzes") {
      filterQuizzes();
    }
  }, [pdfs, quizzes, searchTerm, selectedSubject, selectedGrade, activeTab]);

  // Timer effect for quizzes
  useEffect(() => {
    if (quizData && quizData.quiz.time_limit_minutes && timeRemaining !== null) {
      if (timeRemaining <= 0) {
        handleQuizSubmit();
        return;
      }

      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [timeRemaining, quizData]);

  const fetchApprovedPdfs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/pdfs/approved");
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
      const res = await axios.get("http://localhost:3000/api/quizzes/approved");
      setQuizzes(res.data.quizzes);
      setFilteredQuizzes(res.data.quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const filterPdfs = () => {
    let filtered = [...pdfs];

    if (searchTerm) {
      filtered = filtered.filter(
        (pdf) =>
          pdf.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pdf.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSubject) {
      filtered = filtered.filter((pdf) => pdf.subject === selectedSubject);
    }

    if (selectedGrade) {
      filtered = filtered.filter((pdf) => pdf.grade_level === selectedGrade);
    }

    setFilteredPdfs(filtered);
  };

  const filterQuizzes = () => {
    let filtered = [...quizzes];

    if (searchTerm) {
      filtered = filtered.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.topic.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSubject) {
      filtered = filtered.filter((quiz) => quiz.subject === selectedSubject);
    }

    if (selectedGrade) {
      filtered = filtered.filter((quiz) => quiz.grade_level === selectedGrade);
    }

    setFilteredQuizzes(filtered);
  };

  const handleDownload = async (pdfId, fileName) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/pdfs/download/${pdfId}`,
        {
          responseType: "blob",
        }
      );

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
      const res = await axios.get(`http://localhost:3000/api/quizzes/${quizId}`);
      setQuizData(res.data);
      setSelectedQuiz(quizId);
      setAnswers({});
      setQuizResults(null);
      setQuizStartTime(Date.now());

      // Initialize timer if quiz has time limit
      if (res.data.quiz.time_limit_minutes) {
        setTimeRemaining(res.data.quiz.time_limit_minutes * 60);
      }
    } catch (error) {
      console.error("Error loading quiz:", error);
      alert("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleQuizSubmit = async () => {
    if (!window.confirm("Are you sure you want to submit your quiz?")) {
      return;
    }

    try {
      setLoading(true);
      const timeTaken = quizStartTime ? Math.floor((Date.now() - quizStartTime) / 1000) : null;

      const res = await axios.post(
        `http://localhost:3000/api/quizzes/submit/${selectedQuiz}`,
        {
          answers: answers,
          time_taken_seconds: timeTaken
        },
        { withCredentials: true }
      );

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
    if (!quizResults && !window.confirm("Are you sure you want to exit? Your progress will be lost.")) {
      return;
    }
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
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const uniqueSubjects = activeTab === "pdfs"
    ? [...new Set(pdfs.map((pdf) => pdf.subject))].sort()
    : [...new Set(quizzes.map((quiz) => quiz.subject))].sort();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name}!
          </p>
        </div>

        {/* If taking a quiz, show only quiz interface */}
        {selectedQuiz && quizData ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            {!quizResults ? (
              <>
                {/* Quiz Header */}
                <div className="border-b pb-4 mb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{quizData.quiz.title}</h2>
                      <p className="text-gray-600 mt-1">
                        {quizData.quiz.subject} - {quizData.quiz.topic}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {quizData.quiz.questions.length} questions | {quizData.quiz.total_marks} marks
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {timeRemaining !== null && (
                        <div className={`text-lg font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-blue-600'}`}>
                          Time: {formatTime(timeRemaining)}
                        </div>
                      )}
                      <button
                        onClick={exitQuiz}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Exit Quiz
                      </button>
                    </div>
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                  {quizData.quiz.questions.map((question, index) => (
                    <div key={question.question_id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg">
                          Question {index + 1} ({question.marks} {question.marks === 1 ? 'mark' : 'marks'})
                        </h3>
                      </div>
                      <p className="text-gray-800 mb-4">{question.question_text}</p>

                      <div className="space-y-2">
                        {['A', 'B', 'C', 'D'].map((option) => (
                          <label
                            key={option}
                            className={`flex items-start p-3 border rounded cursor-pointer transition ${
                              answers[question.question_id] === option
                                ? 'bg-blue-100 border-blue-500'
                                : 'bg-white hover:bg-gray-100'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${question.question_id}`}
                              value={option}
                              checked={answers[question.question_id] === option}
                              onChange={() => handleAnswerChange(question.question_id, option)}
                              className="mt-1 mr-3"
                            />
                            <span className="flex-1">
                              <strong>{option}.</strong> {question[`option_${option.toLowerCase()}`]}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Answered: {Object.keys(answers).length} / {quizData.quiz.questions.length}
                    </p>
                    <button
                      onClick={handleQuizSubmit}
                      disabled={loading}
                      className="bg-green-600 text-white px-8 py-3 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? "Submitting..." : "Submit Quiz"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Quiz Results */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
                  <div className="inline-block bg-blue-50 rounded-lg p-6 mt-4">
                    <p className="text-sm text-gray-600 mb-2">Your Score</p>
                    <p className="text-5xl font-bold text-blue-600">
                      {quizResults.percentage}%
                    </p>
                    <p className="text-lg text-gray-700 mt-2">
                      {quizResults.score} / {quizResults.total_marks} marks
                    </p>
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-xl font-bold">Detailed Results</h3>
                  {quizResults.results.map((result, index) => (
                    <div
                      key={result.question_id}
                      className={`border-2 rounded-lg p-4 ${
                        result.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">Question {index + 1}</h4>
                        <span className={`px-3 py-1 rounded text-sm font-medium ${
                          result.is_correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                        }`}>
                          {result.is_correct ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      </div>
                      <p className="text-gray-800 mb-3">{result.question_text}</p>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm">
                          <strong>Your answer:</strong>{' '}
                          <span className={result.is_correct ? 'text-green-700' : 'text-red-700'}>
                            {result.student_answer || 'No answer'}
                          </span>
                        </p>
                        {!result.is_correct && (
                          <p className="text-sm mt-1">
                            <strong>Correct answer:</strong>{' '}
                            <span className="text-green-700">{result.correct_answer}</span>
                          </p>
                        )}
                        {result.explanation && (
                          <p className="text-sm mt-2 text-gray-600">
                            <strong>Explanation:</strong> {result.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={exitQuiz}
                  className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-medium"
                >
                  Back to Dashboard
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("pdfs")}
                  className={`px-6 py-4 font-medium ${
                    activeTab === "pdfs"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Study Materials
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
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Filter by Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">All Subjects</option>
                    {uniqueSubjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Filter by Grade
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">All Grades</option>
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>
                </div>
              </div>

              {(searchTerm || selectedSubject || selectedGrade) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSubject("");
                    setSelectedGrade("");
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Content Area */}
            {activeTab === "pdfs" && (
              <div>
                <div className="mb-4">
                  <p className="text-gray-600">
                    Showing {filteredPdfs.length} of {pdfs.length} study materials
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  {loading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Loading study materials...</p>
                    </div>
                  ) : filteredPdfs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-lg">No study materials found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredPdfs.map((pdf) => (
                        <div
                          key={pdf.file_id}
                          className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-800 mb-1">
                                {pdf.topic}
                              </h3>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Subject:</span> {pdf.subject}
                              </p>
                              {pdf.grade_level && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Grade:</span> {pdf.grade_level}
                                </p>
                              )}
                            </div>
                            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              PDF
                            </div>
                          </div>

                          <p className="text-xs text-gray-500 mb-3">
                            By {pdf.uploaded_by_name}
                          </p>

                          <button
                            onClick={() => handleDownload(pdf.file_id, pdf.file_name)}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                          >
                            Download PDF
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "quizzes" && (
              <div>
                <div className="mb-4">
                  <p className="text-gray-600">
                    Showing {filteredQuizzes.length} of {quizzes.length} quizzes
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  {loading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Loading quizzes...</p>
                    </div>
                  ) : filteredQuizzes.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-lg">No quizzes found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredQuizzes.map((quiz) => (
                        <div
                          key={quiz.quiz_id}
                          className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-800 mb-1">
                                {quiz.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Subject:</span> {quiz.subject}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Topic:</span> {quiz.topic}
                              </p>
                              {quiz.grade_level && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Grade:</span> {quiz.grade_level}
                                </p>
                              )}
                            </div>
                            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              QUIZ
                            </div>
                          </div>

                          <div className="text-sm text-gray-600 mb-3">
                            <p>{quiz.question_count} questions</p>
                            <p>{quiz.total_marks} marks</p>
                            {quiz.time_limit_minutes && (
                              <p>{quiz.time_limit_minutes} minutes</p>
                            )}
                          </div>

                          <p className="text-xs text-gray-500 mb-3">
                            By {quiz.created_by_name}
                          </p>

                          <button
                            onClick={() => startQuiz(quiz.quiz_id)}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
                          >
                            Start Quiz
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
