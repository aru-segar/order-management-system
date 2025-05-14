import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-burgundy/90 text-white shadow-glass backdrop-blur-glass border-b border-white/10 animate-fadeIn font-heading">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold tracking-wide hover:text-white/80 transition"
        >
          PizzaOMS
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden text-white text-2xl focus:outline-none"
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* Navigation Links */}
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } sm:flex sm:gap-6 items-center mt-4 sm:mt-0 w-full sm:w-auto text-sm`}
        >
          {auth.token && auth.role === "customer" && (
            <>
              <NavItem to="/customer/place" label="Place Order" />
              <NavItem to="/customer/orders" label="My Orders" />
              <NavItem to="/track" label="Track Order" />
            </>
          )}

          {auth.token && auth.role === "owner" && (
            <NavItem to="/owner" label="Owner Dashboard" />
          )}

          {!auth.token ? (
            <>
              <NavItem to="/login" label="Login" />
              <NavItem to="/register" label="Register" />
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-white/10 border border-white/20 hover:bg-white/20 text-white px-4 py-1.5 rounded-lg font-medium transition-all duration-300"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

// 👇 Reusable Link Item with underline animation
function NavItem({ to, label }) {
  return (
    <Link
      to={to}
      className="relative group font-medium text-white/80 hover:text-white transition-colors duration-300"
    >
      {label}
      <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );
}
