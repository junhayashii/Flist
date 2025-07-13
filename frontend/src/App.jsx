import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Logout from "./pages/Logout";
import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/*" element={<AppLayout />} />
        {/* Optionally, redirect old root to /app if needed: */}
        {/* <Route path="/*" element={<Navigate to="/app" replace />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
