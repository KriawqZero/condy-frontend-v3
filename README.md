# CONDY - Sistema de Gestão Condominial v3

Sistema completo para gestão de condomínios desenvolvido com Next.js 15, React 19, TypeScript e máxima segurança.

## 🚀 Características Principais

- **Máxima Segurança**: Server-side rendering, sessões seguras com iron-session, server actions
- **Arquitetura Moderna**: Next.js 15 com App Router, React 19, TypeScript
- **UI/UX Otimizada**: Tailwind CSS, componentes responsivos, PWA-ready
- **Autenticação Robusta**: JWT + sessões criptografadas, middleware de proteção
- **Gestão Completa**: Chamados, ativos, imóveis, usuários

## 🏗️ Arquitetura de Segurança

### Server-Side First
- Todas as operações sensíveis executam no servidor
- Server Actions para mutações de dados
- Server Components para busca de dados
- Middleware para proteção de rotas

### Sessões Seguras
- Iron-session com criptografia AES-256
- Cookies httpOnly e secure
- Expiração automática de sessões

### Prevenção de Interceptação
- APIs nunca expostas no cliente
- Tokens JWT gerenciados no servidor
- Validação dupla (cliente + servidor)

## 📱 Funcionalidades por Tipo de Usuário

### Síndico (Residente/Profissional)
- Dashboard com resumo de chamados
- Abertura de novos chamados
- Acompanhamento de status
- Gestão de imóveis e ativos

### Admin Plataforma (Lucas)
- Visão geral de todos os chamados
- Gestão de usuários
- Relatórios e exportação
- Controle de prestadores

### Visitantes
- Consulta pública de chamados
- Status em tempo real
- Informações de contato

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Autenticação**: Iron-session, JWT
- **Validação**: Zod
- **HTTP Client**: Axios (server-side)
- **Icons**: Lucide React

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### 1. Clone o repositório
```bash
git clone <repository-url>
cd condy-frontend-v3
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas configurações:
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
API_URL=http://localhost:3000/api

# Session Configuration (gere chaves seguras)
SESSION_SECRET=sua-chave-secreta-32-chars
IRON_SESSION_PASSWORD=sua-senha-complexa-32-chars-minimo

# Environment
NODE_ENV=development

# WhatsApp Configuration
WHATSAPP_CONTACT_NUMBER=5511999999999
```

### 4. Execute o projeto
```bash
npm run dev
# ou
yarn dev
```

Acesse: http://localhost:3000

## 🔐 Variáveis de Ambiente Críticas

### Gerando Chaves Seguras

```bash
# Para SESSION_SECRET
openssl rand -base64 32

# Para IRON_SESSION_PASSWORD
openssl rand -base64 48
```

## 📖 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── actions/           # Server Actions
│   ├── login/             # Página de login
│   ├── sindico/           # Dashboard do síndico
│   ├── consulta/          # Consulta pública
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── ui/               # Componentes base
│   └── layout/           # Layout components
├── lib/                  # Utilitários
│   ├── api.ts           # Cliente API (server-side)
│   └── session.ts       # Gerenciamento de sessão
├── types/               # Tipos TypeScript
└── middleware.ts        # Middleware de segurança
```

## 🎯 Funcionalidades Implementadas

### ✅ MVP - Acesso Inicial
- [x] **Login idêntico ao projeto Vue** - Layout 50/50, inputs flutuantes
- [x] **Recuperação via WhatsApp** - Seção verde com botão integrado
- [x] **Validação visual em tempo real** - Checkmarks e estados de erro
- [x] **Modal de erro customizado** - Design e UX idênticos
- [x] **Footer com logos** - Incubadora e aceleradora
- [x] **Assets completos** - Todos os SVGs e imagens copiados

### ✅ Dashboard do Síndico
- [x] Boas-vindas personalizadas
- [x] Lista de chamados abertos
- [x] Ações rápidas (novo chamado, ver todos)
- [x] Status coloridos e organizados

### ✅ Consulta Pública
- [x] Busca por número do chamado
- [x] Exibição de status e detalhes
- [x] Design responsivo

### ✅ Segurança e Infraestrutura
- [x] Server Actions para operações sensíveis
- [x] Middleware de proteção de rotas
- [x] Sessões criptografadas
- [x] Tipagem TypeScript completa

## 🔄 Próximos Passos

### Funcionalidades Pendentes
- [ ] Formulário de abertura de chamados
- [ ] Dashboard do admin (Lucas)
- [ ] Gestão de imóveis e ativos
- [ ] Upload de arquivos/fotos
- [ ] Notificações em tempo real
- [ ] Relatórios e exportação

### Melhorias Técnicas
- [ ] Testes automatizados
- [ ] PWA manifest
- [ ] Caching inteligente
- [ ] Otimizações de performance

## 🧪 Dados de Teste

### Login de Teste
```
Email: joao@teste.com
Senha: senha123
```

### Chamados de Teste
- `CH001` - Portão automático (Aberto)
- `CH002` - Vazamento na piscina (Em andamento)

## 📋 **Tela de Login Recriada**

✅ **A tela de login foi completamente recriada** para ser **100% idêntica** ao projeto Vue original!

👉 **Veja todos os detalhes em**: [README-NOVA-TELA-LOGIN.md](./README-NOVA-TELA-LOGIN.md)

**Principais melhorias:**
- Layout 50/50 exato com imagem de fundo
- Inputs flutuantes com validação visual
- Seção verde do WhatsApp para recuperação
- Modal de erro personalizado
- Footer com logos da incubadora e aceleradora

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou suporte, entre em contato via WhatsApp configurado no sistema.

---

**Desenvolvido com foco em segurança e performance para o futuro da gestão condominial.**
