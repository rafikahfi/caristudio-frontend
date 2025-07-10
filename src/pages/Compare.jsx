import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom"; // ✅ Tambahan penting
import { getAllStudios } from "../services/studioAPI";
import dummyData from "../data/dummy_studios_500.json";

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

function Compare() {
  const isAdmin = () => localStorage.getItem("admin") === "true";

  if (!isAdmin()) {
    return <Navigate to="/notauthorized" replace />;
  }

  const [query, setQuery] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [searchType, setSearchType] = useState("kecamatan");
  const [allData, setAllData] = useState([]);
  const [hasil, setHasil] = useState([]);
  const [info, setInfo] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const real = await getAllStudios();
        setAllData([...real, ...dummyData]);
      } catch {
        console.warn("Gagal ambil data asli, hanya pakai dummy");
        setAllData(dummyData);
      }
    };
    fetchData();
  }, []);

  const matchStudio = (studio) => {
    const namaMatch = query ? studio.nama?.toLowerCase().includes(query.toLowerCase()) : true;
    const lokasiValue = (studio.kecamatan || "").toLowerCase();
    const lokasiMatch = lokasi ? lokasiValue.includes(lokasi.toLowerCase()) : true;
    return namaMatch && lokasiMatch;
  };

  const runSearch = (algoritma) => {
    if (algoritma === "binary") {
      if (!query.trim() && !lokasi.trim()) {
        alert("Masukkan nama studio atau lokasi untuk menggunakan Binary Search.");
        return;
      }
    }

    const start = performance.now();
    let steps = 0;
    let results = [];

    if (algoritma === "sequential") {
      for (let i = 0; i < allData.length; i++) {
        steps++;
        if (matchStudio(allData[i])) {
          results.push(allData[i]);
          if (!showAll) break;
        }
      }
    } else {
      let sorted, target, valueType;

      if (query.trim()) {
        sorted = [...allData].sort((a, b) =>
          (a.nama || "")
            .toLowerCase()
            .trim()
            .localeCompare((b.nama || "").toLowerCase().trim())
        );
        target = query.toLowerCase().trim();
        valueType = "nama";
      } else {
        sorted = [...allData].sort((a, b) =>
          (a.kecamatan || "")
            .toLowerCase()
            .trim()
            .localeCompare((b.kecamatan || "").toLowerCase().trim())
        );
        target = lokasi.toLowerCase().trim();
        valueType = "kecamatan";
      }

      let low = 0,
        high = sorted.length - 1;
      while (low <= high) {
        steps++;
        const mid = Math.floor((low + high) / 2);
        const value = (sorted[mid][valueType] || "").toLowerCase().trim();

        if (value === target) {
          // ✅ Tambahkan validasi ganda
          if ((!query.trim() || (sorted[mid].nama || "").toLowerCase().trim() === query.toLowerCase().trim()) && (!lokasi.trim() || (sorted[mid].kecamatan || "").toLowerCase().trim() === lokasi.toLowerCase().trim())) {
            results.push(sorted[mid]);
          }

          if (showAll) {
            // Cek kiri
            let left = mid - 1;
            while (left >= 0) {
              const leftVal = (sorted[left][valueType] || "").toLowerCase().trim();
              if (leftVal !== target) break;

              if ((!query.trim() || (sorted[left].nama || "").toLowerCase().trim() === query.toLowerCase().trim()) && (!lokasi.trim() || (sorted[left].kecamatan || "").toLowerCase().trim() === lokasi.toLowerCase().trim())) {
                results.push(sorted[left]);
              }
              steps++;
              left--;
            }

            // Cek kanan
            let right = mid + 1;
            while (right < sorted.length) {
              const rightVal = (sorted[right][valueType] || "").toLowerCase().trim();
              if (rightVal !== target) break;

              if ((!query.trim() || (sorted[right].nama || "").toLowerCase().trim() === query.toLowerCase().trim()) && (!lokasi.trim() || (sorted[right].kecamatan || "").toLowerCase().trim() === lokasi.toLowerCase().trim())) {
                results.push(sorted[right]);
              }
              steps++;
              right++;
            }
          }

          break;
        } else if (value < target) {
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
    }

    const end = performance.now();
    setHasil(results);
    setInfo({
      algoritma,
      waktu: `${(end - start).toFixed(2)} ms`,
      langkah: steps,
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-merah">Perbandingan Algoritma Pencarian</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input type="text" placeholder="Cari nama studio..." value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 border border-gray-300 rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-merah" />
        <select
          value={searchType}
          onChange={(e) => {
            setSearchType(e.target.value);
            setLokasi("");
          }}
          className="border border-gray-300 rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-merah"
        >
          <option value="kecamatan">Kecamatan</option>
          <option value="kabupaten">Kabupaten</option>
        </select>
        <select value={lokasi} onChange={(e) => setLokasi(e.target.value)} className="border border-gray-300 rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-merah">
          <option value="">Pilih lokasi</option>
          {(searchType === "kabupaten" ? daftarKabupaten : daftarKecamatan).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm mb-4 text-gray-600">
        <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="accent-merah" />
        Tampilkan semua hasil yang cocok
      </label>

      <div className="flex gap-4 mb-6">
        <button onClick={() => runSearch("sequential")} className="bg-merah hover:bg-red-700 text-white px-6 py-2 rounded-full transition duration-200 cursor-pointer">
          Sequential Search
        </button>
        <button onClick={() => runSearch("binary")} className="bg-gray-500 hover:bg-gray-400 text-white px-6 py-2 rounded-full transition duration-200 cursor-pointer">
          Binary Search
        </button>
      </div>

      <p className="text-sm text-gray-500 italic mb-6">Binary Search hanya cocok untuk pencocokan nama yang persis (exact match)</p>

      {hasil.length > 0 ? (
        <div className="space-y-6">
          {hasil.map((studio, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
              <h2 className="text-xl font-bold text-merah mb-2">{studio.nama}</h2>
              <p className="text-gray-700 mb-1">Kecamatan: {studio.kecamatan || "-"}</p>
              <p className="text-gray-700 mb-1">Alamat: {studio.alamat || "-"}</p>
              <p className="text-gray-700 mb-1">No. Telp: {studio.no_telp || "-"}</p>
              <p className="text-gray-700 mb-1">Harga: Rp{studio.harga_per_jam?.toLocaleString() || "0"}</p>
              <p className="text-gray-700 mb-1">
                Jam Operasional: {studio.jam_operasional?.buka || "-"} - {studio.jam_operasional?.tutup || "-"}
              </p>
            </div>
          ))}
          <div className="mt-6 text-sm text-gray-600 border-t pt-4">
            <p>
              Algoritma: <strong>{info.algoritma}</strong>
            </p>
            <p>
              Waktu Eksekusi: <strong>{info.waktu}</strong>
            </p>
            <p>
              Jumlah Langkah: <strong>{info.langkah}</strong>
            </p>
          </div>
        </div>
      ) : (
        info && <div className="text-red-600 font-semibold mt-4">Data tidak ditemukan.</div>
      )}
    </div>
  );
}

export default Compare;
