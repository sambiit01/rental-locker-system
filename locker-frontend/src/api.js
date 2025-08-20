// src/api.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// 🔑 Base API URL (from Vercel .env or fallback to localhost)
export const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ✅ Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ------------------ Auth Helpers ------------------ //
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

// ------------------ Auth API ------------------ //
export async function registerUser(username, student_id, email, password) {
  const res = await api.post("/api/register/", {
    username,
    student_id,
    email,
    password,
  });
  return res.data;
}

export async function loginUser(username, password) {
  const res = await api.post("/api/token/", { username, password });
  saveTokens(res.data);
  localStorage.setItem("username", username);
  return res.data;
}

export async function logoutUser() {
  try {
    const refresh = localStorage.getItem("refresh_token");
    const res = await api.post(
      "/api/logout/",
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

// ------------------ Locker API ------------------ //
export async function bookLocker(locker_number) {
  try {
    const res = await api.post(
      "/api/book-locker/",
      { locker_number },
      { headers: { ...authHeader() } }
    );
    return res.data;
  } catch (err) {
    console.error("Booking error", err.response?.data || err.message);
    throw err.response?.data || { error: "Booking failed" };
  }
}

export async function returnLocker() {
  const res = await api.post("/api/locker/return/", {}, { headers: authHeader() });
  return res.data;
}

// ------------------ OTP API ------------------ //
export async function requestOTP() {
  const res = await api.post("/api/locker-access/request/", {}, { headers: authHeader() });
  return res.data;
}

export async function verifyOTP(otp) {
  const res = await api.post("/api/locker-access/verify/", { otp }, { headers: authHeader() });
  return res.data;
}

export async function verifyEmailOTP(email, otp) {
  const res = await api.post("/api/verify-email/", { email, otp });
  return res.data;
}
