// src/api.js
// locker-frontend/src/api.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// ✅ API base comes from Vite env, fallback to local dev
export const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ------------------ Helpers ------------------ //
export const authHeader = () => {
  const access = localStorage.getItem("access_token");
  return access ? { Authorization: `Bearer ${access}` } : {};
};

export function saveTokens({ access, refresh }) {
  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
}

export function clearSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("username");
}

export function getCurrentUser() {
  const token = localStorage.getItem("access_token");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.username || decoded.user_id || null;
  } catch (err) {
    console.error("Token decode error:", err);
    return null;
  }
}

// ------------------ Auth ------------------ //
export async function registerUser(username, student_id, email, password) {
  try {
    const res = await axios.post(`${API_BASE}/api/register/`, {
      username,
      student_id,
      email,
      password,
    });
    return res.data;
  } catch (err) {
    console.error("Registration error", err.response?.data || err.message);
    return err.response?.data || { error: "Registration failed" };
  }
}

export async function loginUser(username, password) {
  try {
    const res = await axios.post(`${API_BASE}/api/token/`, {
      username,
      password,
    });

    // ✅ Save tokens properly
    saveTokens(res.data);

    // ✅ Decode and store username separately
    const decoded = jwtDecode(res.data.access);
    if (decoded.username) {
      localStorage.setItem("username", decoded.username);
    }

    return res.data;
  } catch (err) {
    console.error("Login error", err.response?.data || err.message);
    return err.response?.data || { error: "Login failed" };
  }
}

export async function logoutUser() {
  try {
    const refresh = localStorage.getItem("refresh_token");
    const res = await axios.post(
      `${API_BASE}/api/logout/`,
      { refresh },
      { headers: authHeader() }
    );

    clearSession();
    return res.data;
  } catch (err) {
    console.error("Logout error", err.response?.data || err.message);
    return err.response?.data || { error: "Logout failed" };
  }
}

// ------------------ Booking ------------------ //
export async function bookLocker(locker_number) {
  try {
    const res = await axios.post(
      `${API_BASE}/api/book-locker/`,
      { locker_number },
      { headers: { ...authHeader(), "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (err) {
    console.error("Booking error", err.response?.data || err.message);
    throw err.response?.data || { error: "Booking failed" };
  }
}

// ------------------ OTP ------------------ //
export async function requestOTP() {
  try {
    const res = await axios.post(
      `${API_BASE}/api/locker-access/request/`,
      {},
      { headers: { ...authHeader() } }
    );
    return res.data;
  } catch (err) {
    console.error("OTP request error", err.response?.data || err.message);
    return err.response?.data || { error: "OTP request failed" };
  }
}

export async function verifyOTP(otp) {
  try {
    const res = await axios.post(
      `${API_BASE}/api/locker-access/verify/`,
      { otp },
      { headers: { ...authHeader() } }
    );
    return res.data;
  } catch (err) {
    console.error("OTP verify error", err.response?.data || err.message);
    return err.response?.data || { error: "OTP verification failed" };
  }
}

// ------------------ Return Locker ------------------ //
export async function returnLocker() {
  try {
    const res = await axios.post(
      `${API_BASE}/api/locker/return/`,
      {},
      { headers: { ...authHeader() } }
    );
    return res.data;
  } catch (err) {
    console.error("Return locker error", err.response?.data || err.message);
    return err.response?.data || { error: "Return failed" };
  }
}

// ------------------ Email Verification ------------------ //
export async function verifyEmailOTP(email, otp) {
  try {
    const res = await axios.post(`${API_BASE}/api/verify-email/`, { email, otp });
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err.response?.data?.error || "Failed to verify email" };
  }
}

