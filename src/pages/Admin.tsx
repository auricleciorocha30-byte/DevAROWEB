import React, { useState, useEffect } from "react";
import { Asset, Category, Lead, Settings } from "../types";
import { LogOut, Trash2, Plus, GripVertical, Download, Link as LinkIcon, Edit2, Play, Image as ImageIcon, Tags, Users, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [activeTab, setActiveTab] = useState<"assets" | "categories" | "settings" | "leads" | "account">("assets");

  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<Settings>({});

  // Form states
  const [newCatName, setNewCatName] = useState("");
  const [newAsset, setNewAsset] = useState({ type: "photo", url: "", title: "", category: "Geral" });
  
  const [setWhats, setSetWhats] = useState("");
  const [setLogo, setSetLogo] = useState("");
  const [fileKey, setFileKey] = useState(Date.now());

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
  }, [authenticated]);

  const fetchData = async () => {
    fetch("/api/categories").then(res => res.json()).then(setCategories);
    fetch("/api/assets").then(res => res.json()).then(setAssets);
    fetch("/api/leads").then(res => res.json()).then(setLeads);
    fetch("/api/settings").then(res => res.json()).then(data => {
      setSettings(data);
      setSetWhats(data.whatsapp || "");
      setSetLogo(data.logo_url || "");
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (res.ok && data.success) {
          setAuthenticated(true);
          setUserEmail(data.email);
        } else {
          const detailStr = data.details ? ` (${data.details})` : "";
          setLoginError((data.error || "Credenciais inválidas") + detailStr);
        }
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        try {
          const json = JSON.parse(text);
          setLoginError(`${json.error || 'Erro'} ${json.details ? ': ' + json.details : ''}`);
        } catch {
          setLoginError(`Erro do servidor (${res.status}). Verifique as configurações do banco de dados.`);
        }
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      setLoginError("Erro de conexão ao servidor. Verifique se o backend está rodando.");
    }
  };

  // --- Actions ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    await fetch("/api/categories", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ name: newCatName }) });
    setNewCatName("");
    fetchData();
  };

  const handleDeleteCategory = async (id: number) => {
    if(!confirm("Tem certeza que quer excluir esta categoria?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.url || !newAsset.title) return;
    await fetch("/api/assets", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(newAsset) });
    setNewAsset({ type: "photo", url: "", title: "", category: categories[0]?.name || "Geral" });
    setFileKey(Date.now());
    fetchData();
  };

  const handleDeleteAsset = async (id: number) => {
    if(!confirm("Certeza que deseja excluir esta mídia?")) return;
    await fetch(`/api/assets/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/settings", { 
      method: "POST", 
      headers: {"Content-Type": "application/json"}, 
      body: JSON.stringify({ whatsapp: setWhats, logo_url: setLogo }) 
    });
    alert("Configurações salvas!");
    fetchData();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage("");
    try {
      const res = await fetch("/api/users/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordMessage("Senha alterada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setPasswordMessage(data.error || "Erro ao alterar a senha");
      }
    } catch {
      setPasswordMessage("Erro de conexão");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-brand-dark/50">
        <form onSubmit={handleLogin} className="glass p-8 rounded-2xl w-full max-w-sm flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 blur-[50px] -mr-16 -mt-16"></div>
          
          <h2 className="text-2xl font-display font-bold text-white mb-2 relative z-10 flex items-center gap-2">
            <Lock size={24} className="text-brand-cyan" /> Acesso Admin
          </h2>
          {loginError && <p className="text-red-400 text-sm relative z-10">{loginError}</p>}
          
          <input 
            type="email" 
            placeholder="E-mail" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="relative z-10 bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-cyan"
          />
          <input 
            type="password" 
            placeholder="Senha" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="relative z-10 bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-cyan mb-4"
          />
          <button className="relative z-10 bg-brand-cyan text-brand-dark font-bold py-3 rounded-xl hover:bg-white transition-colors">Entrar no Painel</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-display font-bold">Painel Administrativo</h1>
            <p className="text-gray-400">Gerencie conteúdos do seu site</p>
          </div>
          <div className="flex gap-4">
             <Link to="/site" target="_blank" className="bg-brand-blue/20 hover:bg-brand-blue/40 text-brand-cyan border border-brand-cyan/20 px-4 py-2 flex items-center gap-2 rounded-lg font-medium transition-colors">
              <LinkIcon size={18} /> Ver Site
            </Link>
            <button onClick={() => setAuthenticated(false)} className="glass hover:bg-white/10 text-gray-300 px-4 py-2 flex items-center gap-2 rounded-lg font-medium transition-colors">
              <LogOut size={18} /> Sair
            </button>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64 shrink-0">
            <nav className="flex flex-col gap-2">
              <TabButton active={activeTab === "assets"} onClick={() => setActiveTab("assets")} icon={<ImageIcon size={18}/>} label="Fotos e Vídeos" />
              <TabButton active={activeTab === "categories"} onClick={() => setActiveTab("categories")} icon={<Tags size={18}/>} label="Categorias" />
              <TabButton active={activeTab === "settings"} onClick={() => setActiveTab("settings")} icon={<Edit2 size={18}/>} label="Personalização" />
              <TabButton active={activeTab === "leads"} onClick={() => setActiveTab("leads")} icon={<Users size={18}/>} label="Leads (Contatos)" />
              <TabButton active={activeTab === "account"} onClick={() => setActiveTab("account")} icon={<Lock size={18}/>} label="Minha Conta" />
            </nav>
          </aside>

          <main className="flex-1 glass p-6 md:p-8 rounded-3xl min-h-[500px]">
            {activeTab === "assets" && (
              <div className="animate-in fade-in">
                <h2 className="text-2xl font-bold mb-6">Gerenciar Mídias</h2>
                
                <form onSubmit={handleAddAsset} className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Tipo da mídia</label>
                    <select value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2">
                      <option value="photo">Foto</option>
                      <option value="video">Vídeo</option>
                    </select>
                  </div>
                  <div>
                     <label className="block text-sm text-gray-400 mb-1">Categoria (crie em "Categorias")</label>
                    <select value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value})} className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2">
                      <option value="Geral">Geral (Default)</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">Arquivo (Imagem ou Vídeo)</label>
                    <input 
                      key={fileKey}
                      type="file" 
                      accept="image/*,video/*" 
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const base64 = await fileToBase64(e.target.files[0]);
                          setNewAsset({...newAsset, url: base64});
                        }
                      }} 
                      className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-gray-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-brand-cyan file:text-brand-dark hover:file:bg-white cursor-pointer" 
                      required 
                    />
                  </div>
                   <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">Título / Descrição</label>
                    <input type="text" placeholder="Ex: Telas PDV" value={newAsset.title} onChange={e => setNewAsset({...newAsset, title: e.target.value})} className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2" required />
                  </div>
                  <div className="md:col-span-2 mt-2">
                    <button type="submit" className="bg-brand-cyan text-brand-dark font-bold px-6 py-2 rounded-lg hover:bg-white transition-colors flex items-center gap-2">
                      <Plus size={18} /> Adicionar Mídia
                    </button>
                  </div>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {assets.map(asset => (
                    <div key={asset.id} className="bg-brand-dark/50 border border-white/10 rounded-xl overflow-hidden group">
                      <div className="aspect-video relative bg-black">
                        {asset.type === 'photo' ? (
                           <img src={asset.url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center relative">
                            <video src={asset.url} className="w-full h-full object-cover opacity-50" />
                            <Play className="absolute text-brand-cyan" size={32} />
                          </div>
                        )}
                        <button onClick={() => handleDeleteAsset(asset.id)} className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="text-xs text-brand-cyan mb-1">{asset.category}</div>
                        <div className="font-semibold">{asset.title}</div>
                      </div>
                    </div>
                  ))}
                  {assets.length === 0 && <p className="text-gray-400">Nenhuma mídia encontrada.</p>}
                </div>
              </div>
            )}

            {activeTab === "categories" && (
              <div className="animate-in fade-in">
                <h2 className="text-2xl font-bold mb-6">Categorias do Portfólio</h2>
                
                <form onSubmit={handleAddCategory} className="flex gap-4 mb-8">
                  <input type="text" placeholder="Nome da nova categoria" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="flex-1 bg-brand-dark border border-white/10 rounded-lg px-4 py-3" required />
                  <button type="submit" className="bg-brand-cyan text-brand-dark font-bold px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-white transition-colors">
                    <Plus size={18} /> Adicionar
                  </button>
                </form>

                <div className="flex flex-col gap-3">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between bg-white/5 border border-white/10 px-4 py-3 rounded-lg">
                      <span className="font-medium">{cat.name}</span>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={18} /></button>
                    </div>
                  ))}
                  {categories.length === 0 && <p className="text-gray-400">Nenhuma categoria cadastrada.</p>}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="animate-in fade-in">
                <h2 className="text-2xl font-bold mb-6">Personalização do Site</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <form onSubmit={handleSaveSettings} className="flex flex-col gap-6 max-w-xl">
                    <div>
                      <label className="block font-medium mb-2">WhatsApp Consultor (Apenas números)</label>
                      <input type="text" placeholder="5585987582159" value={setWhats} onChange={e => setSetWhats(e.target.value)} className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white" />
                      <p className="text-xs text-gray-400 mt-2">Usado no botão flutuante e chamadas para ação.</p>
                    </div>
                    <div>
                      <label className="block font-medium mb-2">Logotipo do Site</label>
                      <div className="flex flex-col gap-3">
                        {setLogo && (
                          <div className="flex items-center gap-4">
                            <img src={setLogo} alt="Logo Preview" className="h-16 object-contain bg-black/20 p-2 rounded-lg" />
                            <button type="button" onClick={() => setSetLogo("")} className="text-sm text-red-500 hover:underline">Remover Atual</button>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const base64 = await fileToBase64(e.target.files[0]);
                              setSetLogo(base64);
                            }
                          }} 
                          className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-gray-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-brand-cyan file:text-brand-dark hover:file:bg-white cursor-pointer" 
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                       <button type="submit" className="bg-brand-cyan text-brand-dark font-bold px-8 py-3 rounded-xl hover:bg-white transition-colors">
                        Salvar Alterações
                      </button>
                    </div>
                  </form>

                  <div className="bg-white/5 border border-white/10 p-8 rounded-2xl flex flex-col items-center justify-center text-center">
                    <h3 className="text-xl font-bold mb-2">Acesso Rápido</h3>
                    <p className="text-gray-400 mb-6 text-sm">Escaneie o QR Code abaixo para acessar e compartilhar o site gerado.</p>
                    <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
                      <QRCodeSVG 
                        value={`${window.location.origin}/site`}
                        size={200}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"Q"}
                        includeMargin={false}
                      />
                    </div>
                    <a 
                      href={`${window.location.origin}/site`}
                      target="_blank"
                      className="text-brand-cyan hover:text-white transition-colors flex items-center gap-2"
                    >
                      <LinkIcon size={18} /> Copiar Link do Site
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "leads" && (
              <div className="animate-in fade-in">
                <h2 className="text-2xl font-bold mb-6">Leads Capturados</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400">
                        <th className="py-3 px-4 font-medium">Data</th>
                        <th className="py-3 px-4 font-medium">Nome</th>
                        <th className="py-3 px-4 font-medium">Contato</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map(lead => (
                        <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4 text-sm text-gray-400">{new Date(lead.created_at).toLocaleString('pt-BR')}</td>
                          <td className="py-3 px-4 font-medium">{lead.name}</td>
                          <td className="py-3 px-4">{lead.contact}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {leads.length === 0 && <p className="p-4 text-gray-400 text-center">Nenhum lead recebido ainda.</p>}
                </div>
              </div>
            )}
            
            {activeTab === "account" && (
              <div className="animate-in fade-in">
                <h2 className="text-2xl font-bold mb-6">Minha Conta</h2>
                <form onSubmit={handleChangePassword} className="flex flex-col gap-6 max-w-md bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h3 className="font-medium text-brand-cyan flex items-center gap-2">
                    <Lock size={18} /> Alterar Senha de Acesso
                  </h3>
                  
                  {passwordMessage && (
                    <div className={`p-3 rounded-lg text-sm font-medium ${passwordMessage.includes("sucesso") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {passwordMessage}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Senha Atual</label>
                    <input 
                      type="password" 
                      value={currentPassword} 
                      onChange={e => setCurrentPassword(e.target.value)} 
                      required
                      className="w-full bg-brand-dark/50 border border-white/10 rounded-lg px-4 py-3 text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Nova Senha</label>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      required
                      className="w-full bg-brand-dark/50 border border-white/10 rounded-lg px-4 py-3 text-white" 
                    />
                  </div>
                  <div className="mt-2">
                     <button type="submit" className="w-full bg-brand-cyan text-brand-dark font-bold px-8 py-3 rounded-xl hover:bg-white transition-colors">
                      Atualizar Senha
                    </button>
                  </div>
                </form>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-left ${active ? "bg-brand-cyan text-brand-dark shadow-sm" : "hover:bg-white/10 text-gray-300"}`}>
      {icon} {label}
    </button>
  );
}
