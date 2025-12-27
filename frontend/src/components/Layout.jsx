import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../utils/images";

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const cartCount = getCartItemCount();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <nav className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src={getImageUrl("logo.jpeg")}
                  alt="PAW INTERNATIONAL"
                  className="h-12 w-auto"
                  style={{ display: "block", maxWidth: "120px" }}
                  onError={(e) => {
                    console.error("Logo failed to load:", e.target.src);
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-primary-600 leading-tight">
                    PAW
                  </span>
                  <span className="text-sm font-semibold text-primary-700 uppercase tracking-wide">
                    INTERNATIONAL
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    to="/account"
                    className="text-sm hover:text-primary-600 transition-colors"
                  >
                    Account
                  </Link>
                  {isAdmin() && (
                    <Link
                      to="/admin"
                      className="text-sm hover:text-primary-600 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm hover:text-primary-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link to="/register" className="text-sm btn-primary">
                    Sign Up
                  </Link>
                </>
              )}
              <Link
                to="/cart"
                className="relative hover:text-primary-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex items-center justify-center py-4 bg-gradient-to-r from-primary-50 via-accent-50 to-primary-50">
            <div className="flex items-center gap-8">
              <Link
                to="/products?category=dogs"
                className="text-sm font-bold hover:text-primary-700 transition-colors uppercase tracking-wider text-gray-800 hover:scale-105 transform transition-transform"
              >
                DOG MATS
              </Link>
              <Link
                to="/products?category=cats"
                className="text-sm font-bold hover:text-accent-700 transition-colors uppercase tracking-wider text-gray-800 hover:scale-105 transform transition-transform"
              >
                CAT MATS
              </Link>
              <Link
                to="/products"
                className="text-sm font-bold hover:text-primary-700 transition-colors uppercase tracking-wider text-gray-800 hover:scale-105 transform transition-transform"
              >
                SHOP ALL
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-gradient-to-br from-primary-800 via-primary-900 to-accent-800 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <img
                  src={getImageUrl("logo.jpeg")}
                  alt="PAW PK"
                  className="h-12 w-auto"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
              <p className="text-gray-400 text-sm">
                Premium orthopedic pet mats for your furry friends in Pakistan.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 uppercase text-sm tracking-wide">
                Shop
              </h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link
                    to="/products?category=dogs"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Dog Mats
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products?category=cats"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Cat Mats
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="hover:text-primary-400 transition-colors"
                  >
                    All Products
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 uppercase text-sm tracking-wide">
                Customer
              </h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link
                    to="/account"
                    className="hover:text-primary-400 transition-colors"
                  >
                    My Account
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cart"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Shopping Cart
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Track Order
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 uppercase text-sm tracking-wide">
                Contact
              </h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Email: thepawinternational@gmail.com</li>
                <li>Phone: +92 322-4839983</li>
                <li className="pt-2">
                  <a
                    href="#"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Returns
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2024 PAW PK. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
