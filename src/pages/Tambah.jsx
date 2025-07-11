import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { useNavigate } from "react-router-dom";
import NotAuthorized from "./NotAuthorized";

const isAdmin = () => localStorage.getItem("admin") === "true";
function Tambah() {
  if (!isAdmin()) {
    return <NotAuthorized />;
  }
  const [formData, setFormData] = useState({
    nama: "",
    kecamatan: "",
    deskripsi: "",
    alamat: "",
    no_telp: "",
    harga_per_jam: "",
    jam_operasional_buka: "00:00",
    jam_operasional_tutup: "23:59",
    latitude: "",
    longitude: "",
  });
  const daftarWilayah = [
    // Kecamatan Kota Bekasi
    "Bantar Gebang",
    "Bekasi Barat",
    "Bekasi Selatan",
    "Bekasi Timur",
    "Bekasi Utara",
    "Medan Satria",
    "Mustika Jaya",
    "Pondok Gede",
    "Pondok Melati",
    "Rawalumbu",
    // Kabupaten Bekasi
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

  const [gambarPreview, setGambarPreview] = useState([]);
  const [originalFile, setOriginalFile] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHargaChange = (e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, "");
    const formatted = new Intl.NumberFormat("id-ID").format(Number(onlyNumbers));
    setFormData((prev) => ({ ...prev, harga_per_jam: formatted }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    const validFiles = files.filter((file) => allowedTypes.includes(file.type));
    if (validFiles.length !== files.length) {
      alert("❌ Hanya file gambar (.jpg, .jpeg, .png, .webp) yang diperbolehkan.");
      return;
    }

    try {
      // BUAT PREVIEW SAJA dari versi compress (webp)
      const previewUrls = await Promise.all(
        validFiles.map(async (file) => {
          const previewCompressed = await imageCompression(file, {
            maxSizeMB: 0.3,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
            fileType: "image/webp",
          });
          return URL.createObjectURL(previewCompressed);
        })
      );

      // ✅ TAMPILIN PREVIEW (pakai versi compress)
      setGambarPreview((prev) => [...prev, ...previewUrls.map((url) => ({ url }))]);

      // ✅ UPLOAD KE BACKEND PAKAI FILE ASLI
      setOriginalFile((prev) => [...prev, ...validFiles]);

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Gagal buat preview gambar:", err);
      alert("Gagal memproses preview gambar.");
    }
  };

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!file || !allowedTypes.includes(file.type)) {
      alert("❌ Thumbnail harus berupa gambar (.jpg, .jpeg, .png, .webp).");
      return;
    }

    try {
      const previewCompressed = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: "image/webp",
      });

      setThumbnailFile(file); // ⬅️ kirim ke server tetap file asli
      setThumbnailPreview(URL.createObjectURL(previewCompressed));
    } catch (err) {
      console.error("Gagal buat preview thumbnail:", err);
      alert("Gagal memproses thumbnail.");
    }
  };

  const handleRemoveImage = (index) => {
    const toRevoke = gambarPreview[index]?.url;
    if (toRevoke) URL.revokeObjectURL(toRevoke);

    setGambarPreview((prev) => prev.filter((_, i) => i !== index));
    setOriginalFile((prev) => prev.filter((_, i) => i !== index));

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hargaBersih = parseInt(formData.harga_per_jam.replace(/\./g, ""), 10);
    if (isNaN(hargaBersih)) return alert("Harga tidak valid.");
    if (!formData.no_telp || formData.no_telp.length < 8) return alert("No. Telepon minimal 8 digit.");
    if (!formData.latitude || !formData.longitude) return alert("Koordinat belum lengkap.");
    if (originalFile.length === 0) return alert("Minimal upload 1 gambar studio.");
    if (!thumbnailFile) return alert("Thumbnail belum dipilih.");

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (isNaN(lat) || isNaN(lng)) return alert("Koordinat tidak valid.");

    const buka = formData.jam_operasional_buka;
    const tutup = formData.jam_operasional_tutup;

    const data = new FormData();
    data.append("nama", formData.nama);
    data.append("kecamatan", formData.kecamatan);
    data.append("deskripsi", formData.deskripsi);
    data.append("alamat", formData.alamat);
    data.append("no_telp", formData.no_telp);
    data.append("harga_per_jam", hargaBersih.toString());
    data.append("jam_operasional", JSON.stringify({ buka, tutup }));
    data.append("lokasi", JSON.stringify({ lat, lng }));
    data.append("thumbnail", thumbnailFile);
    originalFile.forEach((file) => data.append("gambar", file));

    try {
      setLoading(true);
      const BASE_URL = import.meta.env.VITE_API_BASE_URL; // ⬅️ Tambahin ini DI DALAM handleSubmit
      const res = await fetch(`${BASE_URL}/api/studios`, {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        alert("Studio berhasil ditambahkan.");
        setFormData({
          nama: "",
          kecamatan: "",
          deskripsi: "",
          alamat: "",
          no_telp: "",
          harga_per_jam: "",
          jam_operasional_buka: "00:00",
          jam_operasional_tutup: "23:59",
          latitude: "",
          longitude: "",
        });
        setGambarPreview([]);
        setOriginalFile([]);
        setThumbnailFile(null);
        setThumbnailPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

        // ✅ Tambahkan redirect ke Home
        navigate("/", { replace: true });
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "auto" });
        }, 100);
      } else {
        const err = await res.json();
        alert("Gagal menambahkan studio: " + err.message);
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Terjadi kesalahan saat mengirim data.");
    } finally {
      setLoading(false);
    }
  };

  const latFloat = parseFloat(formData.latitude);
  const lngFloat = parseFloat(formData.longitude);
  const isValidLatLng = !isNaN(latFloat) && !isNaN(lngFloat);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Tambah Studio Baru</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-5">
        <FormInput label="Nama Studio" name="nama" value={formData.nama} onChange={handleChange} required />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan / Kabupaten</label>
          <select name="kecamatan" value={formData.kecamatan} onChange={handleChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-red-200 outline-none">
            <option value="" disabled>
              Pilih wilayah...
            </option>
            {daftarWilayah.map((wil, i) => (
              <option key={i} value={wil}>
                {wil}
              </option>
            ))}
          </select>
        </div>
        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Studio</label>
          <label className="inline-block bg-gray-100 hover:bg-gray-200 border border-gray-300 text-sm px-4 py-2 rounded-md cursor-pointer">
            Pilih Thumbnail
            <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleThumbnailChange} className="hidden" />
          </label>
          {thumbnailPreview && <img src={thumbnailPreview} alt="Thumbnail Preview" className="h-28 mt-3 object-cover rounded-md" />}
        </div>

        {/* Gambar Studio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Studio</label>
          <label className="inline-block bg-gray-100 hover:bg-gray-200 border border-gray-300 text-sm px-4 py-2 rounded-md cursor-pointer">
            Pilih Gambar
            <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" multiple onChange={handleFileChange} className="hidden" />
          </label>
          <p className="text-sm text-gray-500 mt-1">{gambarPreview.length > 0 ? `${gambarPreview.length} gambar dipilih` : "Belum ada gambar dipilih"}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
            {gambarPreview.map((img, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden shadow-sm">
                <img src={img.url} alt={`preview-${i}`} className="h-28 w-full object-cover" />
                <button type="button" onClick={() => handleRemoveImage(i)} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <FormTextArea label="Deskripsi" name="deskripsi" value={formData.deskripsi} onChange={handleChange} />
        <FormInput label="Alamat Lengkap" name="alamat" value={formData.alamat} onChange={handleChange} required />
        <FormInput label="No. Telepon" name="no_telp" value={formData.no_telp} onChange={handleChange} required />
        <FormInput label="Harga per Jam" name="harga_per_jam" value={formData.harga_per_jam} onChange={handleHargaChange} required />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jam Operasional</label>
          <div className="flex items-center gap-3">
            <input type="time" name="jam_operasional_buka" value={formData.jam_operasional_buka} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2" required />
            <span className="text-gray-500">-</span>
            <input type="time" name="jam_operasional_tutup" value={formData.jam_operasional_tutup} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2" required />
          </div>
        </div>

        <FormInput label="Latitude (Lokasi)" name="latitude" value={formData.latitude} onChange={handleChange} required />
        <FormInput label="Longitude (Lokasi)" name="longitude" value={formData.longitude} onChange={handleChange} required />

        {isValidLatLng && (
          <div className="aspect-video mt-3">
            <iframe title="Preview Lokasi" className="w-full h-full rounded-md border" src={`https://maps.google.com/maps?q=${latFloat},${lngFloat}&z=15&output=embed`} loading="lazy"></iframe>
          </div>
        )}

        <button type="submit" disabled={loading} className={`cursor-pointer w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
          {loading ? "Menyimpan..." : "Tambah Studio"}
        </button>
      </form>
    </div>
  );
}

function FormInput({ label, name, type = "text", value, onChange, required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input name={name} type={type} value={value} onChange={onChange} required={required} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-red-200 outline-none" />
    </div>
  );
}

function FormTextArea({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea name={name} value={value} onChange={onChange} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-red-200 outline-none resize-none" />
    </div>
  );
}

export default Tambah;
