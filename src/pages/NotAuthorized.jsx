function NotAuthorized() {
  return (
    <div className=" flex justify-center mt-30">
      <div className="bg-white shadow-md rounded-xl p-8 text-center w-md sm:max-w-md border border-merah-200">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Akses Ditolak</h2>
        <p className="text-gray-700 mb-6">Anda bukan admin. Halaman ini hanya bisa diakses oleh admin.</p>
        <a href="/" className="inline-block bg-merah hover:bg-merah-200 text-white px-4 py-2 rounded-full font-semibold hover:bg-merah-600 transition">
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
}

export default NotAuthorized;
