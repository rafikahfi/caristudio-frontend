import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showShare, setShowShare] = useState(false); // <== tambahan buat fallback modal

  const isAdmin = localStorage.getItem("admin") === "true";

  useEffect(() => {
    setActiveLink(pathname);
    setMenuOpen(false); // Tutup menu saat pindah halaman
    setShowShare(false); // Tutup modal share juga saat navigasi
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    alert("Berhasil logout.");
    navigate("/secret");
  };

  const handleShare = async () => {
    const shareData = {
      title: "CariStudio",
      text: "Cek studio musik keren di Bekasi!",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      setShowShare(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link berhasil disalin!");
    setShowShare(false);
  };

  // Styling
  const baseClass = "px-3 py-2 rounded-full transition-colors duration-200";
  const activeClass = "text-merah sm:bg-merah sm:text-white font-semibold";
  const inactiveClass = "text-gray-700 hover:text-merah";

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow border-b-2 border-b-gray-100">
      <div className="flex items-center justify-between px-6 sm:px-10 py-3 relative">
        {/* Logo */}
        <Link to="/" onClick={() => setActiveLink("/")} className="text-2xl text-merah font-semibold font-oswald">
          {isAdmin ? "Admin" : "CariStudio"}
        </Link>

        {/* Navigasi Tengah (Desktop) */}
        <div className={`hidden sm:flex ${isAdmin ? "absolute left-1/2 transform -translate-x-1/2" : "flex-1 justify-center"}`}>
          <ul className="flex gap-4 font-medium items-center">
            <li>
              <Link to="/" onClick={() => setActiveLink("/")} className={`${baseClass} ${activeLink === "/" ? activeClass : inactiveClass}`}>
                Beranda
              </Link>
            </li>
            <li>
              <Link to="/tentang" onClick={() => setActiveLink("/tentang")} className={`${baseClass} ${activeLink.startsWith("/tentang") ? activeClass : inactiveClass}`}>
                Tentang Kami
              </Link>
            </li>
            <li>
              <Link
                to="/hasil"
                onClick={() => setActiveLink("/hasil")}
                className={`${baseClass} ${activeLink.startsWith("/hasil") || activeLink.startsWith("/detail") || activeLink.startsWith("/edit") || activeLink.startsWith("/tambah") ? activeClass : inactiveClass}`}
              >
                Studio
              </Link>
            </li>
          </ul>
        </div>

        {/* Tombol Logout / Bagikan (Desktop) */}
        <div className="hidden sm:flex">
          {isAdmin ? (
            <button onClick={handleLogout} className="bg-merah hover:bg-merah-200 text-white font-semibold px-4 py-2 rounded-full transition cursor-pointer">
              Logout
            </button>
          ) : (
            <button onClick={handleShare} className="bg-merah hover:bg-merah-200 text-white font-semibold px-4 py-2 rounded-full transition cursor-pointer">
              Bagikan
            </button>
          )}
        </div>

        {/* Hamburger Menu (Mobile) */}
        <button className={`sm:hidden p-1.5 rounded-full transition-colors duration-150 ${menuOpen ? "bg-merah text-white" : "text-merah"}`} onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
        <ul className="flex flex-col gap-3 px-3 pt-3 font-medium bg-white">
          <li>
            <Link to="/" onClick={() => setActiveLink("/")} className={`${baseClass} ${activeLink === "/" ? "text-merah font-semibold" : "text-gray-700 hover:text-merah"}`}>
              Beranda
            </Link>
          </li>
          <li>
            <Link to="/tentang" onClick={() => setActiveLink("/tentang")} className={`${baseClass} ${activeLink.startsWith("/tentang") ? "text-merah font-semibold" : "text-gray-700 hover:text-merah"}`}>
              Tentang Kami
            </Link>
          </li>
          <li>
            <Link
              to="/hasil"
              onClick={() => setActiveLink("/hasil")}
              className={`${baseClass} ${
                activeLink.startsWith("/hasil") || activeLink.startsWith("/detail") || activeLink.startsWith("/edit") || activeLink.startsWith("/tambah") ? "text-merah font-semibold" : "text-gray-700 hover:text-merah"
              }`}
            >
              Studio
            </Link>
          </li>
        </ul>

        {/* Tombol Logout / Bagikan di Mobile */}
        <div className="flex justify-end px-6 pt-2 pb-4">
          {isAdmin ? (
            <button onClick={handleLogout} className="bg-merah hover:bg-merah-200 text-white font-semibold px-4 py-2 rounded-full shadow-md transition">
              Logout
            </button>
          ) : (
            <button onClick={handleShare} className="bg-merah hover:bg-merah-200 text-white font-semibold px-4 py-2 rounded-full shadow-md transition">
              Bagikan
            </button>
          )}
        </div>
      </div>

      {/* Fallback Share Dropdown (non-mobile) */}
      {showShare && (
        <div className="fixed top-20 right-4 bg-white shadow-lg border rounded-xl w-52 z-50">
          <button onClick={copyLink} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
            📋 Salin Link
          </button>
          <a href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100">
            🟢 WhatsApp
          </a>
          <button onClick={() => setShowShare(false)} className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100">
            ✖️ Tutup
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
