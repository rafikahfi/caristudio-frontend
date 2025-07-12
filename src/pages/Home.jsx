import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStudios } from "../services/studioAPI";
// Membuat Animasi Loading pada Thumbnail
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

function Home() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("kecamatan");
  const [selectedOption, setSelectedOption] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [loadingServerCheck, setLoadingServerCheck] = useState(true); // baru
  const [studios, setStudios] = useState([]);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL; // ← dari .env

  useEffect(() => {
    const cekBackend = async () => {
      try {
        const res = await fetch(`${BASE_URL}/ping`);
        if (!res.ok) throw new Error("Server tidak OK");
        setServerError(false);
      } catch (err) {
        console.error("Gagal konek ke backend:", err);
        setServerError(true);
      } finally {
        setLoadingServerCheck(false); // selalu selesai loading
      }
    };

    cekBackend();
  }, []);

  useEffect(() => {
    const fetchStudios = async () => {
      try {
        const data = await getAllStudios();
        setStudios(data.sort(() => Math.random() - 0.5)); // acak urutannya
      } catch (error) {
        console.error("Gagal mengambil data studio:", error);
      }
    };

    fetchStudios();
  }, []);

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    if (studios.length === 0) return;

    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % studios.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [studios]);

  const navigate = useNavigate();

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

  const wrapperRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    let animationFrame;
    const scrollAmount = 0.5;

    const animate = () => {
      if (!isPaused && wrapperRef.current && contentRef.current) {
        const wrapper = wrapperRef.current;
        wrapper.scrollLeft += scrollAmount;

        if (wrapper.scrollLeft >= contentRef.current.scrollWidth / 2) {
          wrapper.scrollLeft = 0;
        }
      }
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPaused]);

  // ✅ LOGIKA BARU: kirim q + kecamatan/kabupaten sekaligus (AND)
  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const trimmedQuery = query.trim();
    const trimmedOption = selectedOption.trim();

    if (!trimmedQuery && !trimmedOption) {
      alert("Masukkan kata kunci atau pilih lokasi terlebih dahulu.");
      return;
    }

    const params = new URLSearchParams();

    if (trimmedQuery) {
      // Tetap tampilkan sesuai input user
      params.append("q", trimmedQuery); // jangan pakai toLowerCase di sini
      // Tapi kamu bisa ubah di backend jadi lowercase saat pencarian
    }

    if (trimmedOption) {
      const paramKey = searchType === "kabupaten" ? "kabupaten" : "kecamatan";
      params.append(paramKey, trimmedOption);
    }

    navigate(`/hasil?${params.toString()}`);
  };

  if (loadingServerCheck) {
    return <p className="text-center mt-10 text-gray-600">Mengecek koneksi ke server...</p>;
  }

  if (serverError) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-xl font-semibold text-red-600">Oops! Server tidak dapat dihubungi</h2>
        <p className="text-gray-500 mt-2">Pastikan server sudah berjalan.</p>
      </div>
    );
  }

  return (
    <div className="sm:px-9 text-center pt-10">
      <h1 className="text-4xl sm:text-5xl font-bold mb-6">Mau Kemana?</h1>

      {/* 🎠 Carousel Kecamatan + Kabupaten */}
      <div ref={wrapperRef} className="overflow-hidden py-4 mx-auto" style={{ width: "100%", maxWidth: "900px" }} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
        <div ref={contentRef} className="flex gap-3 whitespace-nowrap px-4" style={{ minWidth: "200%" }}>
          {[...daftarKecamatan, ...daftarKabupaten, ...daftarKecamatan, ...daftarKabupaten].map((item, i) => (
            <button
              key={`${item}-${i}`}
              onClick={() => {
                const isKabupaten = daftarKabupaten.includes(item);
                const paramKey = isKabupaten ? "kabupaten" : "kecamatan";
                navigate(`/hasil?${paramKey}=${encodeURIComponent(item.toLowerCase())}`);
              }}
              className="cursor-pointer text-base sm:text-lg text-gray-800 relative sm:px-3 transition-all hover:text-merah"
            >
              <span className="after:content-[''] after:block after:h-[2px] after:bg-merah after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100">{item}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 🔍 Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col items-center gap-3 mt-6 px-4">
        {/* 🔍 Search Bar Wrapper */}
        <div className="flex flex-wrap sm:flex-nowrap items-center sm:gap-3 bg-white border border-gray-300 shadow-md rounded-full px-5 py-3 w-full sm:max-w-3xl focus-within:ring-2 focus-within:ring-merah-400">
          {/* 🔍 Input */}
          <div className="relative flex-1 min-w-[0]">
            <div className="absolute sm:left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {/* ikon kaca pembesar */}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="text-black">
                <path
                  fill="currentColor"
                  d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3zM9.5 14q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"
                />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari studio musik..."
              className="w-full pl-6 sm:pl-10 py-2 text-sm rounded-full placeholder:text-gray-500 focus:outline-none bg-transparent"
            />
          </div>

          {/* 🔽 Jenis Lokasi + Pilihan Lokasi (desktop only) */}
          <div className="hidden sm:flex gap-2">
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
              {(searchType === "kabupaten" ? daftarKabupaten : daftarKecamatan).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* 🔘 Tombol Cari */}

          <button
            type="submit"
            className="flex-shrink-0 flex items-center justify-center gap-2 bg-merah hover:bg-merah-200 active:bg-merah-400 text-white font-medium px-2.5 sm:px-5 py-2 rounded-full transition text-sm whitespace-nowrap cursor-pointer"
          >
            {/* Ikon kaca pembesar (selalu tampil) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-white">
              <path
                fill="currentColor"
                d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3zM9.5 14q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"
              />
            </svg>

            {/* Teks "Cari" hanya muncul di sm ke atas */}
            <span className="hidden sm:inline">Cari</span>
          </button>
        </div>

        {/* 🔘 Tombol Filter Lokasi (mobile only) */}
        <button type="button" onClick={() => setShowFilter((prev) => !prev)} className="sm:hidden text-merah font-medium text-sm underline mt-3">
          {showFilter ? "Sembunyikan Filter Lokasi" : "Filter Lokasi"}
        </button>

        {/* 🔽 Filter Lokasi (mobile only) */}
        {showFilter && (
          <div className="sm:hidden w-full max-w-3xl flex flex-col gap-2">
            <select
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value);
                setSelectedOption("");
              }}
              className="w-full border border-gray-300 rounded-full py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-merah-400  bg-white"
            >
              <option value="kecamatan">Kecamatan</option>
              <option value="kabupaten">Kabupaten</option>
            </select>

            <select value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)} className="w-full border border-gray-300 rounded-full py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-merah-400 bg-white">
              <option value="">Pilih {searchType === "kabupaten" ? "Kabupaten" : "Kecamatan"}</option>
              {(searchType === "kabupaten" ? daftarKabupaten : daftarKecamatan).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        )}
      </form>
      {/* 🟥 Hero Section Slideshow (TAMPIL DI BAWAH FORM) */}
      <div className="bg-merah rounded-3xl mx-4 mb-10 sm:mx-10 mt-15 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-white shadow-md">
        {/* Gambar Hero */}
        <div className="w-full sm:w-1/2 rounded-2xl overflow-hidden aspect-[16/9] bg-black">
          <LazyLoadImage
            src={studios.length > 0 ? (studios[currentHeroIndex]?.thumbnail?.startsWith("http") ? studios[currentHeroIndex].thumbnail : `${BASE_URL}/${studios[currentHeroIndex]?.thumbnail?.replace(/^\/?/, "")}`) : "/default.jpg"}
            alt={studios[currentHeroIndex]?.nama || "Studio"}
            effect="blur"
            placeholderSrc="/default.jpg"
            loading="eager"
            className="w-full h-full object-cover transition-transform duration-300 sm:hover:scale-105"
            wrapperClassName="w-full h-full"
          />
        </div>

        {/* Deskripsi dan Tombol */}
        <div className="flex flex-col text-left sm:w-1/2">
          <h2 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">Telusuri Studio Favoritmu</h2>
          <p className="text-base sm:text-lg mb-4 text-white/90">Studio-studio ini dipilih secara acak dari berbagai wilayah di Bekasi. Klik untuk melihat detailnya.</p>
          <button
            onClick={() => navigate(`/detail/${studios[currentHeroIndex]?.id}`)} // ⬅️ ini bro!
            className="bg-white text-merah font-semibold px-5 py-2 rounded-full hover:bg-gray-100 transition cursor-pointer self-end sm:self-start"
          >
            Lihat Studio Ini
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
