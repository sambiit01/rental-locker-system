// src/components/ReturnLocker.jsx
import { useState } from "react";
import { returnLocker } from "../api";

export default function ReturnLocker() {
  const [message, setMessage] = useState("");
  const [fine, setFine] = useState(null);

  const handleReturn = async () => {
    try {
      const res = await returnLocker();

      if (res.error) {
        setMessage(res.error);
        setFine(null);
      } else {
        // ✅ show message from backend
        setMessage(res.message || "Locker returned successfully!");
        // ✅ show fine if backend provided it
        if (res.fine !== undefined && res.fine !== null) {
          setFine(res.fine);
        } else {
          setFine(null);
        }
      }
    } catch (err) {
      setMessage("Error returning locker.");
      setFine(null);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Return Locker</h2>
      
      {message && <p className="mb-3 text-yellow-400">{message}</p>}
      
      {fine !== null && (
        <p className="mb-3 text-red-400">
          Fine Due: <strong>₹{fine}</strong>
        </p>
      )}
      
      <button
        onClick={handleReturn}
        className="w-full bg-red-500 py-2 rounded hover:bg-red-600"
      >
        Return Locker
      </button>
    </div>
  );
}
