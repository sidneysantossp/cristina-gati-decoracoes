import React, { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { auth, db, loginWithGoogle, logout } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  Settings, 
  Layout, 
  Image as ImageIcon, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Save, 
  LogOut,
  Instagram,
  Users as UsersIcon,
  ChevronRight,
  Menu as MenuIcon,
  Sparkles,
  Pencil,
  Upload,
  Loader2,
  X as XIcon
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

let aiClient: any = null;

const getAIClient = () => {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'undefined') {
      console.warn("GEMINI_API_KEY is not defined. AI features will not work.");
      return null;
    }
    try {
      aiClient = new GoogleGenAI({ apiKey });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI:", e);
      return null;
    }
  }
  return aiClient;
};

import { cn } from './lib/utils';

// --- Types ---

interface SiteConfig {
  navbar: {
    logo: string;
    subtitle: string;
    links: { name: string; href: string }[];
  };
  hero: {
    title: string;
    subtitle: string;
    image: string;
  };
  about: {
    title: string;
    subtitle: string;
    content: string;
    image: string;
  };
  portfolio: {
    title: string;
    subtitle: string;
  };
  testimonials: {
    title: string;
    subtitle: string;
  };
  services: {
    title: string;
    subtitle: string;
  };
  footer: {
    about: string;
    whatsapp: string;
    email: string;
    address: string;
    hours: string;
  };
}

interface Service {
  id: string;
  docId?: string;
  title: string;
  desc: string;
  image: string;
  order: number;
}

interface PortfolioItem {
  docId?: string;
  url: string;
  category: string;
  order: number;
}

interface Testimonial {
  docId?: string;
  quote: string;
  author: string;
  type: string;
  order: number;
}

interface AppUser {
  docId?: string;
  email: string;
  role: 'admin' | 'editor';
  name: string;
}

// --- Admin Components ---

const AdminPanel = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'hero' | 'services' | 'portfolio' | 'testimonials' | 'users' | 'instagram'>('config');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Check if user is admin (hardcoded bootstrap or firestore role)
        const isBootstrap = u.email === "sid.websp@gmail.com";
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        const hasAdminRole = userDoc.exists() && userDoc.data().role === 'admin';
        setIsAdmin(isBootstrap || hasAdminRole);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setAuthError(`Este domínio (${window.location.hostname}) não está autorizado no console do Firebase. Vá em Authentication > Settings > Authorized Domains e adicione este domínio.`);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setAuthError("O pop-up foi fechado antes de completar o login.");
      } else {
        setAuthError("Falha ao entrar: " + (err.message || "Erro desconhecido"));
      }
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-serif">Carregando...</div>;

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-brand-light p-10">
        <div className="max-w-md w-full bg-white p-12 border border-black/5 text-center flex flex-col gap-8">
          <h1 className="text-4xl font-serif text-brand-dark">Acesso Restrito</h1>
          <p className="text-brand-muted text-sm">Faça login com sua conta Google autorizada para gerenciar o conteúdo.</p>
          
          {authError && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] uppercase tracking-wider font-bold text-left">
              {authError}
            </div>
          )}

          <button 
            type="button"
            onClick={handleLogin}
            className="bg-brand-dark text-white py-4 px-8 uppercase tracking-widest text-[10px] font-bold hover:bg-black transition-all"
          >
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-dark text-white flex flex-col">
        <div className="p-8 border-b border-white/10">
          <span className="font-serif text-xl tracking-widest">PAINEL ADMIN</span>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <TabButton active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={<Settings size={18} />} label="Configurações" />
          <TabButton active={activeTab === 'hero'} onClick={() => setActiveTab('hero')} icon={<Layout size={18} />} label="Hero" />
          <TabButton active={activeTab === 'services'} onClick={() => setActiveTab('services')} icon={<Layout size={18} />} label="Serviços" />
          <TabButton active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} icon={<ImageIcon size={18} />} label="Portfólio" />
          <TabButton active={activeTab === 'testimonials'} onClick={() => setActiveTab('testimonials')} icon={<MessageSquare size={18} />} label="Depoimentos" />
          <TabButton active={activeTab === 'instagram'} onClick={() => setActiveTab('instagram')} icon={<Instagram size={18} />} label="Instagram" />
          {isAdmin && (
            <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<UsersIcon size={18} />} label="Usuários" />
          )}
        </nav>
        <div className="p-8 border-t border-white/10">
          <button onClick={logout} className="flex items-center gap-3 text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-all">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="mb-12 flex justify-between items-center">
          <h2 className="text-4xl font-serif text-brand-dark capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-brand-muted">{user.email}</span>
              {isAdmin && <span className="text-[8px] uppercase tracking-widest text-brand-dark font-bold">Administrador</span>}
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-dark/10 overflow-hidden">
              <img src={user.photoURL || ''} alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="bg-white p-10 border border-black/5">
          {activeTab === 'config' && <ConfigEditor />}
          {activeTab === 'hero' && <HeroEditor />}
          {activeTab === 'services' && <ServicesEditor />}
          {activeTab === 'portfolio' && <PortfolioEditor />}
          {activeTab === 'testimonials' && <TestimonialsEditor />}
          {activeTab === 'instagram' && <InstagramEditor />}
          {activeTab === 'users' && isAdmin && <UsersEditor />}
        </div>
      </main>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-4 p-4 text-[10px] uppercase tracking-widest font-bold transition-all",
      active ? "bg-white text-brand-dark" : "text-white/50 hover:text-white hover:bg-white/5"
    )}
  >
    {icon} {label}
  </button>
);

