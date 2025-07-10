// const BASE_URL = "http://localhost:5000/api/studios";

const BASE_URL = "https://caristudio-backend.vercel.app/api/studios";
/**
 * Mapping dari struktur backend ke frontend
 * Ubah jam_operasional string menjadi objek { buka, tutup }
 */
const mapStudio = (studio) => {
  let jamOp = { buka: "-", tutup: "-" };

  if (studio.jam_operasional) {
    if (typeof studio.jam_operasional === "string") {
      const parts = studio.jam_operasional.split("-");
      if (parts.length === 2) {
        jamOp = {
          buka: parts[0].trim(),
          tutup: parts[1].trim(),
        };
      } else {
        jamOp = {
          buka: studio.jam_operasional.trim(),
          tutup: "",
        };
      }
    } else if (typeof studio.jam_operasional === "object") {
      jamOp = {
        buka: studio.jam_operasional.buka || "-",
        tutup: studio.jam_operasional.tutup || "-",
      };
    }
  }

  return {
    id: studio._id,
    nama: studio.nama,
    kecamatan: studio.kecamatan,
    gambar: Array.isArray(studio.gambar) ? studio.gambar : studio.gambar ? [studio.gambar] : [],
    thumbnail: studio.thumbnail || "",
    harga_per_jam: studio.harga_per_jam,
    deskripsi: studio.deskripsi || "",
    alamat: studio.alamat || "",
    no_telp: studio.no_telp || "",
    jam_operasional: jamOp,
    lokasi: studio.lokasi || null,
  };
};

/**
 * Ambil semua studio
 */
export const getAllStudios = async () => {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error(`Gagal ambil semua studio (${res.status})`);

    const data = await res.json();
    return data.map(mapStudio);
  } catch (err) {
    console.error("❌ getAllStudios gagal:", err);
    throw err;
  }
};

/**
 * Ambil studio berdasarkan query (q, kecamatan, kabupaten)
 */
export const getStudiosByQuery = async (queryParams) => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const res = await fetch(`${BASE_URL}?${queryString}`);
    if (!res.ok) throw new Error(`Gagal ambil studio dari query (${res.status})`);

    const data = await res.json();
    return data.map(mapStudio);
  } catch (err) {
    console.error("❌ getStudiosByQuery gagal:", err);
    throw err;
  }
};

/**
 * Ambil 1 studio berdasarkan ID
 */
export const getStudioById = async (id) => {
  if (!id) throw new Error("ID studio kosong");

  try {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) throw new Error(`Gagal ambil studio (${res.status})`);

    const data = await res.json();
    return mapStudio(data);
  } catch (err) {
    console.error(`❌ getStudioById gagal:`, err);
    throw err;
  }
};

/**
 * Tambah studio baru (gunakan FormData)
 */
export const createStudio = async (studioData) => {
  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      body: studioData,
    });

    if (!res.ok) throw new Error("Gagal tambah studio");

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("❌ createStudio gagal:", err);
    throw err;
  }
};

/**
 * Update studio (gunakan FormData)
 */
export const updateStudio = async (id, studioData) => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      body: studioData,
    });

    if (!res.ok) throw new Error("Gagal update studio");

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("❌ updateStudio gagal:", err);
    throw err;
  }
};

/**
 * Hapus studio berdasarkan ID
 */
export const deleteStudio = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Gagal hapus studio");

    return true;
  } catch (err) {
    console.error("❌ deleteStudio gagal:", err);
    throw err;
  }
};
