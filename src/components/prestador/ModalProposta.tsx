"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  apiPrestadorAceitarProposta,
  apiPrestadorRecusarProposta,
  apiPrestadorContraproposta,
} from "@/app/actions/propostas";

interface ModalPropostaProps {
  proposta: any | null;
  onClose: () => void;
  onUpdated: () => void;
}

export function ModalProposta({ proposta, onClose, onUpdated }: ModalPropostaProps) {
  const [step, setStep] = useState<"DETAILS" | "RECUSAR" | "CONTRA">("DETAILS");
  const [loading, setLoading] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");
  const [prazo, setPrazo] = useState("");
  const [justificativa, setJustificativa] = useState("");

  if (!proposta) return null;

  function formatarValor(valor: unknown) {
    const numero = Number(valor);
    if (!valor || isNaN(numero)) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(numero);
  }

  async function handleAccept() {
    setLoading(true);
    const r = await apiPrestadorAceitarProposta(proposta.id);
    setLoading(false);
    if (r.success) {
      onUpdated();
      onClose();
    }
  }

  async function handleRecusar() {
    setLoading(true);
    const r = await apiPrestadorRecusarProposta(proposta.id, motivo);
    setLoading(false);
    if (r.success) {
      onUpdated();
      onClose();
    }
  }

  async function handleContraproposta() {
    setLoading(true);
    const r = await apiPrestadorContraproposta(proposta.id, {
      precoMin: precoMin || undefined,
      precoMax: precoMax || undefined,
      prazo: prazo ? Number(prazo) : undefined,
      justificativa,
    });
    setLoading(false);
    if (r.success) {
      onUpdated();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
        {step === "DETAILS" && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">Detalhes da proposta</h2>
            <div className="space-y-2 mb-6 text-sm">
              <div>
                <span className="font-bold">Chamado:</span> {proposta.chamado?.numeroChamado}
              </div>
              <div>
                <span className="font-bold">Condomínio:</span> {proposta.chamado?.imovel?.nome || proposta.chamado?.imovel?.endereco}
              </div>
              {(proposta.precoSugeridoMin || proposta.precoSugeridoMax) && (
                <div>
                  <span className="font-bold">Proposta:</span> {formatarValor(proposta.precoSugeridoMin)} ~ {formatarValor(proposta.precoSugeridoMax)}
                </div>
              )}
              {proposta.prazoSugerido && (
                <div>
                  <span className="font-bold">Prazo:</span> {proposta.prazoSugerido} dias
                </div>
              )}
            </div>
            {loading ? (
              <div className="flex justify-center">
                <img src="/loading.gif" alt="Carregando..." className="w-12 h-12" />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button className="flex-1 bg-red-600 text-white" onClick={() => setStep("RECUSAR")}>
                  Recusar
                </Button>
                <Button className="flex-1 bg-yellow-500 text-white" onClick={() => setStep("CONTRA")}>
                  Fazer contraproposta
                </Button>
                <Button className="flex-1 bg-green-600 text-white" onClick={handleAccept}>
                  Aceitar proposta
                </Button>
              </div>
            )}
          </>
        )}

        {step === "RECUSAR" && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">Recusar proposta</h2>
            <div className="mb-4">
              <textarea
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Motivo da recusa"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>
            {loading ? (
              <div className="flex justify-center">
                <img src="/loading.gif" alt="Carregando..." className="w-12 h-12" />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button className="flex-1 bg-gray-200 text-black" onClick={() => setStep("DETAILS")}>Voltar</Button>
                <Button className="flex-1 bg-red-600 text-white" onClick={handleRecusar}>
                  Enviar recusa
                </Button>
              </div>
            )}
          </>
        )}

        {step === "CONTRA" && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">Fazer contraproposta</h2>
            <div className="space-y-3 mb-4">
              <Input
                label="Preço mínimo"
                placeholder="R$ 0,00"
                value={precoMin}
                onChange={(e) => setPrecoMin(e.target.value)}
              />
              <Input
                label="Preço máximo"
                placeholder="R$ 0,00"
                value={precoMax}
                onChange={(e) => setPrecoMax(e.target.value)}
              />
              <Input
                label="Prazo (dias)"
                type="number"
                placeholder="0"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700">Justificativa</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2 mt-1"
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                />
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center">
                <img src="/loading.gif" alt="Carregando..." className="w-12 h-12" />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button className="flex-1 bg-gray-200 text-black" onClick={() => setStep("DETAILS")}>Voltar</Button>
                <Button className="flex-1 bg-blue-600 text-white" onClick={handleContraproposta}>
                  Enviar contraproposta
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

