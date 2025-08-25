"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { apiPrestadorListOrdens, apiPrestadorAlterarStatus, apiPrestadorCriarOrdemAvulsa } from "../../actions/ordens";

export default function OrdensPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  async function load() {
    setLoading(true);
    const res = await apiPrestadorListOrdens();
    if (res.success) setItems(res.data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function alterarStatus(id: number) {
    const status = prompt("Novo status (EM_ANDAMENTO|CONCLUIDO|CANCELADO)") as any;
    if (!status) return;
    const r = await apiPrestadorAlterarStatus(id, status);
    if (r.success) await load();
  }

  return (
    <div className="relative pb-20 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
      <div className="container relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="font-afacad text-2xl font-bold">Ordens de Serviço</div>
          <Button
            className="bg-[#1F45FF] text-white"
            onClick={async () => {
              const descricao = prompt("Descreva a OS externa (obrigatório)") || "";
              if (!descricao) return;
              const valor = prompt("Valor acordado (opcional)");
              const prazo = prompt("Prazo (dias) (opcional)");
              const r = await apiPrestadorCriarOrdemAvulsa({
                descricao,
                valorAcordado: valor ? Number(valor) : undefined,
                prazoAcordado: prazo ? Number(prazo) : undefined,
              });
              if (r.success) await load();
              else alert(r.error);
            }}
          >
            Nova OS (avulsa)
          </Button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm w-full p-4">
          {loading ? (
            <div className="flex items-center justify-center min-h-[180px]"><img src="/loading.gif" alt="Carregando..." className="w-12 h-12" /></div>
          ) : items.length === 0 ? (
            <div className="text-center text-[#7F98BC]">Nenhuma OS.</div>
          ) : (
            <div className="space-y-3">
              {items.map((o) => (
                <Card key={o.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">Chamado {o.chamado?.numeroChamado}</div>
                      <div className="text-sm text-[#7F98BC]">{o.chamado?.imovel?.endereco}</div>
                      <div className="text-sm">Status: {o.status}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => alterarStatus(o.id)} className="bg-[#1F45FF] text-white">Alterar status</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


