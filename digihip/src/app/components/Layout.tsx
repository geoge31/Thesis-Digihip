// Layout.tsx
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";
import ChatWidget from "@/chatbot/components/ChatWidget";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
};

export default Layout;