// src/components/VerifyEmail.jsx
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../api";

export default function VerifyEmail() {
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const didRun = useRef(false);

  // For manual form
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const otpParam = searchParams.get("otp");
    const emailParam = searchParams.get("email");

    if (otpParam && emailParam) {
      // Auto verification from email link
      const url = `${API_BASE}/api/verify-email/?otp=${otpParam}&email=${emailParam}`;
      axios
        .get(url)
        .then((res) => {
          setMessage(res.data.message || "Email verified successfully!");
        })
        .catch((err) => {
          setMessage(err.response?.data?.message || "User not found or OTP invalid");
        });
    }
  }, [searchParams]);

  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!username || !otp) {
      setMessage("Please enter username and OTP");
      return;
    }

    try {
      const url = `${API_BASE}/api/verify-email/?otp=${otp}&username=${username}`;
      const res = await axios.get(url);
      setMessage(res.data.message || "Email verified successfully!");
    } catch (err) {
      setMessage(err.response?.data?.message || "User not found or OTP invalid");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Email Verification</h2>

      {message && <p className="mb-3 text-yellow-400">{message}</p>}

      {/* Manual form only if no email link in URL */}
      {!searchParams.get("email") && (
        <form onSubmit={handleManualVerify} className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded"
          />
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded"
          />
          <button
            type="submit"
            className="w-full bg-green-500 py-2 rounded hover:bg-green-600"
          >
            Verify
          </button>
        </form>
      )}
    </div>
  );
}