// --- Editors ---

const INITIAL_CONFIG: SiteConfig = {
  navbar: {
    logo: 'CRISTINA GATTI',
    subtitle: 'CERIMONIAL & DESIGN',
    links: [
      { name: 'Início', href: '#' },
      { name: 'Sobre', href: '#sobre' },
      { name: 'Serviços', href: '#servicos' },
      { name: 'Portfólio', href: '#portfolio' },
      { name: 'Depoimentos', href: '#depoimentos' },
      { name: 'Contato', href: '#contato' },
    ]
  },
  hero: {
    title: 'A essência de<br />momentos únicos.',
    subtitle: 'CURADORIA EM EVENTOS',
    image: 'https://picsum.photos/seed/wedding-decor/1920/1080'
  },
  about: {
    title: 'Detalhes que<br />contam histórias.',
    subtitle: 'Legado & Paixão',
    content: '<p>A <strong class="text-brand-dark font-serif font-medium italic">Cristina Gatti</strong> nasceu do desejo de materializar o invisível: a emoção crua de um momento único.</p><p>Com mais de uma década de experiência, elevamos o conceito de decoração para uma curadoria artística, onde a estética minimalista e a harmonia se fundem para criar memórias perenes.</p>',
    image: 'https://picsum.photos/seed/cristina-bold/1000/1000'
  },
  portfolio: {
    title: 'FOCO RADICAL.',
    subtitle: 'Galeria de Eventos'
  },
  testimonials: {
    title: 'QUEM VIVEU.',
    subtitle: 'Vozes de Emoção'
  },
  services: {
    title: 'Serviços',
    subtitle: 'DA DECORAÇÃO AO CERIMONIAL'
  },
  footer: {
    about: 'Curadoria de eventos e momentos inesquecíveis há mais de 10 anos.',
    whatsapp: '15 99847-9593',
    email: 'contato@cristinagatti.com.br',
    address: 'Rodovia José de Carvalho, km 127,5 — Bairro da Paineira',
    hours: 'Segunda a Sábado, 9h às 18h'
  }
};

