import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Register from "./pages/Register";
import Login from "./pages/Login";
import PlaceOrder from "./pages/PlaceOrder";
import OwnerDashboard from "./pages/OwnerDashboard";
import TrackOrder from "./pages/TrackOrder";
import MyOrders from "./pages/MyOrders";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Context
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-ivory text-burgundy font-sans transition-colors duration-300">
          <Navbar />

          <main className="flex-grow px-4 sm:px-8 py-6 animate-fadeIn">
            <Routes>
              {/* 🔓 Public Routes */}
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/track" element={<TrackOrder />} />

              {/* 🔒 Customer Routes */}
              <Route
                path="/customer/place"
                element={
                  <ProtectedRoute role="customer">
                    <PlaceOrder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/orders"
                element={
                  <ProtectedRoute role="customer">
                    <MyOrders />
                  </ProtectedRoute>
                }
              />

              {/* 🔒 Owner Route */}
              <Route
                path="/owner"
                element={
                  <ProtectedRoute role="owner">
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
