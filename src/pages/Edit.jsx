import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { getStudioById, updateStudio, deleteStudio } from "../services/studioAPI";
import { Navigate } from "react-router-dom";
import NotAuthorized from "./NotAuthorized";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const isAdmin = () => localStorage.getItem("admin") === "true"; // ✅ fungsi pengecekan admin

function Edit() {
  if (!isAdmin()) {
    return <NotAuthorized />;
  }
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
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

  const [formData, setFormData] = useState({
    nama: "",
    kecamatan: "",
    deskripsi: "",
    alamat: "",
    no_telp: "",
    harga_per_jam: "",
    jam_operasional_buka: "",
    jam_operasional_tutup: "",
    latitude: "",
    longitude: "",
  });

  const [gambarPreview, setGambarPreview] = useState([]);
  const [gambarBaruPreview, setGambarBaruPreview] = useState([]);
  const [gambarBaruAsli, setGambarBaruAsli] = useState([]);
  const [gambarLama, setGambarLama] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getStudioById(id);
        if (!data) return alert("Data studio tidak ditemukan!");

        const lat = data.lokasi?.lat ?? data.lokasi?.latitude ?? "";
        const lng = data.lokasi?.lng ?? data.lokasi?.longitude ?? "";

        setFormData({
          nama: data.nama || "",
          kecamatan: data.kecamatan || "",
          deskripsi: data.deskripsi || "",
          alamat: data.alamat || "",
          no_telp: data.no_telp || "",
          harga_per_jam: new Intl.NumberFormat("id-ID").format(data.harga_per_jam || 0),
          jam_operasional_buka: data.jam_operasional?.buka || "",
          jam_operasional_tutup: data.jam_operasional?.tutup || "",
          latitude: lat.toString(),
          longitude: lng.toString(),
        });

        // === Gambar Lama (Studio)
        const lama = (data.gambar || []).map((path) => {
          const fullURL = path.startsWith("http") ? path : `${BASE_URL}/${path.replace(/^\/?/, "")}`;
          return {
            url: fullURL,
            name: path,
            isLama: true,
          };
        });
        setGambarLama(lama);
        setGambarPreview(lama);

        // === Thumbnail
        if (data.thumbnail) {
          const fullThumbURL = data.thumbnail.startsWith("http") ? data.thumbnail : `${BASE_URL}/${data.thumbnail.replace(/^\/?/, "")}`;
          setThumbnailPreview(fullThumbURL);
        }
      } catch (err) {
        console.error("Gagal mengambil data studio:", err);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHargaChange = (e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, "");
    const formatted = new Intl.NumberFormat("id-ID").format(Number(onlyNumbers));
    setFormData((prev) => ({ ...prev, harga_per_jam: formatted }));
  };

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("❌ Thumbnail harus berupa gambar (.jpg, .jpeg, .png, .webp).");
      return;
    }

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: "image/webp",
      });

      const ext = ".webp";
      const originalName = file.name.replace(/\.[^/.]+$/, "");
      const fixedFile = new File([compressed], originalName + ext, {
        type: "image/webp",
      });

      setThumbnailFile(fixedFile);
      setThumbnailPreview(URL.createObjectURL(fixedFile));
    } catch (err) {
      console.error("Gagal kompres thumbnail:", err);
      alert("Gagal memproses thumbnail.");
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setGambarBaruAsli((prev) => [...prev, ...files]);

    const newPreviews = await Promise.all(
      files.map(async (file) => {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
          fileType: "image/webp",
        });

        return {
          url: URL.createObjectURL(compressed),
          name: file.name,
          isLama: false,
        };
      })
    );

    setGambarBaruPreview((prev) => [...prev, ...newPreviews]);
    setGambarPreview((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (index) => {
    const target = gambarPreview[index];
    setGambarPreview((prev) => prev.filter((_, i) => i !== index));

    if (target.isLama) {
      setGambarLama((prev) => prev.filter((img) => img.name !== target.name));
    } else {
      setGambarBaruPreview((prev) => prev.filter((img) => img.name !== target.name));
      setGambarBaruAsli((prev) => prev.filter((img) => img.name !== target.name));
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hargaBersih = parseInt(formData.harga_per_jam.replace(/\./g, ""), 10);
    if (isNaN(hargaBersih)) return alert("Harga tidak valid.");
    if (!formData.latitude || !formData.longitude) return alert("Koordinat lokasi belum lengkap.");
    if (!formData.jam_operasional_buka || !formData.jam_operasional_tutup) return alert("Jam operasional belum lengkap.");

    const form = new FormData();
    form.append("nama", formData.nama);
    form.append("kecamatan", formData.kecamatan);
    form.append("deskripsi", formData.deskripsi);
    form.append("alamat", formData.alamat);
    form.append("no_telp", formData.no_telp);
    form.append("harga_per_jam", hargaBersih.toString());
    form.append("jam_operasional", JSON.stringify({ buka: formData.jam_operasional_buka, tutup: formData.jam_operasional_tutup }));
    form.append("lokasi", JSON.stringify({ lat: formData.latitude, lng: formData.longitude }));
    form.append("gambarLama", JSON.stringify(gambarLama.map((g) => g.name)));

    gambarBaruAsli.forEach((file) => form.append("gambar", file));
    if (thumbnailFile instanceof File) form.append("thumbnail", thumbnailFile);
    try {
      const res = await updateStudio(id, form);
      if (res) {
        alert("Studio berhasil diperbarui.");
        navigate("/hasil", { replace: true });

        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      } else {
        alert("Gagal memperbarui studio.");
      }
    } catch (err) {
      console.error("Gagal mengirim form:", err);
      alert("Terjadi kesalahan saat memperbarui studio.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus studio ini?")) return;
    try {
      await deleteStudio(id);
      alert("Studio berhasil dihapus.");
      navigate("/hasil", { replace: true });
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
      }, 100);
    } catch (err) {
      console.error("Gagal menghapus studio:", err);
      alert("Terjadi kesalahan saat menghapus studio.");
    }
  };

  const latFloat = parseFloat(formData.latitude);
  const lngFloat = parseFloat(formData.longitude);
  const isValidLatLng = !isNaN(latFloat) && !isNaN(lngFloat);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Edit Studio</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-5">
        <FormInput label="Nama Studio" name="nama" value={formData.nama} onChange={handleChange} required />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan / Kabupaten</label>
          <select name="kecamatan" value={formData.kecamatan} onChange={handleChange} required className="w-full border border-gray-300 rounded-md px-3 py-2">
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
            Pilih Thumbnail Baru
            <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleThumbnailChange} className="hidden" />
          </label>
          {thumbnailPreview && <img src={thumbnailPreview} alt="Thumbnail Preview" className="h-28 mt-3 object-cover rounded-md" />}
        </div>

        {/* Gambar Studio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Studio</label>
          <label className="inline-block bg-gray-100 hover:bg-gray-200 border border-gray-300 text-sm px-4 py-2 rounded-md cursor-pointer">
            Pilih Gambar Baru
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

        <button type="submit" className="cursor-pointer w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
          Perbarui Studio
        </button>

        <button type="button" onClick={handleDelete} className="cursor-pointer w-full mt-3 bg-white hover:bg-red-100 text-red-600 border border-red-400 font-semibold py-2 px-4 rounded-lg transition duration-200">
          Hapus Studio
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

export default Edit;
