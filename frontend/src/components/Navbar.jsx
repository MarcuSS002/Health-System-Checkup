import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full bg-neutral-900 text-gray-200 border-b border-gray-700 z-50">
      <div className="flex justify-between items-center w-full min-h-[64px] px-6 gap-6">
        
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/">
            <img
              src="https://e7.pngegg.com/pngimages/691/20/png-clipart-electronic-health-record-computer-icons-medical-record-health-care-graphics-ehr-text-logo.png"
              alt="Logo"
              className="h-12"
            />
          </Link>
        </div>

        {/* Search bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md bg-gray-800 rounded-lg px-3 py-1">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent outline-none text-gray-200 placeholder-gray-400"
          />
        </div>

        {/* Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="px-3 py-2 rounded-lg hover:bg-gray-800"
          >
            ☰
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/add");
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Add Machines
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
