import { User } from "@/types";
import { ReactNode } from "react";
import Footer from "../Footer";
import CondyHeader from "./CondyHeader";

interface CondyLayoutProps {
  children: ReactNode;
  user?: User;
  showFooter?: boolean;
  title?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  background?: "white" | "gray" | "gradient";
}

export default function CondyLayout({
  children,
  user,
  showFooter = true,
  title,
  _maxWidth = "full",
  background = "gray",
}: CondyLayoutProps) {
  const getBackgroundClass = () => {
    switch (background) {
      case "white":
        return "bg-white";
      case "gradient":
        return "bg-gradient-to-br from-blue-50 to-indigo-100";
      default:
        return "bg-gray-50";
    }
  };

  // getMaxWidthClass não utilizado por enquanto

  return (
    <div className={`min-h-screen flex flex-col ${getBackgroundClass()}`}>
      {/* Header */}
      <CondyHeader user={user} title={title} />

      <main className="relative">
        <div>{children}</div>
      </main>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
}
