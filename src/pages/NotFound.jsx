import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex justify-center mt-30">
      <div className="bg-white p-8 rounded-xl shadow-md text-center w-md sm:max-w-md border border-merah-200">
        <h1 className="text-6xl font-bold text-merah mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-6">Maaf, halaman yang kamu cari tidak tersedia atau telah dipindahkan.</p>
        <Link to="/" className="inline-block bg-merah hover:bg-merah-200 text-white font-semibold px-6 py-3 rounded-full transition">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
