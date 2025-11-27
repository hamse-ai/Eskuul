import RejectionForm from "./RejectionForm";

const PdfCard = ({
  pdf,
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
    <div className="border-2 border-yellow-200 rounded-lg p-6 bg-yellow-50">
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

      {isRejecting ? (
        <RejectionForm
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          onConfirm={() => onReject(pdf.file_id)}
          onCancel={onCancelReject}
          loading={loading}
          placeholder="Explain why this PDF is being rejected (e.g., not aligned with curriculum, poor quality, etc.)"
        />
      ) : (
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => onApprove(pdf.file_id)}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            ✓ Approve
          </button>
          <button
            onClick={() => onStartReject(pdf.file_id)}
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

export default PdfCard;
