import React, { useEffect, useState } from "react";

function TentangKami() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL; // ← dari .env
  const [serverError, setServerError] = useState(false);
  const [loadingServerCheck, setLoadingServerCheck] = useState(true);

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
        setLoadingServerCheck(false);
      }
    };

    cekBackend();
  }, []);

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 text-gray-800">
      <h1 className="text-4xl sm:text-5xl font-bold mb-15 sm:mb-6 text-merah text-center sm:text-start">Tentang Kami</h1>

      {/* Deskripsi Website */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">Apa Itu CariStudio?</h2>
        <p className="text-base leading-relaxed">
          <span className="text-merah-200 font-bold">CariStudio</span> adalah platform pencarian studio musik berbasis web yang memudahkan pengguna untuk menemukan, melihat detail, dan memesan studio musik secara langsung di wilayah Bekasi
          dan sekitarnya. Website ini bertujuan untuk menjadi jembatan antara musisi lokal dan studio tempat mereka berkarya.
        </p>
      </section>

      {/* Latar Belakang */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">Latar Belakang</h2>
        <p className="text-base leading-relaxed">
          Website ini dikembangkan sebagai bagian dari proyek tugas akhir (skripsi) dengan fokus pada teknologi pencarian berbasis web. Dengan banyaknya studio musik yang belum terdigitalisasi secara baik, platform ini hadir untuk
          memberikan solusi yang efisien dan mudah digunakan.
        </p>
      </section>

      {/* Profil Pembuat */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">Profil Pengembang</h2>
        <p className="text-base leading-relaxed">
          Website ini dikembangkan oleh <strong>Rafi Kahfi</strong>, mahasiswa dengan fokus pada pengembangan aplikasi web fullstack menggunakan <strong>MERN Stack (MongoDB, Express, React, Node.js)</strong>. Proyek ini adalah bagian dari
          kontribusi kecil untuk memajukan digitalisasi studio musik lokal.
        </p>
      </section>

      {/* Kontak */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Kontak</h2>
        <p className="text-base mb-1">Jika kamu memiliki pertanyaan, saran, atau ingin berkolaborasi, silakan hubungi melalui:</p>
        <ul className="list-disc ml-5">
          <li>
            Email:{" "}
            <a href="mailto:rafikahfi@email.com" className="text-merah hover:underline">
              rafikahfi@email.com
            </a>
          </li>
          <li>
            Instagram:{" "}
            <a href="https://instagram.com/rkahfiy" className="text-merah hover:underline" target="_blank" rel="noreferrer">
              @rkahfiy
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}

export default TentangKami;
