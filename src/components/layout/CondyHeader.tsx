"use client";

import { LogoutButton } from "@/components/icons/LogoutButton";
import { User } from "@/types";

interface CondyHeaderProps {
  user?: User;
  title?: string;
}

export default function CondyHeader({ user, title }: CondyHeaderProps) {
  return (
    <header
      className="h-92 relative overflow-hidden"
      style={{
        background: "linear-gradient(90deg, #DFE0F9 0%, #FBD9B9 100%)",
      }}
    >
      {/* Header Content */}
      <div className="relative max-w-screen-2xl px-4 sm:px-6 lg:px-8 mx-auto flex justify-between items-start pt-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/horizontal_logo.svg" alt="Condy" className="h-10" />
        </div>

        {/* Logout Button */}
        <LogoutButton className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center" />
      </div>

      {/* Welcome Message - Ajustado para não conflitar com os cards */}
      <div className="relative max-w-screen-2xl px-4 sm:px-6 lg:px-8 mx-auto mt-6">
        <h1 className="font-afacad text-4xl lg:text-5xl font-bold leading-tight">
          Olá, {user?.name || "Síndico"}!
        </h1>
        <p className="font-afacad text-lg mt-1">{title}</p>
      </div>

      {/* Ilustração de Prédio */}
      <div className="hidden absolute right-0 bottom-0 opacity-10">
        <img
          src="3d_illustration.png"
          alt="Ilustração de Prédio"
          className="w-64 lg:w-96"
        />
      </div>
    </header>
  );
}
