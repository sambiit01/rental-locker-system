import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import BookLocker from "./components/BookLocker";
import RequestOTP from "./components/RequestOTP";
import VerifyOTP from "./components/VerifyOTP";
import ReturnLocker from "./components/ReturnLocker";
import VerifyEmail from "./components/VerifyEmail";
import LogoutButton from "./components/LogoutButton";
import SessionBanner from "./components/SessionBanner";
import { useState, useEffect } from "react";
import { getCurrentUser } from "./api";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation */}
        <nav className="bg-blue-600 p-4 text-white shadow-md">
          <ul className="flex space-x-6 justify-center">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/register" className="hover:underline">Register</Link></li>
            <li><Link to="/login" className="hover:underline">Login</Link></li>
            <li><Link to="/book" className="hover:underline">Book Locker</Link></li>
            <li><Link to="/request-otp" className="hover:underline">Request OTP</Link></li>
            <li><Link to="/verify-otp" className="hover:underline">Verify OTP</Link></li>
            <li><Link to="/return" className="hover:underline">Return Locker</Link></li>
            <li><Link to="/verify-email" className="hover:underline">Verify Email</Link></li>
            {user && <li><LogoutButton /></li>}
          </ul>
        </nav>

        {/* 🔑 Session Info */}
        <div className="p-4 text-center">
          {user ? (
            <h2 className="text-xl font-bold">Welcome, {user}!</h2>
          ) : (
            <h2 className="text-xl font-bold">Please sign in or register</h2>
          )}
        </div>

        {/* Optional Session Banner */}
        {/* <SessionBanner />  */}

        {/* Routes */}
        <div className="p-6">
          <Routes>
            <Route path="/" element={<h1 className="text-3xl font-bold text-center">Welcome to Locker Rental</h1>} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/book" element={<BookLocker />} />
            <Route path="/request-otp" element={<RequestOTP />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/return" element={<ReturnLocker />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}


// export default function App() {
//   return (
//     <div className="p-6 text-center">
//       <h1 className="text-3xl font-bold text-blue-600">
//         Locker System UI is working 🚀
//       </h1>
//     </div>
//   );
// }

// import { useState, useEffect } from "react";
// import { getCurrentUser } from "./api";
// import LogoutButton from "./components/LogoutButton";

// export default function App() {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     setUser(getCurrentUser());
//   }, []);

//   return (
//     <div className="p-4">
//       {user ? (
//         <h2 className="text-xl font-bold">Welcome, {user}!</h2>
//       ) : (
//         <h2 className="text-xl font-bold">Please sign in or register</h2>
//       )}

//       {user && <LogoutButton />}
//     </div>
//   );
// }


