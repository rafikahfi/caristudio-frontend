import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getStudiosByQuery } from "../services/studioAPI";
import Card from "../components/Card";
import Loading from "../components/Loading";

const sortOptions = [
  { name: "A - Z", value: "asc" },
  { name: "Z - A", value: "desc" },
];

const daftarKecamatan = ["Bantar Gebang", "Bekasi Barat", "Bekasi Selatan", "Bekasi Timur", "Bekasi Utara", "Jatiasih", "Jatisampurna", "Medan Satria", "Mustika Jaya", "Pondok Gede", "Pondok Melati", "Rawalumbu"];
const daftarKabupaten = [
  "Babelan",
  "Bojongmangu",
  "Cabangbungin",
  "Cibarusah",
  "Cibitung",
  "Cikarang Barat",
  "Cikarang Pusat",
  "Cikarang Selatan",
  "Cikarang Timur",
  "Cikarang Utara",
  "Karangbahagia",
  "Kedungwaringin",
  "Muara Gembong",
  "Pebayuran",
  "Serang Baru",
  "Setu",
  "Sukakarya",
  "Sukatani",
  "Sukawangi",
  "Tambelang",
  "Tambun Selatan",
  "Tambun Utara",
  "Tarumajaya",
];

function Hasil() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  /* ───────────────────── STATE ───────────────────── */
  const [showAll, setShowAll] = useState(false);
  const [visibleStudios, setVisibleStudios] = useState([]);
  const LIMIT = 6;
  const [filteredStudios, setFilteredStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("kecamatan");
  const [selectedOption, setSelectedOption] = useState("");

  /* ───────────────────── ROUTER ───────────────────── */
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  /* ───────────── ambil parameter URL ───────────── */
  const p = new URLSearchParams(location.search);
  const displayQuery = p.get("q")?.trim() || ""; // tampilkan ke user
  const urlQuery = displayQuery.toLowerCase(); // kirim ke backend

  const displayKecamatan = p.get("kecamatan")?.trim() || "";
  const urlKecamatan = displayKecamatan.toLowerCase();

  const displayKabupaten = p.get("kabupaten")?.trim() || "";
  const urlKabupaten = displayKabupaten.toLowerCase();

  /* ─────────────────── FETCH DATA ─────────────────── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // ── susun query params ───────────────────────────
        const qParams = {};
        if (urlQuery) qParams.q = urlQuery;
        if (urlKecamatan) qParams.kecamatan = urlKecamatan;
        if (urlKabupaten) qParams.kabupaten = urlKabupaten;

        // ── ambil data dari backend ─────────────────────
        const data = await getStudiosByQuery(qParams);

        // ── urutkan sesuai sortOrder ────────────────────
        const sorted = [...data].sort((a, b) => (sortOrder === "asc" ? a.nama.localeCompare(b.nama) : b.nama.localeCompare(a.nama)));

        /*  ▒▒▒  DELAY 300 ms  ▒▒▒
          Supaya spinner loading muncul sebentar
          dan transisi terlihat smooth               */
        setTimeout(() => {
          setFilteredStudios(sorted);
          setVisibleStudios(sorted.slice(0, LIMIT)); // tampil 6 dulu
          setLoading(false);
        }, 300);
      } catch (err) {
        console.error("❌ Fetch studio gagal:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchData();
  }, [urlQuery, urlKecamatan, urlKabupaten, sortOrder]);

  /* ───────────── tutup dropdown di luar klik ───────────── */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ─────────────────── SEARCH SUBMIT ─────────────────── */
  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (!query && !selectedOption) {
      alert("Masukkan kata kunci atau pilih lokasi terlebih dahulu.");
      return;
    }

    let params = [];

    if (query) params.push(`q=${encodeURIComponent(query)}`); // tampilkan apa adanya di URL
    if (selectedOption) {
      const paramKey = searchType === "kabupaten" ? "kabupaten" : "kecamatan";
      params.push(`${paramKey}=${encodeURIComponent(selectedOption.toLowerCase())}`);
    }

    navigate(`/hasil?${params.join("&")}`);
  };

  /* ─────────────────── FORMAT JUDUL ─────────────────── */
  const formatJudul = () => {
    const kec = displayKecamatan
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    const kab = displayKabupaten
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

    if (displayQuery && displayKecamatan) return `Hasil Pencarian untuk "${displayQuery}" di Kecamatan: "${kec}"`;
    if (displayQuery && displayKabupaten) return `Hasil Pencarian untuk "${displayQuery}" di Kabupaten: "${kab}"`;
    if (displayKecamatan) return `Hasil Pencarian Berdasarkan Kecamatan: "${kec}"`;
    if (displayKabupaten) return `Hasil Pencarian Berdasarkan Kabupaten: "${kab}"`;
    if (displayQuery) return `Hasil Pencarian: "${displayQuery}"`;
    return `Hasil Pencarian: "Semua Studio"`;
  };

  if (error) {
    return (
      <div className="text-center mt-20 px-4">
        <h2 className="text-xl font-semibold text-red-600">Oops! Gagal memuat data studio</h2>
        <p className="text-gray-500 mt-2">Cek koneksi internet atau pastikan server sedang berjalan.</p>
      </div>
    );
  }

  /* ───────────────────── JSX ───────────────────── */
  return (
    <div className="px-6">
      {/* 🔍 FORM PENCARIAN (selalu tampil) */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col items-center gap-3 sm:gap-4 mb-6 w-full sm:px-0 px-4">
        <div className="flex flex-wrap sm:flex-nowrap items-center sm:gap-3 bg-white border border-gray-300 shadow-md rounded-full px-5 py-3 w-full sm:max-w-3xl focus-within:ring-2 focus-within:ring-merah-400">
          {/* input */}
          <div className="relative flex-1 min-w-[0]">
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari studio musik..." className="w-full pl-8 pr-3 py-2 text-sm rounded-full placeholder:text-gray-500 focus:outline-none bg-transparent" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 pl-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="text-black">
                <path
                  fill="currentColor"
                  d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3zM9.5 14q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"
                />
              </svg>
            </div>
          </div>

          {/* select lokasi (desktop) */}
          <div className="hidden sm:flex gap-2 ml-3">
            <select
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value);
                setSelectedOption("");
              }}
              className="border border-gray-300 rounded-full py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-merah-400 bg-white cursor-pointer"
            >
              <option value="kecamatan">Kecamatan</option>
              <option value="kabupaten">Kabupaten</option>
            </select>
            <select value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)} className="border border-gray-300 rounded-full py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-merah-400 bg-white cursor-pointer">
              <option value="">Pilih {searchType === "kabupaten" ? "Kabupaten" : "Kecamatan"}</option>
              {(searchType === "kabupaten" ? daftarKabupaten : daftarKecamatan).map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>

          {/* tombol cari */}
          <button
            type="submit"
            className="flex-shrink-0 flex items-center justify-center gap-1 bg-merah hover:bg-merah-200 active:bg-merah-400 text-white font-medium px-2 sm:px-5 py-2 rounded-full transition text-sm whitespace-nowrap cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-white">
              <path
                fill="currentColor"
                d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3zM9.5 14q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"
              />
            </svg>
            <span className="hidden sm:inline ml-2">Cari</span>
          </button>
        </div>
      </form>

      {/* 🔽 URUTKAN + JUDUL */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 px-4 sm:px-0">
        {/* Judul */}
        <div className="sm:flex-1">
          <h2 className="text-xl text-merah-500 text-center sm:text-left">{formatJudul()}</h2>
        </div>

        {/* Dropdown Urutkan */}
        <div className="relative flex items-center gap-2 justify-center sm:justify-end" ref={dropdownRef}>
          <label className="text-sm font-medium">Urutkan:</label>
          <div className="relative w-fit">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="inline-flex items-center justify-between rounded-full bg-merah-200 text-white px-4 py-1.5 text-sm focus:outline-none ring-1 ring-merah-300 shadow hover:bg-merah-400 cursor-pointer"
            >
              {sortOptions.find((o) => o.value === sortOrder)?.name}
              <span className="ml-2 text-xs">▼</span>
            </button>
            <div className={`absolute mt-1 min-w-full bg-white rounded-lg shadow-md border border-gray-200 z-50 transition-all duration-150 origin-top ${dropdownOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
              {sortOptions.map((o, i) => (
                <button
                  key={o.value}
                  onClick={() => {
                    setSortOrder(o.value);
                    setDropdownOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-1.5 text-sm transition ${sortOrder === o.value ? "text-merah" : "hover:bg-merah-200 text-gray-700 hover:text-white"} ${i === 0 ? "rounded-t-lg" : ""} ${
                    i === sortOptions.length - 1 ? "rounded-b-lg" : ""
                  }`}
                >
                  {o.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fitur Tambah hanya Admin */}
      {localStorage.getItem("admin") === "true" && (
        <div className="flex justify-end mb-4 px-4 sm:px-0">
          <button onClick={() => navigate("/tambah")} className="bg-merah text-white px-3 py-1.5 rounded-full hover:bg-merah-200 transition text-xs sm:text-sm font-semibold shadow cursor-pointer">
            + Tambah Studio
          </button>
        </div>
      )}

      {/* 🖼️ GRID STUDIO */}
      {loading ? (
        <Loading />
      ) : filteredStudios.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {(showAll ? filteredStudios : visibleStudios).map((studio) => {
            const img = studio.thumbnail || studio.gambar?.[0] || "/default.jpg";
            const src = img.includes("http") ? `${img}?v=${Date.now()}` : `${BASE_URL}/${img.replace(/^\/?/, "")}?v=${Date.now()}`;
            return <Card key={studio.id} id={studio.id} title={studio.nama} description={`Rp ${studio.harga_per_jam?.toLocaleString() || "N/A"} / Jam`} thumbnail={src} />;
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-10">Tidak ada studio yang cocok dengan pencarian kamu.</p>
      )}
      {!showAll && visibleStudios.length < filteredStudios.length && (
        <div className="flex justify-center mt-6">
          <button onClick={() => setShowAll(true)} className="px-6 py-2 bg-merah text-white rounded-full shadow hover:bg-merah-400 transition text-sm">
            Lihat Semua Studio
          </button>
        </div>
      )}
    </div>
  );
}

export default Hasil;
