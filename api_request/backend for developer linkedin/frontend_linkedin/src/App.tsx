import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { refreshAuth } from "@/store/authSlice";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

export default function App() {
  const dispatch = useAppDispatch();
  const { isInitialized, accessToken } = useAppSelector((s) => s.auth);

  useEffect(() => {
    dispatch(refreshAuth());
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div className="h-full grid place-items-center bg-gray-50">
        <div className="rounded-xl border bg-white px-5 py-3 text-sm text-gray-700 shadow-sm">
          Loading...
        </div>
      </div>
    );
  }

  const isAuthed = Boolean(accessToken);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isAuthed ? <HomePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={isAuthed ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthed ? <Navigate to="/" replace /> : <RegisterPage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
