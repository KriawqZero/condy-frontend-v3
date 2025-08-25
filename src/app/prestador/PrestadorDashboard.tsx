"use client";

import { Button, buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { User } from "@/types";
import { useEffect, useState } from "react";
import { apiGetPrestadorDashboard } from "../actions/prestador";
import Link from "next/link";

export default function PrestadorDashboard({ user }: { user: User }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await apiGetPrestadorDashboard();
      if (res.success) setData(res.data);
      setLoading(false);
    }
    load();
  }, []);

  function moeda(v: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
  }

  return (
    <div className="relative pb-20 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
      <div className="container relative -mt-10 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white rounded-[20px] p-6 shadow-xl border-0">
            <div className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">Receita mensal</div>
            <div className="font-afacad text-2xl font-bold text-black">{moeda(data?.receitaMensal || 0)}</div>
          </Card>
          <Card className="bg-white rounded-[20px] p-6 shadow-xl border-0">
            <div className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">Custo mensal</div>
            <div className="font-afacad text-2xl font-bold text-black">{moeda(data?.custoMensal || 0)}</div>
          </Card>
          <Card className="bg-white rounded-[20px] p-6 shadow-xl border-0">
            <div className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">Lucro mensal</div>
            <div className="font-afacad text-2xl font-bold text-black">{moeda(data?.lucroMensal || 0)}</div>
          </Card>
        </div>

        <div className="bg-white rounded-2xl shadow-sm w-full mb-8 p-6">
          <div className="font-afacad text-xl font-bold text-black mb-4">Atividade do dia</div>
          {loading ? (
            <div className="flex items-center justify-center min-h-[120px]">
              <img src="/loading.gif" alt="Carregando..." className="w-10 h-10" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center"><div className="text-sm text-[#7F98BC]">Novas</div><div className="text-2xl font-bold">{data?.atividadeDoDia?.novas || 0}</div></div>
              <div className="text-center"><div className="text-sm text-[#7F98BC]">Em andamento</div><div className="text-2xl font-bold">{data?.atividadeDoDia?.emAndamento || 0}</div></div>
              <div className="text-center"><div className="text-sm text-[#7F98BC]">Concluídas</div><div className="text-2xl font-bold">{data?.atividadeDoDia?.concluidas || 0}</div></div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Link
            href="/prestador/propostas"
            className={`${buttonVariants({ variant: "default", size: "default" })} bg-[#1F45FF] text-white`}
          >
            Propostas de Serviço
          </Link>
          <Link
            href="/prestador/ordens"
            className={`${buttonVariants({ variant: "default", size: "default" })} bg-[#1F45FF] text-white`}
          >
            Ordens de Serviço
          </Link>
        </div>
      </div>
    </div>
  );
}


