"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface Ticket {
  id: string;
  type: string;
  asset: string;
  value: string;
  provider: string;
  observations: string;
  ticketId: string;
  status: "completed" | "in-progress" | "pending";
}

const mockTickets: Ticket[] = [
  {
    id: "1",
    type: "Manutenção preventiva",
    asset: "Elevador social",
    value: "R$ 1.200,00",
    provider: "Elevatech Serviços",
    observations: "Troca de cabo de tração agendada.",
    ticketId: "#000129",
    status: "in-progress",
  },
  {
    id: "2",
    type: "Solicitação de orçamento",
    asset: "Piscina",
    value: "Sem valor",
    provider: "Sem prestador",
    observations: "Avaliação inicial para troca de bomba.",
    ticketId: "#000112",
    status: "pending",
  },
  {
    id: "3",
    type: "Orçamento solicitado",
    asset: "Portões sociais",
    value: "Sem valor",
    provider: "Sem prestador",
    observations: "Instalação de fechadura nova",
    ticketId: "#000422",
    status: "pending",
  },
  {
    id: "4",
    type: "Manutenção corretiva",
    asset: "Academia",
    value: "R$ 320,00",
    provider: "FitService Equipamentos",
    observations: "Substituição do painel da esteira",
    ticketId: "#000269",
    status: "completed",
  },
  {
    id: "5",
    type: "Reparo emergencial",
    asset: "Iluminação externa",
    value: "R$ 240,00",
    provider: "Elétrica Norte",
    observations: "Curto resolvido; troca de disjuntor feita",
    ticketId: "#000954",
    status: "completed",
  },
  {
    id: "6",
    type: "Reparo emergencial",
    asset: "Portão da garagem",
    value: "R$ 850,00",
    provider: "PortSafe Tecnologia",
    observations: "Motor travado foi substituído",
    ticketId: "#001292",
    status: "completed",
  },
];