const ConfigEditor = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const docRef = doc(db, 'config', 'site');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig({
          ...INITIAL_CONFIG,
          ...data,
          navbar: { ...INITIAL_CONFIG.navbar, ...(data.navbar || {}) },
          hero: { ...INITIAL_CONFIG.hero, ...(data.hero || {}) },
          about: { ...INITIAL_CONFIG.about, ...(data.about || {}) },
          portfolio: { ...INITIAL_CONFIG.portfolio, ...(data.portfolio || {}) },
          testimonials: { ...INITIAL_CONFIG.testimonials, ...(data.testimonials || {}) },
          services: { ...INITIAL_CONFIG.services, ...(data.services || {}) },
          footer: { ...INITIAL_CONFIG.footer, ...(data.footer || {}) },
        } as SiteConfig);
      } else {
        setConfig(INITIAL_CONFIG);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'site'), config);
      alert('Configurações salvas!');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar.');
    }
    setSaving(false);
  };

  if (!config) return <div className="py-20 text-center font-serif italic text-brand-muted">Carregando configurações...</div>;

  return (
    <div className="flex flex-col gap-12">
      <div className="grid grid-cols-2 gap-12">
        <div className="space-y-6">
          <h3 className="text-xl font-serif border-b pb-2">Navbar</h3>
          <Input label="Logo" value={config.navbar.logo} onChange={(v) => setConfig({...config, navbar: {...config.navbar, logo: v}})} />
          <Input label="Subtítulo" value={config.navbar.subtitle} onChange={(v) => setConfig({...config, navbar: {...config.navbar, subtitle: v}})} />
        </div>
        <div className="space-y-6">
          <h3 className="text-xl font-serif border-b pb-2">Sobre</h3>
          <Input label="Título Sobre" value={config.about.title} onChange={(v) => setConfig({...config, about: {...config.about, title: v}})} />
          <Input label="Subtítulo Sobre" value={config.about.subtitle} onChange={(v) => setConfig({...config, about: {...config.about, subtitle: v}})} />
          <ImageUpload label="Imagem Sobre" value={config.about.image} onChange={(v) => setConfig({...config, about: {...config.about, image: v}})} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-12">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest text-brand-muted font-bold">Conteúdo Sobre (HTML)</label>
          <textarea 
            value={config.about.content} 
            onChange={(e) => setConfig({...config, about: {...config.about, content: e.target.value}})}
            className="border border-black/10 p-4 font-serif text-sm outline-none focus:border-brand-dark min-h-[150px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12">
        <div className="space-y-6">
          <h3 className="text-xl font-serif border-b pb-2">Títulos das Seções</h3>
          <div className="grid grid-cols-1 gap-4">
            <Input label="Título Portfólio" value={config.portfolio.title} onChange={(v) => setConfig({...config, portfolio: {...config.portfolio, title: v}})} />
            <Input label="Subtítulo Portfólio" value={config.portfolio.subtitle} onChange={(v) => setConfig({...config, portfolio: {...config.portfolio, subtitle: v}})} />
            <Input label="Título Serviços" value={config.services.title} onChange={(v) => setConfig({...config, services: {...config.services, title: v}})} />
            <Input label="Subtítulo Serviços" value={config.services.subtitle} onChange={(v) => setConfig({...config, services: {...config.services, subtitle: v}})} />
            <Input label="Título Depoimentos" value={config.testimonials.title} onChange={(v) => setConfig({...config, testimonials: {...config.testimonials, title: v}})} />
            <Input label="Subtítulo Depoimentos" value={config.testimonials.subtitle} onChange={(v) => setConfig({...config, testimonials: {...config.testimonials, subtitle: v}})} />
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="text-xl font-serif border-b pb-2">Rodapé & Contato</h3>
          <div className="grid grid-cols-2 gap-8">
            <Input label="WhatsApp" value={config.footer.whatsapp} onChange={(v) => setConfig({...config, footer: {...config.footer, whatsapp: v}})} />
            <Input label="E-mail" value={config.footer.email} onChange={(v) => setConfig({...config, footer: {...config.footer, email: v}})} />
            <Input label="Endereço" value={config.footer.address} onChange={(v) => setConfig({...config, footer: {...config.footer, address: v}})} />
            <Input label="Horário" value={config.footer.hours} onChange={(v) => setConfig({...config, footer: {...config.footer, hours: v}})} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-brand-muted font-bold">Sobre (Rodapé)</label>
            <textarea 
              value={config.footer.about} 
              onChange={(e) => setConfig({...config, footer: {...config.footer, about: e.target.value}})}
              className="border border-black/10 p-4 font-serif text-lg outline-none focus:border-brand-dark min-h-[100px]"
            />
          </div>
        </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={saving}
        className="bg-brand-dark text-white py-4 px-12 uppercase tracking-widest text-[10px] font-bold self-end flex items-center gap-3"
      >
        <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
      </button>
    </div>
  );
};

