import { createImovelAction } from "@/app/actions/imoveis";
import { X, Building2 } from "lucide-react";
import { useState } from "react";

interface ModalCadastroImovelProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ModalCadastroImovel({ onClose, onSuccess }: ModalCadastroImovelProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await createImovelAction(formData);
      
      if (response.success) {
        onSuccess();
        onClose();
      } else {
        alert("Erro ao cadastrar imóvel: " + response.error);
      }
    } catch (error) {
      alert("Erro ao cadastrar imóvel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1F45FF]/10 flex items-center justify-center">
              <Building2 size={20} className="text-[#1F45FF]" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-afacad text-black">
                Cadastrar Novo Imóvel
              </h3>
              <p className="text-sm text-gray-600">
                Informe o endereço e dados do imóvel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

                 {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* CEP e Número */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-afacad text-[#1F45FF] mb-1">
                  CEP *
                </label>
                <input
                  type="text"
                  name="cep"
                  required
                  className="w-full border-2 border-[#1F45FF] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="01234-561"
                />
              </div>
              <div>
                <label className="block text-sm font-afacad text-[#1F45FF] mb-1">
                  Número *
                </label>
                <input
                  type="text"
                  name="numero"
                  required
                  className="w-full border-2 border-[#1F45FF] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="110"
                />
              </div>
            </div>

            {/* Endereço */}
            <div>
              <label className="block text-sm font-afacad text-[#1F45FF] mb-1">
                Endereço *
              </label>
              <input
                type="text"
                name="endereco"
                required
                className="w-full border-2 border-[#1F45FF] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Rua das Dores"
              />
            </div>

            {/* Bairro, Cidade, UF */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-afacad text-[#1F45FF] mb-1">
                  Bairro *
                </label>
                <input
                  type="text"
                  name="bairro"
                  required
                  className="w-full border-2 border-[#1F45FF] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Santo Amaro"
                />
              </div>
              <div>
                <label className="block text-sm font-afacad text-[#1F45FF] mb-1">
                  Cidade *
                </label>
                <input
                  type="text"
                  name="cidade"
                  required
                  className="w-full border-2 border-[#1F45FF] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="São Paulo"
                />
              </div>
              <div>
                <label className="block text-sm font-afacad text-[#1F45FF] mb-1">
                  UF *
                </label>
                <input
                  type="text"
                  name="uf"
                  required
                  maxLength={2}
                  className="w-full border-2 border-[#1F45FF] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="SP"
                />
              </div>
            </div>

            {/* Complemento */}
            <div>
              <label className="block text-sm font-afacad text-[#1F45FF] mb-1">
                Complemento
              </label>
              <input
                type="text"
                name="complemento"
                className="w-full border-2 border-[#1F45FF] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Em frente ao banco"
              />
            </div>

            {/* Quantidade de Moradias */}
            <div>
              <label className="block text-sm font-afacad text-[#1F45FF] mb-1">
                Quantidade de Moradias *
              </label>
              <input
                type="number"
                name="quantidade_moradias"
                required
                min="1"
                className="w-full border-2 border-[#1F45FF] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="18"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#1F45FF] text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Cadastrando..." : "Cadastrar Imóvel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 