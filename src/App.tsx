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
  FileText,
  Image as ImageIcon,
  Film,
  Tags,
  Percent,
  SmartphoneNfc,
  Receipt
} from "lucide-react";
import { useState, useEffect } from "react";

interface Asset {
  id: number;
  type: "photo" | "video";
  url: string;
  title: string;
  category: string;
  created_at: string;
}

const GALLERY_ASSETS: Asset[] = [
  {
    id: 1,
    type: "photo",
    url: "/pdv-mobile.jpg",
    title: "PDV Versão Mobile",
    category: "PDV Mobile",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    type: "photo",
    url: "/mapa-mesas.png",
    title: "Mapa de Mesas",
    category: "Painel Atendente",
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    type: "photo",
    url: "/pedidos-ativos.png",
    title: "Pedidos Ativos",
    category: "Painel Atendente",
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    type: "photo",
    url: "/gestao-comanda.png",
    title: "Gestão de Comanda",
    category: "Controle de Mesa",
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    type: "photo",
    url: "/painel-admin.png",
    title: "Painel Administrativo",
    category: "Gestão",
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    type: "video",
    url: "/menu-digital.mp4",
    title: "Demonstração Menu Digital",
    category: "Menu Digital",
    created_at: new Date().toISOString()
  }
];

const DynamicGallery = () => {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const assets = GALLERY_ASSETS;

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

        {/* Category Tabs */}
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
      </div>
    </section>
  );
};

const LOGO_HORIZONTAL = "/logo-horizontal.png";
const LOGO_ICON = "/logo-icon.png";

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

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Admin />} />
        <Route path="/site" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}