const ImageUpload = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, envie uma imagem.');
      return;
    }

    // Limit to 800KB for base64 storage in Firestore (doc limit 1MB)
    if (file.size > 800 * 1024) {
      alert('Imagem muito grande para o banco de dados. Por favor, use uma imagem de até 800KB (o banco de dados tem um limite técnico por item).');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onChange(base64);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="text-[10px] uppercase tracking-[0.3em] text-brand-muted font-medium">{label}</label>
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative aspect-video border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4 bg-brand-light p-6 overflow-hidden",
          isDragging ? "border-brand-dark bg-stone-100" : "border-black/10 hover:border-brand-dark",
          loading && "opacity-50 pointer-events-none"
        )}
      >
        {value ? (
          <>
            <img src={value} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-10 text-white">
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <Upload size={24} />
                <span className="text-[8px] uppercase tracking-widest font-bold">Trocar Imagem</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </label>
              <button onClick={() => onChange('')} className="flex flex-col items-center gap-2">
                <XIcon size={24} />
                <span className="text-[8px] uppercase tracking-widest font-bold">Remover</span>
              </button>
            </div>
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center gap-4 w-full">
            <div className="p-4 bg-white rounded-full text-brand-muted">
              {loading ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
            </div>
            <div className="text-center">
              <p className="text-xs font-serif text-brand-dark mb-1">Arraste ou clique para enviar</p>
              <p className="text-[10px] text-brand-muted uppercase tracking-widest">PNG, JPG até 2MB</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </label>
        )}
      </div>
    </div>
  );
};

const HeroEditor = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const docRef = doc(db, 'config', 'site');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig({
          ...INITIAL_CONFIG,
          ...data,
          navbar: { ...INITIAL_CONFIG.navbar, ...(data.navbar || {}) },
          hero: { ...INITIAL_CONFIG.hero, ...(data.hero || {}) },
          about: { ...INITIAL_CONFIG.about, ...(data.about || {}) },
          portfolio: { ...INITIAL_CONFIG.portfolio, ...(data.portfolio || {}) },
          testimonials: { ...INITIAL_CONFIG.testimonials, ...(data.testimonials || {}) },
          services: { ...INITIAL_CONFIG.services, ...(data.services || {}) },
          footer: { ...INITIAL_CONFIG.footer, ...(data.footer || {}) },
        } as SiteConfig);
      } else {
        setConfig(INITIAL_CONFIG);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'site'), config);
      alert('Hero atualizado!');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar.');
    }
    setSaving(false);
  };

  if (!config) return <div className="py-20 text-center font-serif italic text-brand-muted">Carregando Hero...</div>;

  return (
    <div className="flex flex-col gap-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <h3 className="text-xl font-serif border-b pb-2">Conteúdo do Hero</h3>
          <Input label="Título Principal (Dica: Use <br /> para quebra de linha)" value={config.hero.title} onChange={(v) => setConfig({...config, hero: {...config.hero, title: v}})} />
          <Input label="Subtítulo Superior" value={config.hero.subtitle} onChange={(v) => setConfig({...config, hero: {...config.hero, subtitle: v}})} />
          <ImageUpload label="Imagem de Fundo" value={config.hero.image} onChange={(v) => setConfig({...config, hero: {...config.hero, image: v}})} />
        </div>
        <div className="space-y-8">
          <h3 className="text-xl font-serif border-b pb-2">Preview</h3>
          <div className="relative aspect-video bg-brand-light overflow-hidden flex items-center justify-center p-8 border border-black/5">
            <img 
              src={config.hero.image} 
              alt="Preview" 
              className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale"
            />
            <div className="relative z-10 text-center">
              <span className="block text-[6px] uppercase tracking-[0.4em] text-brand-muted mb-4 font-medium">{config.hero.subtitle}</span>
              <h1 className="text-2xl font-serif text-brand-dark mb-6 leading-tight" dangerouslySetInnerHTML={{ __html: config.hero.title }} />
              <div className="flex gap-4 justify-center">
                <div className="h-[1px] w-8 bg-brand-dark/20"></div>
                <div className="h-[1px] w-8 bg-brand-dark/20"></div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-brand-muted italic">Nota: O preview é uma representação simplificada.</p>
        </div>
      </div>
      <button 
        onClick={handleSave}
        disabled={saving}
        className="bg-brand-dark text-white py-4 px-12 uppercase tracking-widest text-[10px] font-bold self-end flex items-center gap-3"
      >
        <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
      </button>
    </div>
  );
};

