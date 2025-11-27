const RejectionForm = ({
  rejectionReason,
  setRejectionReason,
  onConfirm,
  onCancel,
  loading,
  placeholder
}) => {
  return (
    <div className="mt-4 p-4 bg-white rounded border-2 border-red-300">
      <h4 className="font-semibold text-red-800 mb-2">
        Provide Rejection Reason
      </h4>
      <textarea
        value={rejectionReason}
        onChange={(e) => setRejectionReason(e.target.value)}
        className="w-full border p-2 rounded mb-3"
        rows="3"
        placeholder={placeholder}
      />
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          disabled={loading || !rejectionReason.trim()}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Confirm Reject
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RejectionForm;