const LogoIcon = () => (
  <svg
    width="35"
    height="41"
    viewBox="0 0 35 41"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18.2369 1.1067C18.2382 0.423626 18.9629 0.0179235 19.5299 0.398812C19.7569 0.551292 19.9829 0.704552 20.2095 0.853814L23.0603 2.7042L32.4154 8.74736C32.9505 9.09304 32.9599 9.86134 32.4195 10.1986C32.1846 10.3452 31.9493 10.4906 31.7167 10.6381C30.8737 11.1981 29.985 11.6866 29.1445 12.2516C28.9321 12.3944 28.6568 12.4106 28.4358 12.2815C27.0476 11.4701 25.7078 10.5266 24.3584 9.65748C22.4151 8.40578 20.4463 7.19416 18.538 5.88821C18.3597 5.76622 18.2536 5.56398 18.2529 5.34797C18.2477 3.93469 18.2343 2.52036 18.2369 1.1067Z"
      fill="#1F45FF"
    />
    <path
      d="M16.5812 1.1067C16.58 0.423626 15.8552 0.0179235 15.2882 0.398812C15.0612 0.551292 14.8352 0.704552 14.6086 0.853814L11.7579 2.7042L2.40274 8.74736C1.8676 9.09304 1.8582 9.86134 2.39866 10.1986C2.63347 10.3452 2.86877 10.4906 3.10139 10.6381C3.94443 11.1981 4.83309 11.6866 5.67359 12.2516C5.88604 12.3944 6.16135 12.4106 6.38236 12.2815C7.77055 11.4701 9.1103 10.5266 10.4597 9.65748C12.4031 8.40578 14.3719 7.19416 16.2801 5.88821C16.4584 5.76622 16.5645 5.56398 16.5653 5.34797C16.5704 3.93469 16.5838 2.52036 16.5812 1.1067Z"
      fill="#1F45FF"
    />
    <path
      d="M16.5815 9.11845C16.5815 8.36303 15.7183 7.97427 15.0938 8.39929C15.0439 8.43324 14.9923 8.46782 14.9385 8.50323L12.0878 10.3536L8.35092 12.7402C7.81232 13.0841 7.80098 13.8553 8.34315 14.1936C8.57586 14.3388 8.80902 14.4829 9.03954 14.6291C9.88259 15.1891 10.7712 15.6776 11.6117 16.2426C11.8242 16.3854 12.1 16.4021 12.3191 16.2697C13.6604 15.459 14.7201 14.5167 16.0679 13.6485C16.0679 13.6485 16.0679 13.6485 16.2519 13.535C16.4461 13.4151 16.5645 13.2034 16.5653 12.9752C16.5701 11.69 16.5816 10.404 16.5815 9.11845Z"
      fill="#1F45FF"
    />
    <path
      d="M18.2363 9.11845C18.2363 8.36303 19.0996 7.97427 19.7241 8.39929C19.774 8.43324 19.8256 8.46782 19.8794 8.50323L22.7301 10.3536L26.467 12.7402C27.0056 13.0841 27.0169 13.8553 26.4747 14.1936C26.242 14.3388 26.0089 14.4829 25.7783 14.6291C24.9353 15.1891 24.0466 15.6776 23.2061 16.2426C22.9937 16.3854 22.7179 16.4021 22.4988 16.2697C21.1575 15.459 20.0978 14.5167 18.7499 13.6485C18.7499 13.6485 18.7499 13.6485 18.566 13.535C18.3718 13.4151 18.2534 13.2034 18.2525 12.9752C18.2478 11.69 18.2363 10.404 18.2363 9.11845Z"
      fill="#1F45FF"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.3006 40.277C15.883 40.6369 16.5932 40.2287 16.5871 39.5441C16.5743 38.1119 16.5674 36.6796 16.5641 35.2471C16.5636 35.0104 16.4364 34.7921 16.2305 34.6752C15.9442 34.5128 15.5632 34.2968 15.1308 34.0517C13.2937 33.0106 10.5277 31.4429 10.1475 31.2112C8.79286 30.3993 7.41847 29.5622 6.07189 28.7107C5.31589 28.2327 4.86377 27.3976 4.86377 26.5032V21.5493C4.86377 20.512 6.0055 19.8803 6.88435 20.4313L9.67237 22.1794C10.2035 22.5101 13.7351 24.5384 15.6256 25.585C16.0573 25.824 16.5748 25.5119 16.5757 25.0185C16.5779 23.7722 16.5791 22.526 16.578 21.2799C16.5777 20.9591 16.406 20.6636 16.1307 20.499C15.4402 20.086 14.7621 19.6499 14.0842 19.214C13.6116 18.91 13.1392 18.6062 12.6627 18.3103L4.76972 13.3995C3.75238 12.7465 2.73157 12.0992 1.70728 11.4574C1.58619 11.3816 1.46324 11.3016 1.33873 11.2206C1.3181 11.2072 1.29741 11.1937 1.27669 11.1802C0.738027 10.8301 0.102369 11.2233 0.102333 11.8658L0.101286 30.3776C0.101269 30.6809 0.253841 30.9641 0.509214 31.1277C1.12921 31.5247 1.75799 31.9091 2.38661 32.2934C2.81075 32.5527 3.23481 32.812 3.65603 33.075C6.31215 34.7563 8.9874 36.406 11.6818 38.0244C12.3367 38.4206 12.985 38.8289 13.6334 39.2371C14.1672 39.5732 14.701 39.9093 15.2384 40.2387C15.2591 40.2514 15.2799 40.2642 15.3006 40.277Z"
      fill="black"
    />
    <path
      d="M34.8637 11.8255C34.8698 11.1399 34.1579 10.7323 33.5756 11.0941C33.5572 11.1055 33.5384 11.1169 33.52 11.1282C32.3342 11.8602 31.1663 12.6252 29.977 13.3499C27.2926 14.9735 24.6271 16.6291 21.9809 18.3157C20.9372 18.972 19.708 19.5861 18.6333 20.2503C18.3762 20.4092 18.2251 20.6922 18.2251 20.9944V39.514C18.2252 40.1573 18.8874 40.6045 19.4643 40.3196C19.6724 40.2169 19.8699 40.1102 20.0395 40.0032C21.0599 39.3595 22.0768 38.71 23.0903 38.055L30.9536 33.1282C32.1093 32.4055 33.2417 31.6353 34.4096 30.9319C34.6835 30.767 34.8546 30.4723 34.8549 30.1526C34.8603 24.0447 34.8096 17.9332 34.8637 11.8255ZM29.1059 19.763C29.5301 19.4837 30.0723 19.7873 30.0727 20.2952L30.0776 27.1185C30.078 27.6316 29.7774 28.0954 29.3393 28.3626C28.8755 28.6454 28.4218 28.9664 27.9751 29.2464L24.7407 31.3021C24.081 31.7214 23.2185 31.2469 23.2202 30.4651L23.2348 24.1702C23.2359 23.7256 23.4602 23.3112 23.8335 23.0696C25.3568 22.0841 26.8948 21.1221 28.4477 20.1849C28.6688 20.0491 28.8878 19.9067 29.1059 19.763Z"
      fill="black"
    />
  </svg>
);

