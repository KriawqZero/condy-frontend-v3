"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chamado } from "@/types";
import { updateChamado } from "@/lib/api";

interface ModalAtualizarChamadoProps {
  chamado: Chamado;
  onClose: () => void;
  onUpdated?: () => void;
}

export function ModalAtualizarChamado({ chamado, onClose, onUpdated }: ModalAtualizarChamadoProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const updateData = {
      status: formData.get("status") as string,
      prioridade: formData.get("prioridade") as string,
      prestadorId: formData.get("prestadorId") as string,
      valorEstimado: formData.get("valorEstimado")
        ? parseFloat(formData.get("valorEstimado") as string)
        : undefined,
      observacoesInternas: formData.get("observacoesInternas") as string,
    };

    try {
      await updateChamado(chamado.id, updateData);
      setLoading(false);
      onUpdated?.();
      onClose();
    } catch (e: any) {
      setLoading(false);
      alert("Erro ao atualizar chamado: " + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-afacad text-2xl font-bold text-black">
              Atualizando chamado
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-afacad text-sm font-bold text-black mb-2">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={chamado.status}
                  className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad"
                >
                  <option value="NOVO">Novo</option>
                  <option value="A_CAMINHO">A Caminho</option>
                  <option value="EM_ATENDIMENTO">Em Atendimento</option>
                  <option value="CONCLUIDO">Concluído</option>
                </select>
              </div>

              <div>
                <label className="block font-afacad text-sm font-bold text-black mb-2">
                  Prioridade
                </label>
                <select
                  name="prioridade"
                  defaultValue={chamado.prioridade}
                  className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad"
                >
                  <option value="BAIXA">Baixa</option>
                  <option value="MEDIA">Média</option>
                  <option value="ALTA">Alta</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-afacad text-sm font-bold text-black mb-2">
                Prestador (CNPJ)
              </label>
              <input
                type="text"
                name="prestadorId"
                defaultValue={chamado.prestadorId || ""}
                placeholder="Digite o CNPJ do prestador"
                className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad"
              />
            </div>

            <div>
              <label className="block font-afacad text-sm font-bold text-black mb-2">
                Valor Estimado
              </label>
              <input
                type="number"
                step="0.01"
                name="valorEstimado"
                defaultValue={
                  typeof chamado.valorEstimado === "number"
                    ? chamado.valorEstimado.toString()
                    : ""
                }
                placeholder="0.00"
                className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad"
              />
            </div>

            <div>
              <label className="block font-afacad text-sm font-bold text-black mb-2">
                Observações Internas
              </label>
              <textarea
                rows={3}
                name="observacoesInternas"
                placeholder="Observações visíveis apenas para administradores"
                className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-[#EFF0FF] rounded-xl text-black hover:bg-gray-50 font-afacad font-bold"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#1F45FF] text-white rounded-xl hover:bg-[#1F45FF]/90 font-afacad font-bold"
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

