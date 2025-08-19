// src/components/VerifyOTP.jsx
import { useState } from "react";
import { verifyOTP } from "../api";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("access_token");
  if (!token) {
    alert("You must log in first!");
    return;
   }

  const handleVerify = async (e) => {
    e.preventDefault();
    const res = await verifyOTP(otp);
    if (res.error) {
      setMessage(res.error);
    } else {
      setMessage("OTP verified successfully! Locker access granted.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Verify OTP</h2>
      {message && <p className="mb-3 text-yellow-400">{message}</p>}
      <form onSubmit={handleVerify} className="space-y-3">
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
        />
        <button
          type="submit"
          className="w-full bg-green-500 py-2 rounded hover:bg-green-600"
        >
          Verify OTP
        </button>
      </form>
    </div>
  );
}