const StatisticsIcon = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M24.075 23.625V8.875C24.075 7 23.275 6.25 21.2875 6.25H19.9875C18 6.25 17.2 7 17.2 8.875V23.625"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.57495 23.625V15.125C6.57495 13.25 7.37495 12.5 9.36245 12.5H10.6625C12.65 12.5 13.45 13.25 13.45 15.125V23.625"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.5 23.75H27.5"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NoteIcon = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 2.5V6.25"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 2.5V6.25"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.75 16.25H18.75"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.75 21.25H15"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 4.375C24.1625 4.6 26.25 6.1875 26.25 12.0625V19.7875C26.25 24.9375 25 27.5125 18.75 27.5125H11.25C5 27.5125 3.75 24.9375 3.75 19.7875V12.0625C3.75 6.1875 5.8375 4.6125 10 4.375H20Z"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ClipboardTickIcon = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.637 18.3752L13.512 20.2502L18.512 15.2502"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.5 7.5H17.5C20 7.5 20 6.25 20 5C20 2.5 18.75 2.5 17.5 2.5H12.5C11.25 2.5 10 2.5 10 5C10 7.5 11.25 7.5 12.5 7.5Z"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 5.0249C24.1625 5.2499 26.25 6.7874 26.25 12.4999V19.9999C26.25 24.9999 25 27.4999 18.75 27.4999H11.25C5 27.4999 3.75 24.9999 3.75 19.9999V12.4999C3.75 6.7999 5.8375 5.2499 10 5.0249"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M23.2532 19.4934L26.6665 16.0801L23.2532 12.6667"
      stroke="black"
      strokeWidth="1.6"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.0134 16.0801H26.5734"
      stroke="black"
      strokeWidth="1.6"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.6801 26.6666C9.78676 26.6666 5.01343 22.6666 5.01343 15.9999C5.01343 9.33325 9.78676 5.33325 15.6801 5.33325"
      stroke="black"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.74 15.53L14.26 12L10.74 8.46997"
      stroke="#1F45FF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WhatsappIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.20008 27.4665C11.2001 28.6665 13.6001 29.3332 16.0001 29.3332C23.3334 29.3332 29.3334 23.3332 29.3334 15.9998C29.3334 8.6665 23.3334 2.6665 16.0001 2.6665C8.66675 2.6665 2.66675 8.6665 2.66675 15.9998C2.66675 18.3998 3.33341 20.6665 4.40008 22.6665L3.254 27.0745C2.99437 28.0731 3.91865 28.9755 4.91073 28.692L9.20008 27.4665Z"
      stroke="white"
      strokeWidth="1.6"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 19.798C22 20.014 21.9519 20.236 21.8498 20.452C21.7476 20.668 21.6154 20.872 21.4412 21.064C21.1467 21.388 20.8222 21.622 20.4557 21.772C20.0951 21.922 19.7046 22 19.2839 22C18.671 22 18.016 21.856 17.325 21.562C16.634 21.268 15.9429 20.872 15.2579 20.374C14.5669 19.87 13.9119 19.312 13.2869 18.694C12.668 18.07 12.1092 17.416 11.6104 16.732C11.1177 16.048 10.7211 15.364 10.4326 14.686C10.1442 14.002 10 13.348 10 12.724C10 12.316 10.0721 11.926 10.2163 11.566C10.3605 11.2 10.5889 10.864 10.9074 10.564C11.2919 10.186 11.7126 10 12.1572 10C12.3255 10 12.4937 10.036 12.644 10.108C12.8002 10.18 12.9384 10.288 13.0466 10.444L14.4407 12.406C14.5488 12.556 14.6269 12.694 14.681 12.826C14.7351 12.952 14.7651 13.078 14.7651 13.192C14.7651 13.336 14.7231 13.48 14.639 13.618C14.5608 13.756 14.4467 13.9 14.3025 14.044L13.8458 14.518C13.7797 14.584 13.7496 14.662 13.7496 14.758C13.7496 14.806 13.7556 14.848 13.7677 14.896C13.7857 14.944 13.8037 14.98 13.8157 15.016C13.9239 15.214 14.1102 15.472 14.3746 15.784C14.645 16.096 14.9334 16.414 15.2459 16.732C15.5704 17.05 15.8828 17.344 16.2013 17.614C16.5138 17.878 16.7722 18.058 16.9765 18.166C17.0065 18.178 17.0426 18.196 17.0846 18.214C17.1327 18.232 17.1808 18.238 17.2349 18.238C17.337 18.238 17.4151 18.202 17.4812 18.136L17.9379 17.686C18.0881 17.536 18.2323 17.422 18.3706 17.35C18.5088 17.266 18.647 17.224 18.7972 17.224C18.9114 17.224 19.0315 17.248 19.1637 17.302C19.2959 17.356 19.4342 17.434 19.5844 17.536L21.5734 18.946C21.7296 19.054 21.8378 19.18 21.9039 19.33C21.9639 19.48 22 19.63 22 19.798Z"
      stroke="white"
      strokeWidth="1.6"
      strokeMiterlimit="10"
    />
  </svg>
);

