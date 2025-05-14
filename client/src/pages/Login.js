import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = () => {
    if (!emailRegex.test(form.email)) {
      toast.error("Invalid email format.");
      return false;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, form);

      const { token } = res.data;

      const decoded = JSON.parse(atob(token));
      const role = decoded.role;

      login(token, role); // Save token and role to context + localStorage

      toast.success("Login successful!");
      setTimeout(() => {
        navigate(role === "owner" ? "/owner" : "/customer/place");
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-ivory text-burgundy animate-fadeIn overflow-hidden">
      <ToastContainer position="top-center" autoClose={2000} />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 rounded-xl border border-burgundy/30 bg-[linear-gradient(135deg,_rgba(255,255,255,0.45),_rgba(255,255,255,0.25))] backdrop-blur-glass shadow-lg shadow-burgundy/10 animate-fadeInScale"
      >
        <h2 className="text-3xl font-heading font-semibold mb-2 text-center flex items-center justify-center gap-2">
          Sign In
        </h2>

        {/* Email Input */}
        <div className="mb-4 relative animate-fadeInScale">
          <label htmlFor="email" className="block text-sm font-medium text-burgundy/80 mb-1">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-burgundy/50">
              <FaEnvelope />
            </span>
            <input
              type="email"
              id="email"
              ref={emailRef}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-burgundy/20 bg-white/40 placeholder-burgundy/50 text-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy transition-all duration-300"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-6 relative animate-fadeInScale">
          <label htmlFor="password" className="block text-sm font-medium text-burgundy/80 mb-1">
            Password
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-burgundy/50">
              <FaLock />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-burgundy/20 bg-white/40 placeholder-burgundy/50 text-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy transition-all duration-300"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-burgundy/50 hover:text-burgundy transition"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition-all duration-300 ${
            loading
              ? "bg-burgundy/50 cursor-not-allowed"
              : "bg-gradient-to-r from-burgundy to-rose-600 hover:opacity-90"
          }`}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="text-center text-sm text-burgundy/70 mt-4">
          Don’t have an account?{" "}
          <a href="/register" className="text-burgundy font-medium hover:underline">
            Register here
          </a>
        </p>
      </form>
    </div>
  );
}
