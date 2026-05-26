import { motion } from "motion/react";
import { 
  QrCode, LayoutDashboard, ChefHat, Truck, Users, Smartphone, Cloud, 
  ShieldCheck, Store, MessageCircle, ArrowRight, CheckCircle2, Monitor, 
  CreditCard, ClipboardList, Zap, Menu, X, Scale, WifiOff, Printer, 
  Coins, Search, Barcode, Wallet, History, FileText, Image as ImageIcon, 
  Film, Tags, Percent, SmartphoneNfc, Receipt
} from "lucide-react";
import { useState, useEffect } from "react";
import { Asset, Settings } from "../types";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";

const DynamicGallery = ({ assets }: { assets: Asset[] }) => {
  const [activeCategory, setActiveCategory] = useState("Todos");
  
  const categories = ["Todos", ...Array.from(new Set(assets.map(a => a.category))).sort()];
  const filteredAssets = activeCategory === "Todos" 
    ? assets 
    : assets.filter(a => a.category === activeCategory);

  return (
    <section id="galeria" className="py-24 px-6 bg-brand-blue/5">
      <div className="max-w-7xl mx-auto">
        <SectionTitle 
          subtitle="Showcase" 
          title="Nossa Tecnologia em Detalhes" 
          description="Explore as interfaces e funcionalidades que transformam a gestão do seu negócio."
        />

        <div className="flex flex-wrap gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat 
                ? "bg-brand-cyan text-brand-dark shadow-lg shadow-brand-cyan/20" 
                : "glass hover:bg-white/10 text-gray-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredAssets.length === 0 ? (
           <p className="text-gray-400">Nenhum asset cadastrado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAssets.map((asset) => (
              <motion.div 
                key={asset.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="glass overflow-hidden rounded-[2rem] group border-white/5 hover:border-brand-cyan/30 transition-colors"
              >
                <div className="aspect-[9/16] md:aspect-video relative bg-brand-dark/40 overflow-hidden">
                  {asset.type === "photo" ? (
                    <img 
                      src={asset.url} 
                      alt={asset.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <video 
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                      preload="auto"
                      muted
                    >
                      <source src={asset.url} type="video/mp4" />
                      Seu navegador não suporta vídeos.
                    </video>
                  )}
                  <div className="absolute top-4 right-4 bg-brand-dark/80 backdrop-blur-xl p-2.5 rounded-2xl border border-white/10">
                    {asset.type === "photo" ? <ImageIcon size={20} className="text-brand-cyan" /> : <Film size={20} className="text-brand-cyan" />}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-8">
                  <span className="text-brand-cyan text-xs font-bold uppercase tracking-widest mb-2 block">{asset.category}</span>
                  <h4 className="text-xl font-bold font-display">{asset.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const Logo = ({ logoUrl, type = "horizontal", className = "" }: { logoUrl?: string, type?: "horizontal" | "icon", className?: string }) => {
  const [error, setError] = useState(false);
  const src = logoUrl || (type === "horizontal" ? "/logo-horizontal.png" : "/logo-icon.png");

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

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [settings, setSettings] = useState<Settings>({ whatsapp: "5585987582159", logo_url: "/logo-horizontal.png" });
  const [leadName, setLeadName] = useState("");
  const [leadContact, setLeadContact] = useState("");
  const [leadStatus, setLeadStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    fetch("/api/assets").then(res => res.json()).then(setAssets).catch(console.error);
    fetch("/api/settings").then(res => res.json()).then(data => {
      setSettings(data);
    }).catch(console.error);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  const whatsappLink = `https://wa.me/${settings.whatsapp?.replace(/\\D/g, '') || "5585987582159"}`;

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: leadName, contact: leadContact })
      });
      if (res.ok) {
        setLeadStatus("success");
        setLeadName("");
        setLeadContact("");
        setTimeout(() => setLeadStatus("idle"), 3000);
      } else {
        setLeadStatus("error");
      }
    } catch {
      setLeadStatus("error");
    }
  };

  return (
    <div className="min-h-screen selection:bg-brand-cyan selection:text-brand-dark">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b-0 mt-4 mx-4 md:mx-12 rounded-2xl">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="cursor-pointer">
            <Logo logoUrl={settings.logo_url} type="horizontal" className="h-24 md:h-28" />
          </div>
          
          <div className="hidden lg:flex items-center gap-6">
            <button onClick={() => scrollToSection("cliente")} className="text-sm font-medium hover:text-brand-cyan transition-colors">Cliente</button>
            <button onClick={() => scrollToSection("operacional")} className="text-sm font-medium hover:text-brand-cyan transition-colors">Operacional</button>
            <button onClick={() => scrollToSection("pdv")} className="text-sm font-medium hover:text-brand-cyan transition-colors">PDV</button>
            <button onClick={() => scrollToSection("galeria")} className="text-sm font-medium hover:text-brand-cyan transition-colors">Galeria</button>
            <button onClick={() => scrollToSection("contato")} className="text-sm font-medium hover:text-brand-cyan transition-colors">Contato</button>
            <a 
              href={whatsappLink} 
              target="_blank" 
              className="bg-brand-blue hover:bg-brand-blue/80 px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 border border-brand-cyan/30"
            >
              Falar com Consultor
            </a>
          </div>

          <button className="lg:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden glass border-t border-white/10 p-6 flex flex-col gap-4 rounded-b-2xl"
          >
            <button onClick={() => scrollToSection("cliente")} className="text-left py-2">Cliente</button>
            <button onClick={() => scrollToSection("operacional")} className="text-left py-2">Operacional</button>
            <button onClick={() => scrollToSection("pdv")} className="text-left py-2">PDV</button>
            <button onClick={() => scrollToSection("galeria")} className="text-left py-2">Galeria</button>
            <button onClick={() => scrollToSection("contato")} className="text-left py-2">Contato</button>
            <a 
              href={whatsappLink} 
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
              Elimine erros de comunicação e acelere seu atendimento com nosso sistema. 
              Um ambiente <span className="text-white font-semibold">Mobile First</span> completo para negócios modernos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => scrollToSection("contato")}
                className="bg-brand-blue hover:bg-brand-blue/80 px-8 py-4 rounded-full text-lg font-semibold transition-all flex items-center justify-center gap-2 group"
              >
                Solicitar Contato <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
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
            <Logo logoUrl={settings.logo_url} type="icon" className="relative w-full max-w-xl mx-auto drop-shadow-2xl animate-float min-h-[200px]" />
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
              icon={Tags} 
              title="Opções & Complementos" 
              description="Personalização total dos produtos com opções de tamanhos, bordas e complementos extras."
            />
            <FeatureCard 
              icon={Percent} 
              title="Promoções de Desconto" 
              description="Gestão de descontos agressivos por item ou categoria, ideal para ofertas relâmpago."
            />
          </div>
        </div>
      </section>

      {/* PDV Deep Dive */}
      <section id="pdv" className="py-24 px-6 bg-brand-blue/5">
        <div className="max-w-7xl mx-auto">
          <SectionTitle 
            subtitle="O Coração da Operação" 
            title="PDV: Ágil, Intuitivo e Resiliente" 
            description="Projetado para manter sua empresa vendendo, não importa o que aconteça."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              </ul>
            </div>
            <div className="glass p-8 rounded-3xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-cyan">
                  <Wallet size={24} />
                </div>
                <h3 className="text-2xl font-bold font-display">Pagamentos Flexíveis</h3>
              </div>
              <ul className="space-y-4 text-gray-400">
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Pagamentos Mistos:</strong> Use múltiplos métodos em uma única conta.</span></li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-brand-cyan shrink-0" /> <span><strong className="text-white">Calculadora de Troco:</strong> Agilidade garantida no recebimento.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <DynamicGallery assets={assets} />

      {/* Contato / CTA Final */}
      <section id="contato" className="py-24 px-6">
        <div className="max-w-4xl mx-auto glass p-12 rounded-[3rem] text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/20 blur-[100px] -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-cyan/10 blur-[100px] -ml-32 -mb-32"></div>
          
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 relative z-10">
            Pronto para <span className="text-gradient">revolucionar</span> seu atendimento?
          </h2>
          <p className="text-gray-400 mb-10 text-lg relative z-10">
            Deixe seu e-mail ou WhatsApp corporativo abaixo e um de nossos consultores entrará em contato com você o mais rápido possível para apresentar nossas soluções e agendar uma demonstração exclusiva.
          </p>
          
          <form onSubmit={submitLead} className="relative z-10 max-w-md mx-auto flex flex-col gap-4">
            <input 
              type="text" 
              required
              disabled={leadStatus === "submitting"}
              placeholder="Seu nome" 
              value={leadName}
              onChange={e => setLeadName(e.target.value)}
              className="bg-brand-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan disabled:opacity-50"
            />
            <input 
              type="text" 
              required
              disabled={leadStatus === "submitting"}
              placeholder="E-mail ou WhatsApp" 
              value={leadContact}
              onChange={e => setLeadContact(e.target.value)}
              className="bg-brand-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={leadStatus === "submitting" || !leadName || !leadContact}
              className="mt-2 inline-flex justify-center items-center bg-brand-cyan text-brand-dark hover:bg-white px-10 py-4 rounded-xl text-lg font-bold transition-all disabled:opacity-50"
            >
              {leadStatus === "submitting" ? "Enviando..." : "Quero um contato"}
            </button>
            
            {leadStatus === "success" && (
              <p className="text-green-400 font-medium">Informações enviadas com sucesso! Entraremos em contato em breve.</p>
            )}
            {leadStatus === "error" && (
              <p className="text-red-400 font-medium">Ocorreu um erro ao enviar. Tente novamente ou use o botão do WhatsApp.</p>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo logoUrl={settings.logo_url} type="horizontal" className="h-12" />
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} - Tecnologia em Movimento. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="/" className="text-gray-400 hover:text-brand-cyan transition-colors">Acesso Restrito</a>
            <a href="#" className="text-gray-400 hover:text-brand-cyan transition-colors">Privacidade</a>
            <a href="#" className="text-gray-400 hover:text-brand-cyan transition-colors">Termos</a>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a 
        href={whatsappLink} 
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
