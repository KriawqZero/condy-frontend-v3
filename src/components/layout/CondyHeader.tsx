"use client";

import { LogoutIcon } from "@/components/icons/LogoutIcon";
import { User } from "@/types";

interface CondyHeaderProps {
  user?: User;
  title?: string;
}

export default function CondyHeader({ user, title }: CondyHeaderProps) {
  return (
    <header
      className="h-64 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1F45FF 0%, #4EC1F3 100%)",
        borderRadius: "0 0 32px 32px",
      }}
    >
      {/* Header Content */}
      <div className="relative flex justify-between items-start p-6 lg:px-18">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img 
            src="/horizontal_logo_white.svg" 
            alt="Condy" 
            className="h-10"
          />
        </div>

        {/* Logout Button */}
        <button className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
          <LogoutIcon />
        </button>
      </div>

      {/* Welcome Message - Ajustado para não conflitar com os cards */}
      <div className="relative z-10 px-6 lg:px-18 mt-6">
        <h1 className="font-afacad text-3xl lg:text-4xl font-bold text-white leading-tight">
          Olá, {user?.name || "Sindico"}!
        </h1>
        <p className="font-afacad text-lg text-white/90 mt-1">
          Condomínio Millenium Space
        </p>
      </div>

      {/* Ilustração de Prédio */}
      <div className="absolute right-0 bottom-0 opacity-10">
        <svg width="300" height="200" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="100" y="40" width="120" height="160" rx="8" fill="white" />
          <rect x="115" y="55" width="25" height="25" rx="3" fill="white" />
          <rect x="150" y="55" width="25" height="25" rx="3" fill="white" />
          <rect x="185" y="55" width="25" height="25" rx="3" fill="white" />
          <rect x="115" y="90" width="25" height="25" rx="3" fill="white" />
          <rect x="150" y="90" width="25" height="25" rx="3" fill="white" />
          <rect x="185" y="90" width="25" height="25" rx="3" fill="white" />
          <rect x="115" y="125" width="25" height="25" rx="3" fill="white" />
          <rect x="150" y="125" width="25" height="25" rx="3" fill="white" />
          <rect x="185" y="125" width="25" height="25" rx="3" fill="white" />
          <rect x="145" y="160" width="30" height="40" rx="3" fill="white" />
        </svg>
      </div>
    </header>
  );
}
