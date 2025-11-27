import PdfCard from "./PdfCard";

const PendingPdfsTab = ({
  pendingPdfs,
  loading,
  rejectingPdfId,
  rejectionReason,
  setRejectionReason,
  onApprove,
  onReject,
  onStartReject,
  onCancelReject
}) => {
  return (
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
            <PdfCard
              key={pdf.file_id}
              pdf={pdf}
              isRejecting={rejectingPdfId === pdf.file_id}
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

export default PendingPdfsTab;
