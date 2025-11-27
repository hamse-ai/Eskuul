import RejectionForm from "./RejectionForm";

const QuizCard = ({
  quiz,
  isRejecting,
  rejectionReason,
  setRejectionReason,
  onApprove,
  onReject,
  onStartReject,
  onCancelReject,
  loading
}) => {
  return (
    <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
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

      {isRejecting ? (
        <RejectionForm
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          onConfirm={() => onReject(quiz.quiz_id)}
          onCancel={onCancelReject}
          loading={loading}
          placeholder="Explain why this quiz is being rejected (e.g., questions are unclear, incorrect answers, etc.)"
        />
      ) : (
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => onApprove(quiz.quiz_id)}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            ✓ Approve
          </button>
          <button
            onClick={() => onStartReject(quiz.quiz_id)}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            ✗ Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizCard;
