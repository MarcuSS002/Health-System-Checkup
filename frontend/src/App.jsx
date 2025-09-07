import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import AddMachines from "./components/AddMachines";
import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar";

function Layout() {
  const location = useLocation();

  return (
    <>
      {location.pathname === "/" && <Navbar />}  {/* Show only on home */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add" element={<AddMachines />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
