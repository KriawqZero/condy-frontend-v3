import { logoutAction } from "@/app/actions/auth";
import { useState } from "react";
import { LogoutIcon } from "../icons/LogoutIcon";

interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
}

export function LogoutModal({ open, onClose }: LogoutModalProps) {
  if (!open) return null;
  const [loading, setLoading] = useState(false);

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
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full shadow-xl">
        <div className="flex justify-center mb-4">
          <LogoutIcon
            color="#10A07B"
            height={72}
            width={72}
            strokeWidth={2.4}
          />
        </div>
        <h2 className="text-xl font-bold mb-2 text-black">
          Deseja mesmo sair da sua conta?
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Ao sair, você precisará fazer login novamente para acessar seus
          chamados e informações do condomínio, tudo bem?
        </p>
        {loading ? (
          <div className="flex justify-center">
            <img
              src="/loading.gif"
              alt="Carregando"
              className="py-2 mb-3 w-12 h-12"
            />
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg mb-3"
          >
            Sim, quero sair
          </button>
        )}
        <button
          className="w-full text-indigo-600 hover:underline font-medium"
          onClick={onClose}
        >
          Voltar para o início
        </button>
      </div>
    </div>
  );
}