const EmptyStateIllustration = () => (
  <div className="w-[148px] h-[140px] relative">
    <div className="w-[140px] h-[140px] rounded-full bg-gradient-to-br from-[#EFF0FF] to-[#DFE0F9] border-4 border-white shadow-lg relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="w-[98px] h-[97px] rounded-lg bg-gradient-to-br from-[#B5C0FF] to-[#5464DA] relative">
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-[43px] h-[17px] bg-gradient-to-r from-[#B1BDFF] to-[#7288FE] rounded-full"></div>
              <div className="w-[25px] h-[17px] bg-gradient-to-r from-[#B1BDFF] to-[#7288FE] rounded-full absolute top-0 left-2 rotate-90"></div>
            </div>
            <div className="absolute bottom-6 left-4 right-4">
              <div className="w-[62px] h-[14px] bg-white rounded mb-3"></div>
              <div className="flex items-center mb-2">
                <div className="w-1 h-1 bg-white rounded-full mr-1"></div>
                <div className="w-[47px] h-1 bg-white rounded"></div>
              </div>
              <div className="flex items-center">
                <div className="w-1 h-1 bg-white rounded-full mr-1"></div>
                <div className="w-[32px] h-1 bg-white rounded"></div>
              </div>
            </div>
          </div>
          <div className="absolute -top-5 -right-5 w-[34px] h-[34px] bg-[#0AA4E7] rounded-full border-3 border-white flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 3V11M3 7H11"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
);

function getStatusBadge(status: Ticket["status"]) {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-50 text-green-600 hover:bg-green-50 border-green-200">
          Serviço concluído
        </Badge>
      );
    case "in-progress":
      return (
        <Badge className="bg-yellow-50 text-yellow-600 hover:bg-yellow-50 border-yellow-200">
          Em andamento
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-blue-200">
          Aguardando técnico
        </Badge>
      );
    default:
      return null;
  }
}

