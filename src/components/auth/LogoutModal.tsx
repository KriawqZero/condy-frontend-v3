import { logoutAction } from "@/app/actions/auth";
import { useState } from "react";
import { LogoutIcon } from "../icons/LogoutIcon";

interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
}

export function LogoutModal({ open, onClose }: LogoutModalProps) {
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutAction();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 text-center w-full max-w-sm shadow-xl">
        <div className="flex justify-center mb-3 sm:mb-4">
          <LogoutIcon
            color="#10A07B"
            height={60}
            width={60}
            strokeWidth={2.4}
            className="sm:h-[72px] sm:w-[72px]"
          />
        </div>
        <h2 className="text-lg sm:text-xl font-bold mb-2 text-black">
          Deseja mesmo sair da sua conta?
        </h2>
        <p className="text-sm text-gray-500 mb-4 sm:mb-6 px-1">
          Ao sair, você precisará fazer login novamente para acessar seus
          chamados e informações do condomínio, tudo bem?
        </p>
        {loading ? (
          <div className="flex justify-center">
            <img
              src="/loading.gif"
              alt="Carregando"
              className="py-2 mb-3 w-10 h-10 sm:w-12 sm:h-12"
            />
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full sm:w-[296px] h-[44px] sm:h-[48px] mx-auto bg-[#1F45FF] hover:bg-[#1F45FF] text-white font-semibold py-2 px-4 rounded-lg mb-3 opacity-100 flex items-center justify-center"
          >
            Sim, quero sair
          </button>
        )}
        <button
          className="w-full sm:w-[296px] h-[44px] sm:h-[48px] mx-auto text-[#1F45FF] bg-[#F5F7FF] hover:underline font-medium opacity-100 flex items-center justify-center"
          onClick={onClose}
        >
          Voltar para o início
        </button>
      </div>
    </div>
  );
}
