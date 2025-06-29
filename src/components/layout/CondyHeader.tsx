"use client";

import { CondyIcon } from "@/components/icons/CondyIcon";
import { LogoutIcon } from "@/components/icons/LogoutIcon";
import { User } from "@/types";

interface CondyHeaderProps {
  user?: User;
  title?: string;
}

export default function CondyHeader({ user, title }: CondyHeaderProps) {
  return (
    <header
      className="h-80 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1F45FF 0%, #4EC1F3 100%)",
        borderRadius: "0 0 32px 32px",
      }}
    >
      {/* Header Content */}
      <div className="relative z-10 flex justify-between items-start p-6 lg:p-18">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <CondyIcon />
          <span className="font-righteous text-black text-3xl">Condy</span>
        </div>

        {/* Logout Button */}
        <button className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center">
          <LogoutIcon />
        </button>
      </div>

      {/* Welcome Message */}
      <div className="relative z-10 px-6 lg:px-18 mt-8">
        <h1 className="font-afacad text-4xl lg:text-[42px] font-bold text-black leading-tight">
          Olá, Lucas Mezabarba
        </h1>
        <p className="font-afacad text-base font-bold text-black mt-1">
          Condomínio Millenium Space
        </p>
      </div>

      {/* 3D Illustration */}
      <div className="absolute right-20 lg:right-32 top-4">
        <img
          src="3d_illustration.png"
          alt="3D illustration"
          className="w-[330px] h-[303px] object-cover drop-shadow-xl"
        />
      </div>
    </header>
  );
}
