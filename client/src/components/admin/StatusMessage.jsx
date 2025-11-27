const StatusMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div
      className={`mb-4 p-3 rounded ${
        message.includes("success")
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }`}
    >
      {message}
    </div>
  );
};

export default StatusMessage;
