import { Link } from "react-router-dom";

const BASE_URL = "https://caristudio-backend.vercel.app";
function Card({ id, title, description, thumbnail }) {
  const imageUrl = thumbnail?.startsWith("http") ? `${thumbnail}?v=${Date.now()}` : thumbnail ? `${BASE_URL}/${thumbnail.replace(/^\/?/, "")}?v=${Date.now()}` : "/default.jpg";

  return (
    <Link to={`/detail/${id}`} className="group cursor-pointer bg-white hover:bg-merah rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition block">
      <img
        src={imageUrl}
        alt={title || "Studio"}
        className="w-full h-40 object-cover"
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/default.jpg";
        }}
      />
      <div className="p-4">
        <h3 className="text-base font-semibold mb-1 truncate group-hover:text-white transition">{title || "Tanpa Nama"}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 group-hover:text-white transition">{description || "-"}</p>
      </div>
    </Link>
  );
}

export default Card;
