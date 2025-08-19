// src/components/SessionBanner.jsx
import { useEffect, useState } from "react";

export default function SessionBanner() {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        // JWT = header.payload.signature
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUsername(payload.username || payload.user || payload.sub);
      } catch (err) {
        console.error("Failed to decode token", err);
      }
    }
  }, []);

  return (
    <div className="bg-gray-700 text-white p-4 rounded mb-4 text-center">
      {username ? (
        <h2 className="text-lg">Welcome, <span className="font-bold">{username}</span> 👋</h2>
      ) : (
        <h2 className="text-lg">Please sign in or register</h2>
      )}
    </div>
  );
}
