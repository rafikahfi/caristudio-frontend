import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // ✅ Auto-redirect kalau udah login
  useEffect(() => {
    if (localStorage.getItem("admin") === "true") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("admin", "true");
        alert("Login berhasil sebagai admin!");
        navigate("/"); // atau "/dashboard" nanti
      } else {
        alert(data.message || "Email atau password salah!");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat login.");
      console.error("❌ Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-lg overflow-hidden max-w-3xl w-full">
        {/* KANAN DI DESKTOP, ATAS DI MOBILE */}
        <div className="w-full md:w-1/2 bg-gradient-to-r from-merah-200 to-merah flex flex-col justify-center text-white p-8 text-center md:text-left">
          <h2 className="text-3xl font-bold mb-2">
            Welcome to <span className="font-oswald">CariStudio</span>
          </h2>
          <p className="mb-4 text-sm font-semibold text-center md:text-right">Admin only.</p>
        </div>

        {/* KIRI DI DESKTOP, BAWAH DI MOBILE */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center md:text-left ">Login</h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input type="email" placeholder="Email" className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-merah-400" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-merah-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="w-full bg-merah text-white font-semibold py-3 rounded-full hover:opacity-90 transition cursor-pointer">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
