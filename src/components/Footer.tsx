export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-blue-600 py-8 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <img 
            src="/horizontal_logo_white.svg" 
            alt="Condy" 
            className="h-8 md:h-10 text-white" 
          />

          <div className="flex items-center space-x-4">
            <span className="text-sm text-white">Incubado por</span>
            <img 
              src="/svg/incubadora_logo.svg" 
              alt="Incubadora" 
              className="h-8" 
            />

            <span className="text-sm text-white ml-4">Acelerado por</span>
            <img 
              src="/logo_aceleradora.png" 
              alt="Aceleradora" 
              className="h-8" 
            />
          </div>
        </div>

        <div className="mt-6 text-center md:text-left text-sm text-white/80">
          Condy Tecnologia LTDA © {currentYear} · Todos os direitos reservados · CNPJ 60.185.344/0001-44
        </div>
      </div>
    </footer>
  );
} 