// src/components/RequestOTP.jsx
import { useState } from "react";
import { requestOTP } from "../api";

export default function RequestOTP() {
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("access_token");
  if (!token) {
    alert("You must log in first!");
    return;
   }

  const handleRequest = async () => {
    const res = await requestOTP();
    if (res.error) {
      setMessage(res.error);
    } else {
      setMessage("OTP has been sent to your registered email!");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Request OTP</h2>
      {message && <p className="mb-3 text-yellow-400">{message}</p>}
      <button
        onClick={handleRequest}
        className="w-full bg-purple-500 py-2 rounded hover:bg-purple-600"
      >
        Send OTP
      </button>
    </div>
  );
}