export default function SindicoDashboard() {
  const [hasTickets, setHasTickets] = useState(true);

  const activeTicketsCount = mockTickets.filter(
    (ticket) => ticket.status !== "completed",
  ).length;
  const completedTicketsCount = mockTickets.filter(
    (ticket) => ticket.status === "completed",
  ).length;

  return (
    <div className="min-h-screen">
      {/* Header Background */}
      <div
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
            <LogoIcon />
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
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/eb7f373ce9a3bdc3218ef4a11120968a67ec926c?width=660"
            alt="3D illustration"
            className="w-[330px] h-[303px] object-cover drop-shadow-xl"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-[#F5F7FF] min-h-screen -mt-32 relative z-0 pt-32">
        <div className="container mx-auto px-6 lg:px-18 pb-20">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Total Invested */}
            <Card className="bg-white rounded-[20px] p-5 shadow-sm border-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#F5F7FF] flex items-center justify-center">
                  <StatisticsIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Total investido
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    <span className="text-base font-normal">R$</span> 7.400,00
                  </div>
                </div>
              </div>
            </Card>

            {/* Active Tickets */}
            <Card className="bg-white rounded-[20px] p-5 shadow-sm border-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#F5F7FF] flex items-center justify-center">
                  <NoteIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Chamados ativos
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {activeTicketsCount.toString().padStart(2, "0")} chamados
                  </div>
                </div>
              </div>
            </Card>

            {/* Completed Tickets */}
            <Card className="bg-white rounded-[20px] p-5 shadow-sm border-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#F5F7FF] flex items-center justify-center">
                  <ClipboardTickIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Chamados concluídos
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {completedTicketsCount.toString().padStart(2, "0")}{" "}
                    finalizados
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Tickets Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
              <div>
                <h2 className="font-afacad text-3xl font-bold text-black mb-1">
                  Seus Chamados
                </h2>
                <p className="font-afacad text-base text-black">
                  Acompanhe as últimas atualizações ou histórico dos seus
                  pedidos
                </p>
              </div>
              <Button
                className="bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold text-base px-8 py-3 h-12 rounded-xl shadow-lg"
                onClick={() => setHasTickets(!hasTickets)}
              >
                Novo chamado
              </Button>
            </div>

            {hasTickets ? (
              /* Tickets Table */
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                {/* Table Header */}
                <div className="bg-white/30 px-6 py-4 border-b border-[#EFF0FF]">
                  <div className="grid grid-cols-7 gap-4 text-sm font-afacad font-bold text-black">
                    <div>Tipo de chamado</div>
                    <div>Ativo cadastrado</div>
                    <div>Valor do serviço</div>
                    <div>Prestador vinculado</div>
                    <div>Observações gerais</div>
                    <div>Chamado</div>
                    <div>Status do chamado</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-[#EFF0FF]">
                  {mockTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="px-6 py-4 hover:bg-gray-50 group cursor-pointer"
                    >
                      <div className="grid grid-cols-7 gap-4 items-center">
                        <div className="font-afacad text-sm font-bold text-black">
                          {ticket.type}
                        </div>
                        <div className="font-afacad text-sm font-bold text-black">
                          {ticket.asset}
                        </div>
                        <div
                          className={cn(
                            "font-afacad text-sm font-bold",
                            ticket.value.includes("Sem")
                              ? "text-black/50"
                              : "text-black",
                          )}
                        >
                          {ticket.value}
                        </div>
                        <div
                          className={cn(
                            "font-afacad text-sm font-bold",
                            ticket.provider.includes("Sem")
                              ? "text-black/50"
                              : "text-black",
                          )}
                        >
                          {ticket.provider}
                        </div>
                        <div className="font-afacad text-sm font-bold text-black">
                          {ticket.observations}
                        </div>
                        <div className="font-afacad text-sm font-bold text-black">
                          {ticket.ticketId}
                        </div>
                        <div className="flex items-center justify-between">
                          {getStatusBadge(ticket.status)}
                          <div className="w-6 h-6 rounded-full bg-[#F5F7FF] flex items-center justify-center ml-2">
                            <ChevronRightIcon />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-16">
                <EmptyStateIllustration />
                <div className="text-center mt-6 max-w-md">
                  <h3 className="font-afacad text-3xl font-bold text-black mb-3">
                    Olá, Lucas Mezabarba
                  </h3>
                  <p className="font-afacad text-base text-black mb-8">
                    Você ainda não criou nenhum chamado.
                    <br />
                    Quando precisar, registre sua solicitação de forma rápida e
                    prática.
                  </p>
                  <Button
                    className="bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold text-base px-8 py-3 h-12 rounded-xl shadow-lg w-full"
                    onClick={() => setHasTickets(true)}
                  >
                    Novo chamado
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Float Button */}
        <div className="fixed bottom-8 right-8">
          <button className="w-16 h-16 bg-[#10A07B] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
            <WhatsappIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
