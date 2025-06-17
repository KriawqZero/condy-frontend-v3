import { User } from "@/types";
import { ReactNode } from "react";
import Footer from "../Footer";
import CondyHeader from "./CondyHeader";

interface CondyLayoutProps {
  children: ReactNode;
  user?: User;
  showSidebar?: boolean;
  showFooter?: boolean;
  title?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  background?: "white" | "gray" | "gradient";
}

export default function CondyLayout({
  children,
  user,
  showSidebar = true,
  showFooter = true,
  title,
  maxWidth = "full",
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

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case "sm":
        return "max-w-md mx-auto";
      case "md":
        return "max-w-2xl mx-auto";
      case "lg":
        return "max-w-4xl mx-auto";
      case "xl":
        return "max-w-6xl mx-auto";
      default:
        return "w-full";
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${getBackgroundClass()}`}>
      {/* Header */}
      <CondyHeader user={user} title={title} />

      <div className="flex flex-1">
        {/* Main Content */}
        <main className={`flex-1 ${showSidebar && user ? "ml-64" : ""}`}>
          <div className={`p-6 ${getMaxWidthClass()}`}>{children}</div>
        </main>
      </div>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
}
