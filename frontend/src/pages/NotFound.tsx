import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center mt-20 space-y-4">
      <h1 className="text-3xl font-bold text-red-500">404 - Page Not Found</h1>
      <button
        onClick={() => navigate("/")}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default NotFound;
