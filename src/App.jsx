import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BrowsePage from "./pages/BrowsePage";
import ItemDetailPage from "./pages/ItemDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import BookingConfirmPage from "./pages/BookingConfirmPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import OwnerBookingsPage from "./pages/OwnerBookingsPage";
import OwnerDashboard from "./pages/OwnerDashboard";
import AddItemPage from "./pages/AddItemPage";
import EditItemPage from "./pages/EditItemPage";
import AdminPanel from "./pages/AdminPanel";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import WishlistPage from "./pages/WishlistPage";
import ErrorBoundary from "./components/common/ErrorBoundary";

function Guard({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"          element={<HomePage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/register"  element={<RegisterPage />} />
          <Route path="/browse"    element={<BrowsePage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />

          <Route path="/cart" element={<Guard roles={["customer"]}><CartPage /></Guard>} />
          <Route path="/wishlist" element={<Guard roles={["customer"]}><WishlistPage /></Guard>} />
          <Route path="/checkout" element={<Guard roles={["customer"]}><CheckoutPage /></Guard>} />
          <Route path="/booking-confirm/:id" element={<Guard><BookingConfirmPage /></Guard>} />
          <Route path="/my-bookings" element={<Guard roles={["customer"]}><MyBookingsPage /></Guard>} />

          <Route path="/dashboard" element={<Guard roles={["owner","admin"]}><OwnerDashboard /></Guard>} />
          <Route path="/owner-bookings" element={<Guard roles={["owner","admin"]}><OwnerBookingsPage /></Guard>} />
          <Route path="/add-item"  element={<Guard roles={["owner","admin"]}><AddItemPage /></Guard>} />
          <Route path="/edit-item/:id" element={<Guard roles={["owner","admin"]}><EditItemPage /></Guard>} />

          <Route path="/admin"   element={<Guard roles={["admin"]}><AdminPanel /></Guard>} />
          <Route path="/profile" element={<Guard><ProfilePage /></Guard>} />
          <Route path="*"        element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#18182e",
            color: "#f0f0ff",
            border: "1px solid rgba(91,143,249,0.2)",
            borderRadius: "12px",
            fontFamily: "DM Sans, sans-serif",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
          error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </CartProvider>
    </AuthProvider>
  );
}
