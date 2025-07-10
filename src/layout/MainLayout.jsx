import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import "@radix-ui/themes/styles.css";
function MainLayout() {
  return (
    <main className="font-poppins 2xl:container mx-auto">
      <Navbar />
      <div className="px-6 pt-25 py-5 min-h-screen">
        <Outlet />
      </div>
      <Footer />
    </main>
  );
}

export default MainLayout;