const ServicesEditor = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ id: string, message: string } | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'services'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as Service)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async () => {
    await addDoc(collection(db, 'services'), {
      id: String(services.length + 1).padStart(2, '0'),
      title: 'Novo Serviço',
      desc: 'Descrição do serviço...',
      image: 'https://picsum.photos/seed/new/800/1000',
      order: services.length
    });
  };

  const handleDelete = async (docId: string) => {
    if (confirm('Excluir este serviço?')) {
      await deleteDoc(doc(db, 'services', docId));
    }
  };

  const handleUpdate = async (docId: string, data: Partial<Service>) => {
    try {
      await updateDoc(doc(db, 'services', docId), data);
    } catch (error: any) {
      console.error("Error updating service:", error);
      alert("Erro ao salvar: " + (error.message.includes('too large') ? "A imagem é muito grande para o banco de dados." : error.message));
    }
  };

  const generateImage = async (service: Service) => {
    if (!service.docId) return;
    setGeneratingId(service.docId);
    setErrorInfo(null);

    try {
      // Basic validation
      if (!service.title || service.title === 'Novo Serviço') {
        throw new Error("Por favor, defina um título real para o serviço antes de gerar a imagem.");
      }

      const ai = getAIClient();
      if (!ai) {
        throw new Error("AI Client não inicializado. Verifique a chave de API.");
      }

      const prompt = `A high-quality, professional, minimalist and elegant image representing the service: "${service.title}". Description: "${service.desc}". Style: minimalist, sophisticated, luxury event decoration, soft lighting, high-end photography.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
      });

      let imageFound = false;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64Data = part.inlineData.data;
            const imageUrl = `data:image/png;base64,${base64Data}`;
            await handleUpdate(service.docId, { image: imageUrl });
            imageFound = true;
            break;
          }
        }
      }

      if (!imageFound) {
        throw new Error("O modelo não retornou uma imagem válida. Tente ajustar o título ou descrição.");
      }

    } catch (error: any) {
      console.error("Error generating image:", error);
      const message = error.message || "Erro inesperado ao gerar imagem.";
      setErrorInfo({ id: service.docId, message });
      
      // Fallback: If it's a new service with a placeholder, we could set a better placeholder
      // but usually we just keep the current one as per user request.
      setTimeout(() => setErrorInfo(null), 5000); // Clear error after 5s
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-serif">Gerenciar Serviços</h3>
        <button onClick={handleAdd} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-dark border border-brand-dark px-4 py-2 hover:bg-brand-dark hover:text-white transition-all">
          <Plus size={16} /> Adicionar
        </button>
      </div>
      <div className="grid gap-6">
        {services.map((s) => (
          <div key={s.docId} className="border border-black/5 p-8 flex gap-8 items-start group">
            <div className="w-24 aspect-[4/5] bg-brand-light overflow-hidden shrink-0">
              <img src={s.image} alt={s.title} className="w-full h-full object-cover grayscale" />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-8">
              <Input label="Título" value={s.title} onChange={(v) => handleUpdate(s.docId!, { title: v })} />
              <Input label="ID" value={s.id} onChange={(v) => handleUpdate(s.docId!, { id: v })} />
              
              <div className="col-span-2 space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-brand-muted font-medium">Imagem do Serviço</label>
                  <button 
                    onClick={() => generateImage(s)}
                    disabled={generatingId === s.docId}
                    className="flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] font-bold text-brand-dark hover:underline disabled:opacity-50"
                  >
                    <Sparkles size={12} className={generatingId === s.docId ? 'animate-spin' : ''} />
                    {generatingId === s.docId ? 'Gerando...' : 'Gerar com IA'}
                  </button>
                </div>
                <ImageUpload label="" value={s.image} onChange={(v) => handleUpdate(s.docId!, { image: v })} />
              </div>

              {errorInfo?.id === s.docId && (
                <div className="col-span-2 text-[10px] text-red-500 uppercase tracking-widest font-bold animate-pulse">
                  {errorInfo.message} (Mantendo imagem atual)
                </div>
              )}
              <div className="col-span-2">
                <label className="text-[10px] uppercase tracking-widest text-brand-muted font-bold mb-2 block">Descrição</label>
                <textarea 
                  value={s.desc} 
                  onChange={(e) => handleUpdate(s.docId!, { desc: e.target.value })}
                  className="w-full border border-black/10 p-4 font-serif text-sm outline-none focus:border-brand-dark min-h-[100px]"
                />
              </div>
            </div>
            <button onClick={() => handleDelete(s.docId!)} className="p-2 text-brand-muted hover:text-red-500 transition-colors">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const PortfolioEditor = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'portfolio'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as any)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async () => {
    const docRef = await addDoc(collection(db, 'portfolio'), {
      url: 'https://picsum.photos/seed/new-p/800/800',
      category: 'Casamentos',
      order: items.length
    });
    setEditingId(docRef.id);
  };

  const handleDelete = async (docId: string) => {
    if (confirm('Excluir este item?')) {
      await deleteDoc(doc(db, 'portfolio', docId));
    }
  };

  const handleUpdate = async (docId: string, data: Partial<PortfolioItem>) => {
    try {
      await updateDoc(doc(db, 'portfolio', docId), data);
    } catch (error: any) {
      console.error("Error updating portfolio:", error);
      alert("Erro ao salvar: " + (error.message.includes('too large') ? "A imagem é muito grande para o banco de dados." : error.message));
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-serif">Gerenciar Portfólio</h3>
        <button onClick={handleAdd} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-dark border border-brand-dark px-4 py-2 hover:bg-brand-dark hover:text-white transition-all">
          <Plus size={16} /> Adicionar Item
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item: any) => (
          <div key={item.docId} className="border border-black/5 p-6 flex gap-6 items-start bg-brand-light/20 group">
            <div className="w-20 aspect-square bg-white overflow-hidden shrink-0 border border-black/5">
              <img src={item.url} alt="Portfolio" className="w-full h-full object-cover grayscale" />
            </div>
            <div className="flex-1 space-y-4">
              {editingId === item.docId ? (
                <>
                  <ImageUpload label="Imagem do Portfólio" value={item.url} onChange={(v) => handleUpdate(item.docId!, { url: v })} />
                  <Input label="Categoria" value={item.category} onChange={(v) => handleUpdate(item.docId!, { category: v })} />
                  <button 
                    onClick={() => setEditingId(null)}
                    className="text-[10px] uppercase tracking-widest font-bold text-brand-dark underline"
                  >
                    Concluir
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-brand-muted font-bold">Categoria</span>
                  <span className="font-serif text-brand-dark">{item.category}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setEditingId(editingId === item.docId ? null : item.docId)} 
                className={cn(
                  "p-2 transition-colors",
                  editingId === item.docId ? "text-brand-dark" : "text-brand-muted hover:text-brand-dark"
                )}
                title="Editar item"
              >
                <Pencil size={18} />
              </button>
              <button onClick={() => handleDelete(item.docId!)} className="p-2 text-brand-muted hover:text-red-500 transition-colors" title="Excluir item">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TestimonialsEditor = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'testimonials'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as any)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async () => {
    await addDoc(collection(db, 'testimonials'), {
      quote: 'Novo depoimento...',
      author: 'Nome do Cliente',
      type: 'Tipo de Evento',
      order: items.length
    });
  };

  const handleDelete = async (docId: string) => {
    if (confirm('Excluir este depoimento?')) {
      await deleteDoc(doc(db, 'testimonials', docId));
    }
  };

  const handleUpdate = async (docId: string, data: Partial<Testimonial>) => {
    try {
      await updateDoc(doc(db, 'testimonials', docId), data);
    } catch (error: any) {
      console.error("Error updating testimonial:", error);
      alert("Erro ao salvar: " + error.message);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-serif">Gerenciar Depoimentos</h3>
        <button onClick={handleAdd} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-dark border border-brand-dark px-4 py-2 hover:bg-brand-dark hover:text-white transition-all">
          <Plus size={16} /> Adicionar Depoimento
        </button>
      </div>
      <div className="grid gap-6">
        {items.map((item: any) => (
          <div key={item.docId} className="border border-black/5 p-8 flex gap-8 items-start bg-brand-light/20">
            <div className="flex-1 grid grid-cols-2 gap-6">
              <Input label="Autor" value={item.author} onChange={(v) => handleUpdate(item.docId!, { author: v })} />
              <Input label="Tipo de Evento" value={item.type} onChange={(v) => handleUpdate(item.docId!, { type: v })} />
              <div className="col-span-2">
                <label className="text-[10px] uppercase tracking-widest text-brand-muted font-bold mb-2 block">Depoimento</label>
                <textarea 
                  value={item.quote} 
                  onChange={(e) => handleUpdate(item.docId!, { quote: e.target.value })}
                  className="w-full border border-black/10 p-4 font-serif text-sm outline-none focus:border-brand-dark min-h-[80px]"
                />
              </div>
            </div>
            <button onClick={() => handleDelete(item.docId!)} className="p-2 text-brand-muted hover:text-red-500 transition-colors">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const UsersEditor = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'editor'>('editor');

  useEffect(() => {
    const q = collection(db, 'users');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as AppUser)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;
    
    try {
      // We use email as a way to identify, but Firestore rules check UID.
      // In a real app, we'd need to map email to UID or use a custom invite system.
      // For this simple case, we'll store by a generated ID and the user must login with that email.
      await addDoc(collection(db, 'users'), {
        email: newEmail,
        name: newName,
        role: newRole
      });
      setNewEmail('');
      setNewName('');
    } catch (e) {
      console.error(e);
      alert('Erro ao adicionar usuário. Verifique suas permissões.');
    }
  };

  const handleDelete = async (docId: string) => {
    if (confirm('Remover acesso deste usuário?')) {
      await deleteDoc(doc(db, 'users', docId));
    }
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="space-y-8">
        <h3 className="text-xl font-serif border-b pb-2">Autorizar Novo Usuário</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <Input label="Nome" value={newName} onChange={setNewName} />
          <Input label="E-mail Google" value={newEmail} onChange={setNewEmail} />
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-brand-muted font-bold">Função</label>
            <select 
              value={newRole} 
              onChange={(e) => setNewRole(e.target.value as 'admin' | 'editor')}
              className="border border-black/10 p-4 font-serif text-lg outline-none focus:border-brand-dark bg-white"
            >
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button type="submit" className="bg-brand-dark text-white py-4 px-8 uppercase tracking-widest text-[10px] font-bold hover:bg-black transition-all flex items-center justify-center gap-2">
            <Plus size={16} /> Autorizar
          </button>
        </form>
      </div>

      <div className="space-y-8">
        <h3 className="text-xl font-serif border-b pb-2">Usuários Ativos</h3>
        <div className="grid gap-4">
          {users.map((u) => (
            <div key={u.docId} className="border border-black/5 p-6 flex justify-between items-center bg-brand-light/30">
              <div className="flex flex-col">
                <span className="font-serif text-lg text-brand-dark">{u.name}</span>
                <span className="text-[10px] text-brand-muted uppercase tracking-wider">{u.email}</span>
              </div>
              <div className="flex items-center gap-8">
                <span className={cn(
                  "text-[9px] uppercase tracking-widest px-3 py-1 font-bold",
                  u.role === 'admin' ? "bg-brand-dark text-white" : "bg-white text-brand-dark border border-black/10"
                )}>
                  {u.role}
                </span>
                <button onClick={() => handleDelete(u.docId!)} className="text-brand-muted hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && <p className="text-center py-10 text-brand-muted font-serif italic">Nenhum usuário adicional cadastrado.</p>}
        </div>
      </div>
    </div>
  );
};

const InstagramEditor = () => {
  const [items, setItems] = useState<{ url: string; docId?: string; order: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'instagram_feed'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as any)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async () => {
    await addDoc(collection(db, 'instagram_feed'), {
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
      order: items.length
    });
  };

  const handleDelete = async (docId: string) => {
    if (confirm('Remover esta imagem do feed?')) {
      await deleteDoc(doc(db, 'instagram_feed', docId));
    }
  };

  const handleUpdate = async (docId: string, data: any) => {
    try {
      await updateDoc(doc(db, 'instagram_feed', docId), data);
    } catch (error: any) {
      alert("Erro ao salvar: " + error.message);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center text-brand-dark">
        <div>
          <h3 className="text-xl font-serif">Feed Instagram</h3>
          <p className="text-[10px] uppercase tracking-widest text-brand-muted mt-1">
            Escolha as melhores fotos do seu Instagram para exibir no site
          </p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-dark border border-brand-dark px-4 py-2 hover:bg-brand-dark hover:text-white transition-all">
          <Plus size={16} /> Adicionar Foto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.docId} className="border border-black/5 p-4 bg-brand-light/20 flex flex-col gap-4">
            <ImageUpload 
              label="Foto do Instagram" 
              value={item.url} 
              onChange={(v) => handleUpdate(item.docId!, { url: v })} 
            />
            <button 
              onClick={() => handleDelete(item.docId!)} 
              className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-700 transition-colors py-2 border border-red-100 hover:bg-red-50"
            >
              <Trash2 size={14} /> Remover do Feed
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] uppercase tracking-widest text-brand-muted font-bold">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="border border-black/10 p-4 font-serif text-lg outline-none focus:border-brand-dark"
    />
  </div>
);

export default AdminPanel;
