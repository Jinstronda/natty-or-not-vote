import AdminTopBar from "@/components/AdminTopBar";
import Header from "@/components/Header";
import { ReactNode } from "react";
import Footer from "@/components/Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <AdminTopBar />
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default Layout; 