import { motion } from "motion/react";
import { 
  QrCode, 
  LayoutDashboard, 
  ChefHat, 
  Truck, 
  Users, 
  Smartphone, 
  Cloud, 
  ShieldCheck, 
  Store, 
  MessageCircle, 
  ArrowRight, 
  CheckCircle2, 
  Monitor, 
  CreditCard, 
  ClipboardList, 
  Zap,
  Menu,
  X,
  Scale,
  WifiOff,
  Printer,
  Coins,
  Search,
  Barcode,
  Wallet,
  History,
  FileText
} from "lucide-react";
import { useState } from "react";

const LOGO_HORIZONTAL = "https://storage.googleapis.com/static.ai.studio/attachments/80708660-8f9f-4318-9710-44445853f938/DevARO_Tecnologia_em_movimento.png";
const LOGO_ICON = "https://storage.googleapis.com/static.ai.studio/attachments/80708660-8f9f-4318-9710-44445853f938/DevARO_Icon.png";

const Logo = ({ type = "horizontal", className = "" }: { type?: "horizontal" | "icon", className?: string }) => {
  const [error, setError] = useState(false);
  const src = type === "horizontal" ? LOGO_HORIZONTAL : LOGO_ICON;

  if (error) {
    return (
      <div className={`flex items-center font-display font-bold italic text-2xl ${className}`}>
        <span className="text-brand-cyan">Dev</span>
        <span className="text-white">ARO</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt="DevARO Logo" 
      className={className}
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
    />
  );
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass p-6 rounded-2xl flex flex-col gap-4 hover:border-brand-cyan/50 transition-colors"
  >
    <div className="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-cyan">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-semibold font-display">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const SectionTitle = ({ subtitle, title, description }: { subtitle: string, title: string, description?: string }) => (
  <div className="flex flex-col gap-4 mb-12">
    <span className="text-brand-cyan font-semibold tracking-wider uppercase text-xs">{subtitle}</span>
    <h2 className="text-3xl md:text-4xl font-bold font-display">{title}</h2>
    {description && <p className="text-gray-400 max-w-2xl">{description}</p>}
  </div>
);

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen selection:bg-brand-cyan selection:text-brand-dark">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b-0 mt-4 mx-4 md:mx-12 rounded-2xl">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="cursor-pointer">
            <Logo type="horizontal" className="h-24 md:h-28" />
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection("cliente")} className="text-sm font-medium hover:text-brand-cyan transition-colors">Cliente</button>
            <button onClick={() => scrollToSection("operacional")} className="text-sm font-medium hover:text-brand-cyan transition-colors">Operacional</button>
            <button onClick={() => scrollToSection("pdv")} className="text-sm font-medium hover:text-brand-cyan transition-colors">PDV</button>
            <button onClick={() => scrollToSection("admin")} className="text-sm font-medium hover:text-brand-cyan transition-colors">Admin</button>
            <button onClick={() => scrollToSection("tecnico")} className="text-sm font-medium hover:text-brand-cyan transition-colors">Diferenciais</button>
            <a 
              href="https://wa.me/5585987582159" 
              target="_blank" 
              className="bg-brand-blue hover:bg-brand-blue/80 px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2"
            >
              Falar com Consultor
            </a>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass border-t border-white/10 p-6 flex flex-col gap-4 rounded-b-2xl"
          >
            <button onClick={() => scrollToSection("cliente")} className="text-left py-2">Cliente</button>
            <button onClick={() => scrollToSection("operacional")} className="text-left py-2">Operacional</button>
            <button onClick={() => scrollToSection("pdv")} className="text-left py-2">PDV</button>
            <button onClick={() => scrollToSection("admin")} className="text-left py-2">Admin</button>
            <button onClick={() => scrollToSection("tecnico")} className="text-left py-2">Diferenciais</button>
            <a 
              href="https://wa.me/5585987582159" 
              target="_blank" 
              className="bg-brand-blue py-3 rounded-xl text-center font-semibold flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} /> WhatsApp
            </a>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight mb-6">
              O Futuro da sua <span className="text-gradient">Empresa</span> está na Nuvem.
            </h1>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed">
              Elimine erros de comunicação e acelere seu atendimento com o DevARO. 
              Um sistema <span className="text-white font-semibold">Mobile First</span> completo para empresas e negócios modernos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="https://dev-aro-clientes.vercel.app/?view=showcase&product=bc14dca8-73d6-44e0-a400-da752db2f481" 
                className="bg-brand-blue hover:bg-brand-blue/80 px-8 py-4 rounded-full text-lg font-semibold transition-all flex items-center justify-center gap-2 group"
              >
                Solicitar Demonstração <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </a>
              <button 
                onClick={() => scrollToSection("cliente")}
                className="glass hover:bg-white/10 px-8 py-4 rounded-full text-lg font-semibold transition-all"
              >
                Ver Funcionalidades
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-brand-blue/20 blur-3xl rounded-full"></div>
            <Logo type="icon" className="relative w-full max-w-4xl mx-auto drop-shadow-2xl animate-float" />
          </motion.div>
        </div>
      </section>

      {/* 1. Experiência do Cliente */}
      <section id="cliente" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <SectionTitle 
            subtitle="Front-end" 
            title="Experiência do Cliente Elevada" 
            description="Proporcione uma jornada moderna e intuitiva para seus clientes, desde a escolha do produto até a retirada."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Smartphone} 
              title="Menu Digital Local & Delivery" 
              description="Atendimento local e a distância (entrega/retirada) com interface intuitiva e fotos reais."
            />
            <FeatureCard 
              icon={QrCode} 
              title="Autoatendimento QR Code" 
              description="Acesso rápido ao cardápio vinculado diretamente ao cliente, sem necessidade de intermediários."
            />
            <FeatureCard 
              icon={Truck} 
              title="Cálculo de Frete Inteligente" 
              description="Cálculo automático de frete com regras flexíveis definidas pelo administrador."
            />
            <FeatureCard 
              icon={CheckCircle2} 
              title="Programa de Fidelidade" 
              description="Gestão automática de pontos e benefícios para fidelizar seus clientes recorrentes."
            />
            <FeatureCard 
              icon={Monitor} 
              title="Status do Pedido" 
              description="O cliente consulta o status do preparo e entrega em tempo real, direto do seu dispositivo."
            />
          </div>
        </div>
      </section>

      {/* 2. Gestão Operacional */}
      <section id="operacional" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionTitle 
            subtitle="Staff Panels" 
            title="Gestão Operacional de Alta Performance" 
            description="Ferramentas otimizadas para sua equipe trabalhar com agilidade e zero erros."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={CreditCard} 
              title="PDV de Balcão" 
              description="Interface otimizada para vendas rápidas presenciais, integrada com pagamentos."
            />
            <FeatureCard 
              icon={ClipboardList} 
              title="Gestão de Comandas" 
              description="Controle total sobre pedidos pendentes e fechamento instantâneo de contas."
            />
            <FeatureCard 
              icon={Users} 
              title="Painel de Atendimento" 
              description="Ferramenta móvel para lançamento de pedidos diretamente do ponto de atendimento."
            />
            <FeatureCard 
              icon={Zap} 
              title="PDS (Production System)" 
              description="Painel digital para gerenciar a fila de produção em tempo real, sem papel e sem confusão."
            />
            <FeatureCard 
              icon={Truck} 
              title="Logística de Entregas" 
              description="Controle de entregadores e status de pedidos de delivery em tempo real."
            />
          </div>
        </div>
      </section>

      {/* PDV Deep Dive */}
      <section id="pdv" className="py-24 px-6 bg-brand-blue/5">
        <div className="max-w-7xl mx-auto">
          <SectionTitle 
            subtitle="O Coração da Operação" 
            title="PDVDevARO: Ágil, Intuitivo e Resiliente" 
            description="Projetado para manter sua empresa vendendo, não importa o que aconteça."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 1. Gestão de Vendas Multimodal */}
            <div className="glass p-8 rounded-3xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-cyan">
                  <Store size={24} />
                </div>
                <h3 className="text-2xl font-bold font-display">Gestão Multimodal</h3>
              </div>
              <ul className="space-y-4 text-gray-400">
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Venda de Balcão:</strong> Fluxo rápido para compra e retirada imediata.</span></li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Mesas e Comandas:</strong> Busca por número, adição de itens e fechamento parcial/total.</span></li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Delivery:</strong> Registro completo com endereço, telefone e atribuição de entregador.</span></li>
              </ul>
            </div>

            {/* 2. Controle de Produtos e Estoque */}
            <div className="glass p-8 rounded-3xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-cyan">
                  <Barcode size={24} />
                </div>
                <h3 className="text-2xl font-bold font-display">Produtos e Estoque</h3>
              </div>
              <ul className="space-y-4 text-gray-400">
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Busca Inteligente:</strong> Localização por nome, categoria ou código de barras.</span></li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Venda por Peso:</strong> Integração nativa via Web Serial API para balanças USB/Serial.</span></li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Baixa Automática:</strong> Atualização de estoque em tempo real a cada venda.</span></li>
              </ul>
            </div>

            {/* 3. Flexibilidade de Pagamentos */}
            <div className="glass p-8 rounded-3xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-cyan">
                  <Wallet size={24} />
                </div>
                <h3 className="text-2xl font-bold font-display">Pagamentos Flexíveis</h3>
              </div>
              <ul className="space-y-4 text-gray-400">
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Pagamentos Mistos:</strong> Use múltiplos métodos em uma única conta.</span></li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Modalidades:</strong> PIX, Cartões, Dinheiro, Vales e Cashback.</span></li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Calculadora de Troco:</strong> Agilidade garantida no recebimento em dinheiro.</span></li>
              </ul>
            </div>

            {/* 4. Gestão de Caixa */}
            <div className="glass p-8 rounded-3xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-cyan">
                  <FileText size={24} />
                </div>
                <h3 className="text-2xl font-bold font-display">Gestão de Caixa</h3>
              </div>
              <ul className="space-y-4 text-gray-400">
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Turnos:</strong> Controle rigoroso de abertura e fechamento com conferência.</span></li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Sangria e Suprimento:</strong> Registro de movimentações com justificativa.</span></li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Relatórios:</strong> Resumo detalhado por método de pagamento e vendas.</span></li>
              </ul>
            </div>

            {/* 5. Inteligência e Fidelização */}
            <div className="glass p-8 rounded-3xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-cyan">
                  <History size={24} />
                </div>
                <h3 className="text-2xl font-bold font-display">Inteligência e Fidelidade</h3>
              </div>
              <ul className="space-y-4 text-gray-400">
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Identificação:</strong> Busca rápida de clientes por CPF ou Telefone.</span></li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Cashback Automático:</strong> Cálculo e aplicação de créditos durante a venda.</span></li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Histórico:</strong> Perfil do cliente e preferências sempre à mão.</span></li>
              </ul>
            </div>

            {/* 6. Tecnologia e Resiliência */}
            <div className="glass p-8 rounded-3xl border-brand-cyan/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-brand-cyan/20 flex items-center justify-center text-brand-cyan">
                  <WifiOff size={24} />
                </div>
                <h3 className="text-2xl font-bold font-display">Tecnologia e Resiliência</h3>
              </div>
              <ul className="space-y-4 text-gray-400">
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Modo Contingência:</strong> Continue vendendo offline. Sincronização automática com a Nuvem.</span></li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Impressão Térmica:</strong> Suporte para cupons de 58mm e 80mm.</span></li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Responsividade:</strong> Otimizado para Desktop, Tablets e Celulares.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Administração e Estratégia */}
      <section id="admin" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <SectionTitle 
            subtitle="Back-office" 
            title="Administração e Estratégia" 
            description="Tenha o controle total do seu negócio em suas mãos, de qualquer lugar do mundo."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={LayoutDashboard} 
              title="Dashboard Administrativo" 
              description="Visão geral de vendas, pedidos e desempenho da empresa em gráficos intuitivos."
            />
            <FeatureCard 
              icon={Store} 
              title="Inventário e Catálogo" 
              description="Controle de produtos, preços, categorias e disponibilidade em tempo real."
            />
            <FeatureCard 
              icon={Users} 
              title="Gestão de Equipe" 
              description="Controle de permissões e comissões independentes para cada colaborador."
            />
            <FeatureCard 
              icon={MessageCircle} 
              title="CRM de Clientes" 
              description="Base de dados para ações de marketing direcionadas e fidelização estratégica."
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="White Label" 
              description="Personalização total de cores, logotipos e informações com a identidade da sua marca."
            />
            <FeatureCard 
              icon={Cloud} 
              title="Super Admin" 
              description="Gerencie múltiplas unidades ou franquias a partir de um único portal centralizado."
            />
          </div>
        </div>
      </section>

      {/* 4. Diferenciais Técnicos */}
      <section id="tecnico" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionTitle 
            subtitle="Diferenciais" 
            title="Tecnologia de Ponta" 
            description="Arquitetura moderna para garantir que seu negócio nunca pare."
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-4">
              <div className="text-brand-cyan font-bold text-4xl font-display italic">PWA</div>
              <h4 className="font-bold text-lg">App Nativo</h4>
              <p className="text-gray-400 text-sm">Instale no Android, iOS ou Windows. Funciona offline para consultas.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-brand-cyan font-bold text-4xl font-display italic">100%</div>
              <h4 className="font-bold text-lg">Sincronização Real</h4>
              <p className="text-gray-400 text-sm">Atualizações instantâneas entre atendimento, produção e cliente via nuvem.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-brand-cyan font-bold text-4xl font-display italic">Multi</div>
              <h4 className="font-bold text-lg">Arquitetura Loja</h4>
              <p className="text-gray-400 text-sm">Suporte a diferentes unidades através de subdomínios ou slugs.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-brand-cyan font-bold text-4xl font-display italic">Safe</div>
              <h4 className="font-bold text-lg">Segurança Avançada</h4>
              <p className="text-gray-400 text-sm">Controle de acesso granular por níveis de permissão (Admin, Staff, etc).</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto glass p-12 rounded-[3rem] text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/20 blur-[100px] -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-cyan/10 blur-[100px] -ml-32 -mb-32"></div>
          
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 relative z-10">
            Pronto para transformar sua <span className="text-gradient">gestão</span>?
          </h2>
          <p className="text-gray-400 mb-10 text-lg relative z-10">
            Junte-se a dezenas de empresas que já utilizam o DevARO para crescer.
          </p>
          <a 
            href="https://dev-aro-clientes.vercel.app/?view=showcase&product=bc14dca8-73d6-44e0-a400-da752db2f481" 
            className="inline-flex bg-brand-cyan text-brand-dark hover:bg-white px-10 py-4 rounded-full text-xl font-bold transition-all relative z-10"
          >
            Começar Agora
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo type="horizontal" className="h-20" />
          <p className="text-gray-500 text-sm">© 2026 DevARO - Tecnologia em Movimento. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-brand-cyan transition-colors">Privacidade</a>
            <a href="#" className="text-gray-400 hover:text-brand-cyan transition-colors">Termos</a>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/5585987582159" 
        target="_blank"
        className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
      >
        <MessageCircle size={32} fill="currentColor" />
      </a>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
