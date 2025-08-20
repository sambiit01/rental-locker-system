import { useState } from "react";
import { bookLocker } from "../api";

export default function BookLocker() {
  const [lockerNumber, setLockerNumber] = useState("");
  const [message, setMessage] = useState("");

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const result = await bookLocker(lockerNumber); // ✅ no manual token
      setMessage(result.message || "Locker booked successfully!");
    } catch (err) {
      setMessage(err.error || "Error booking locker.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded shadow text-white">
      <h2 className="text-2xl font-bold mb-4">Book Locker</h2>
      {message && <p className="mb-3 text-yellow-400">{message}</p>}

      <form onSubmit={handleBook} className="space-y-3">
        <input
          type="text"
          placeholder="Enter Locker Number (e.g., LCKR-001)"
          value={lockerNumber}
          onChange={(e) => setLockerNumber(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-500 py-2 rounded hover:bg-green-600"
        >
          Book Locker
        </button>
      </form>
    </div>
  );
}
