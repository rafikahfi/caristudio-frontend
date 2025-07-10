import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Detail from "./pages/Detail.jsx";
import Hasil from "./pages/Hasil.jsx";
import MainLayout from "./layout/MainLayout.jsx";
import { Theme } from "@radix-ui/themes";
import Tambah from "./pages/Tambah.jsx";
import TentangKami from "./pages/TentangKami.jsx";
import Edit from "./pages/Edit.jsx";
import Login from "./pages/Login.jsx";
import NotFound from "./pages/NotFound.jsx";
import Compare from "./pages/Compare.jsx";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/tentang", element: <TentangKami /> },
      { path: "/detail/:id", element: <Detail /> },
      { path: "/hasil", element: <Hasil /> },
      { path: "/tambah", element: <Tambah /> },
      { path: "/edit/:id", element: <Edit /> },
      { path: "/secret", element: <Login /> },
      { path: "/compare", element: <Compare /> },
      { path: "/*", element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Theme>
      <RouterProvider router={router} />
    </Theme>
  </StrictMode>
);
