import { useState } from "react";
import { bookLocker } from "../api";

export default function BookLocker() {
  const [lockerNumber, setLockerNumber] = useState("");
  const [message, setMessage] = useState("");

  const handleBook = async () => {
    try {
      const res = await bookLocker(lockerNumber); // ✅ calls backend /api/book-locker/
      setMessage(res.message || "Locker booked successfully!");
    } catch (err) {
      setMessage(err.error || "Failed to book locker");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded shadow text-white">
      <h2 className="text-2xl font-bold mb-4">Book a Locker</h2>

      <input
        type="text"
        value={lockerNumber}
        onChange={(e) => setLockerNumber(e.target.value)}
        placeholder="Enter locker number"
        className="w-full p-2 rounded text-black"
      />

      <button
        onClick={handleBook}
        className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
      >
        Book Locker
      </button>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
