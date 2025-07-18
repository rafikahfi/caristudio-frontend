import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Card({ id, title, description, thumbnail }) {
  const imageUrl = thumbnail?.startsWith("http") ? `${thumbnail}?v=${Date.now()}` : thumbnail ? `${BASE_URL}/${thumbnail.replace(/^\/?/, "")}?v=${Date.now()}` : "/default.jpg";

  return (
    <Link to={`/detail/${id}`} className="group cursor-pointer bg-white hover:bg-merah rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition block">
      {/* ✅ Gambar tetap proporsional dan gak kepotong aneh */}
      <div className="w-full h-40 overflow-hidden bg-black">
        <LazyLoadImage
          src={imageUrl}
          alt={title || "Studio"}
          effect="blur"
          placeholderSrc="/default.jpg"
          wrapperClassName="w-full h-full"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default.jpg";
          }}
        />
      </div>

      {/* teks */}
      <div className="p-4">
        <h3 className="text-base font-semibold mb-1 truncate group-hover:text-white transition">{title || "Tanpa Nama"}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 group-hover:text-white transition">{description || "-"}</p>
      </div>
    </Link>
  );
}

export default Card;
