import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

import Hyperspeed from "../components/Hyperspeed";
import { hyperspeedPresets } from "../components/Hyperspeedpreset";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/api/login", {
        email,
        password,
      });

      Swal.fire({
  icon: "success",
  title: "Login Berhasil 🎉",
  html: `
    <div class="flex flex-col items-center gap-2">
      <p class="text-sm text-gray-600">
        Selamat datang di
        <span class="font-semibold text-indigo-600">
          Portal Akademik
        </span>
      </p>
      <p class="text-xs text-gray-400">
        Mengarahkan ke dashboard...
      </p>
    </div>
  `,
  timer: 2000,
  timerProgressBar: true,
  showConfirmButton: false,
  allowOutsideClick: false,
  allowEscapeKey: false,
  customClass: {
    popup: "rounded-xl shadow-xl bg-white/50",
    title: "text-lg font-semibold text-gray-800",
    icon: "scale-90",
    timerProgressBar: "bg-indigo-500"
  }
});




      localStorage.setItem("token", response.data.token);

      const payload = JSON.parse(atob(response.data.token.split(".")[1]));
      const userRole = payload.role;
      localStorage.setItem("role", userRole);

      setTimeout(() => {
        if (userRole === "lecturer") navigate("/lecturer");
        else if (userRole === "parent") navigate("/parent");
        else if (userRole === "admin") navigate("/academic");
        else navigate("/dashboard");
      }, 2000);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Gagal!",
        text: "Email atau password salah, coba lagi.",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">

      {/* 🔥 BACKGROUND HYPERSPEED */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Hyperspeed effectOptions={hyperspeedPresets.one} />
      </div>

      {/* 📦 LOGIN CARD */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <form
          onSubmit={handleSubmit}
          className="w-[360px] bg-black/60 backdrop-blur-xl p-8 rounded-2xl shadow-2xl text-white"
        >
          <h1 className="text-2xl font-bold text-center mb-6">
            Portal Akademik
          </h1>

          <div className="mb-4">
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 transition font-semibold"
          >
            Login
          </button>

          <p className="text-xs text-center text-white/60 mt-4">
            © {new Date().getFullYear()} Portal Akademik
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
