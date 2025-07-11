import { useParams, useNavigate, useLocation, useNavigationType } from "react-router-dom";
import { useEffect, useState } from "react";
import { getStudioById } from "../services/studioAPI";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const isAdmin = () => localStorage.getItem("admin") === "true"; // ✅ fungsi cek admin

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [studio, setStudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sliderInstance, setSliderInstance] = useState(null);
  const [imageRatios, setImageRatios] = useState({});
  const [jamMulai, setJamMulai] = useState("");
  const [durasi, setDurasi] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const location = useLocation();
  const navigationType = useNavigationType();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL; // ← dari .env
  const [sliderRef] = useKeenSlider(
    {
      loop: true,
      mode: "snap",
      slides: { perView: 1, spacing: 16 },
      breakpoints: {
        "(min-width: 640px)": { slides: { perView: 2, spacing: 16 } },
        "(min-width: 1024px)": { slides: { perView: 3, spacing: 20 } },
      },
    },
    [(slider) => setSliderInstance(slider)]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const fetchStudio = async () => {
      try {
        const data = await getStudioById(id);
        setStudio(data);
        setError(false);
      } catch (err) {
        console.error("❌ Gagal ambil studio:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStudio();
  }, [id]);

  useEffect(() => {
    if (location.state?.fromEdit) {
      const timeout = setTimeout(() => {
        window.history.replaceState(null, "", window.location.pathname);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [location.state]);

  const resolveImageUrl = (img) => {
    if (!img || typeof img !== "string") return "/default.jpg";
    const cleanPath = img.replace(/^\/+/, ""); // hapus semua leading slash
    return `${BASE_URL}/${cleanPath}?v=${Date.now()}`;
  };

  const handleImageLoad = (e, idx) => {
    const img = e.target;
    const ratio = img.naturalWidth / img.naturalHeight;
    setImageRatios((prev) => ({ ...prev, [idx]: ratio }));
  };

  const formatJamOperasional = (jam) => {
    if (!jam || typeof jam !== "object") return "-";
    const buka = jam.buka?.trim();
    const tutup = jam.tutup?.trim();
    if (buka && tutup) return `${buka} - ${tutup}`;
    return buka || tutup || "-";
  };

  const isValidLatLng = (lokasi) => {
    return lokasi && typeof lokasi.lat === "number" && typeof lokasi.lng === "number" && !isNaN(lokasi.lat) && !isNaN(lokasi.lng);
  };

  const parseTime = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  // 🔄 VALIDASI BARU – mencegah booking melewati jam tutup
  const isWithinOperationalHours = () => {
    if (!studio?.jam_operasional || !jamMulai || !durasi) return false;

    const bukaStr = studio.jam_operasional.buka;
    const tutupStr = studio.jam_operasional.tutup;
    const durasiJam = parseInt(durasi, 10);

    if (!bukaStr || !tutupStr || isNaN(durasiJam) || durasiJam <= 0) return false;

    const buka = parseTime(bukaStr);
    const tutup = parseTime(tutupStr);
    const mulai = parseTime(jamMulai);
    const selesaiRaw = mulai + durasiJam * 60; // tanpa % 1440 supaya ketahuan jika lewat hari

    // Studio tutup di hari yang sama (contoh: 11:00 – 23:00)
    if (buka < tutup) {
      return mulai >= buka && selesaiRaw <= tutup;
    }

    // Studio lintas hari (contoh: 22:00 – 03:00)
    const bukaAdj = buka; // titik awal
    const tutupAdj = tutup + 1440; // tambahkan 24 jam
    const mulaiAdj = mulai < buka ? mulai + 1440 : mulai;
    const selesaiAdj = mulaiAdj + durasiJam * 60;

    return mulaiAdj >= bukaAdj && selesaiAdj <= tutupAdj;
  };

  const generateWhatsAppLink = () => {
    if (!studio?.no_telp || !studio?.nama || !jamMulai || !durasi) return null;

    let phone = studio.no_telp.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "62" + phone.slice(1);

    const pesan = `Halo, gua mau booking studio musik di *${studio.nama}*.\n\nJam mulai: ${jamMulai}\nDurasi: ${durasi} jam\n\nKosong ga?\nMohon konfirmasinya ya, terima kasih`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(pesan)}`;
  };

  const handlePesanClick = (e) => {
    e.preventDefault();

    if (!jamMulai || !durasi) {
      alert("Harap lengkapi jam mulai dan durasi sebelum memesan.");
      return;
    }

    if (!isWithinOperationalHours()) {
      alert("Jam mulai atau selesai berada di luar jam operasional studio.");
      return;
    }

    const lanjut = window.confirm("Kamu akan diarahkan ke WhatsApp. Lanjutkan?");
    if (!lanjut) return;

    const waLink = generateWhatsAppLink();
    window.open(waLink, "_blank");
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Memuat detail studio…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-red-600">Oops! Gagal memuat detail studio</h2>
        <p className="text-gray-500 mt-2">Cek koneksi internet atau pastikan server sedang berjalan.</p>
      </div>
    );
  }

  if (!studio) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-red-600">Studio tidak ditemukan</h2>
        <p className="text-gray-500 mt-2">Pastikan ID studio valid atau hubungi admin jika ini seharusnya ada.</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6  mx-auto max-w-6xl">
      <h2 className="text-3xl font-bold mb-1 text-gray-800">{studio.nama}</h2>
      <p className="text-sm text-gray-500 mb-2">{studio.kecamatan}</p>
      <p className="text-lg font-semibold text-gray-700 mb-4">Rp {parseInt(studio.harga_per_jam || 0).toLocaleString("id-ID")}/Jam</p>

      {/* Galeri */}
      <div className="relative mb-8">
        <PhotoProvider>
          {studio.gambar && studio.gambar.length > 0 ? (
            <div ref={sliderRef} className="keen-slider px-1 sm:px-0">
              {studio.gambar.map((img, idx) => {
                const url = resolveImageUrl(img);
                const isPortrait = imageRatios[idx] && imageRatios[idx] < 1;
                return (
                  <PhotoView key={idx} src={url}>
                    <div className="keen-slider__slide">
                      <div className="rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center bg-black">
                        <img
                          src={url}
                          alt={`Studio ${idx + 1}`}
                          onLoad={(e) => handleImageLoad(e, idx)}
                          className={`w-full h-full cursor-pointer transition-transform duration-300 hover:scale-105 ${isPortrait ? "object-contain" : "object-cover"}`}
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </PhotoView>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic mb-8">Tidak ada gambar tersedia.</p>
          )}
        </PhotoProvider>

        {studio.gambar && studio.gambar.length > 1 && (
          <>
            <button onClick={() => sliderInstance?.prev()} className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow p-2 z-10" aria-label="Previous">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => sliderInstance?.next()} className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow p-2 z-10" aria-label="Next">
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      <p className="mb-4 text-gray-700 whitespace-pre-line">{studio.deskripsi || "Belum ada deskripsi."}</p>
      <p className="mb-2">
        <strong>Alamat:</strong> {studio.alamat || "-"}
      </p>
      <p className="mb-2">
        <strong>Telepon:</strong> {studio.no_telp || "-"}
      </p>
      <p className="mb-6">
        <strong>Jam Operasional:</strong> {formatJamOperasional(studio.jam_operasional)}
      </p>

      {/* Peta */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-2">Lokasi Studio:</h3>
        {isValidLatLng(studio.lokasi) ? (
          <MapContainer center={[studio.lokasi.lat, studio.lokasi.lng]} zoom={16} scrollWheelZoom={false} className="w-full h-[300px] rounded-xl z-0">
            <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[studio.lokasi.lat, studio.lokasi.lng]}>
              <Popup>{studio.nama}</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <p className="text-sm text-red-500 italic">📍 Lokasi belum tersedia.</p>
        )}
      </div>

      {/* Tombol Aksi */}
      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={() => (isValidLatLng(studio.lokasi) ? window.open(`https://www.google.com/maps?q=${studio.lokasi.lat},${studio.lokasi.lng}`, "_blank") : alert("Lokasi tidak tersedia"))}
          className="bg-stone-200 hover:bg-gray-300 px-6 py-3 rounded-xl font-semibold w-full md:w-auto cursor-pointer"
        >
          Lihat Peta
        </button>
        {isAdmin() && (
          <button onClick={() => navigate(`/edit/${studio._id || studio.id}`)} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold w-full md:w-auto cursor-pointer">
            Edit Studio
          </button>
        )}

        <button onClick={() => setFormVisible((prev) => !prev)} className="bg-merah hover:bg-merah-200 text-white px-6 py-3 rounded-xl font-semibold w-full md:w-auto cursor-pointer">
          {formVisible ? "Tutup Form" : "Pesan Sekarang"}
        </button>
      </div>

      {/* Form Pemesanan */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${formVisible ? "max-h-[999px] opacity-100 mt-6" : "max-h-0 opacity-0 pointer-events-none"}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
            <input type="time" value={jamMulai} onChange={(e) => setJamMulai(e.target.value)} className="w-full border rounded-lg px-4 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (jam)</label>
            <input
              type="number"
              min="1"
              value={durasi}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setDurasi(isNaN(value) ? "" : value.toString());
              }}
              className="w-full border rounded-lg px-4 py-2 text-sm"
              placeholder="Contoh: 2"
            />
          </div>
          <div className="md:col-span-2 mt-4 text-center flex flex-col items-center gap-3">
            <p className="text-sm text-gray-500">⚠️ Jika pesan tidak muncul di WhatsApp, simpan dulu kontak studio lalu ulangi pemesanan.</p>

            <button onClick={handlePesanClick} className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-semibold w-full sm:w-auto cursor-pointer">
              Konfirmasi & Pesan via WhatsApp
            </button>

            <button
              onClick={() => {
                if (!jamMulai || !durasi) {
                  alert("Harap lengkapi jam mulai dan durasi sebelum menyalin pesan.");
                  return;
                }

                const pesan = `Halo, gua mau booking studio musik di *${studio.nama}*.\n\nJam mulai: ${jamMulai}\nDurasi: ${durasi} jam\n\nKosong ga?\nMohon konfirmasinya ya, terima kasih`;

                navigator.clipboard.writeText(pesan);
                alert("✅ Pesan berhasil disalin!\nSilakan tempel (paste) di WhatsApp secara manual.");
              }}
              className="text-sm text-gray-600 underline hover:text-gray-800 mt-2 mb-6 cursor-pointer"
            >
              Salin pesan saja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Detail;
