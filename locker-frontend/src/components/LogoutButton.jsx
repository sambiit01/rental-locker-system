import { logoutUser } from "../api";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const res = await logoutUser();
    if (res.detail || res.message) {
      alert("Logged out successfully");
      navigate("/login");  // 👈 send back to login
    } else {
      alert("Error logging out");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
    >
      Logout
    </button>
  );
}
