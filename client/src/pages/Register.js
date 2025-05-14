import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaEnvelope, FaUser, FaLock } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = () => {
    if (form.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters.");
      return false;
    }
    if (!emailRegex.test(form.email)) {
      toast.error("Invalid email address.");
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

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, form);
      toast.success(res.data.message || "✅ Registration successful!");
      setForm({ name: "", email: "", password: "", role: "customer" });
    } catch (err) {
      toast.error(err.response?.data?.error || "❌ Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-ivory text-burgundy animate-fadeIn">
      <ToastContainer position="top-center" autoClose={2500} />

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[rgba(255,255,255,0.45)] backdrop-blur-lg border border-burgundy/20 shadow-md shadow-burgundy/10 p-8 rounded-xl animate-fadeInScale"
      >
        <h2 className="text-3xl font-heading font-semibold mb-4 text-center">
          Create Account
        </h2>

        {/* Full Name */}
        <div className="mb-4 relative">
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Full Name
          </label>
          <span className="absolute left-3 top-[38px] text-burgundy/60">
            <FaUser />
          </span>
          <input
            type="text"
            id="name"
            placeholder="Your name"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-burgundy/20 bg-white/40 placeholder-burgundy/50 text-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy transition-all duration-300"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4 relative">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <span className="absolute left-3 top-[38px] text-burgundy/60">
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

        {/* Password */}
        <div className="mb-4 relative">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <span className="absolute left-3 top-[38px] text-burgundy/60">
            <FaLock />
          </span>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-burgundy/20 bg-white/40 placeholder-burgundy/50 text-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy transition-all duration-300"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        {/* Role Select */}
        <div className="mb-6">
          <label htmlFor="role" className="block text-sm font-medium mb-1">
            Register As
          </label>
          <select
            id="role"
            className="w-full px-4 py-2 rounded-lg border border-burgundy/20 bg-white/40 text-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy transition"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="customer">Customer</option>
            <option value="owner">Shop Owner</option>
          </select>
        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-burgundy to-rose-600 text-white font-semibold hover:opacity-90 transition-all duration-300"
        >
          Register
        </button>

        <p className="text-center text-sm text-burgundy/70 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-burgundy font-medium hover:underline">
            Login here
          </a>
        </p>
      </form>
    </div>
  );
}
