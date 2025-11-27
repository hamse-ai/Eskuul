import QuizCard from "./QuizCard";

const PendingQuizzesTab = ({
  pendingQuizzes,
  loading,
  rejectingQuizId,
  rejectionReason,
  setRejectionReason,
  onApprove,
  onReject,
  onStartReject,
  onCancelReject
}) => {
  return (
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
            <QuizCard
              key={quiz.quiz_id}
              quiz={quiz}
              isRejecting={rejectingQuizId === quiz.quiz_id}
              rejectionReason={rejectionReason}
              setRejectionReason={setRejectionReason}
              onApprove={onApprove}
              onReject={onReject}
              onStartReject={onStartReject}
              onCancelReject={onCancelReject}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingQuizzesTab;
