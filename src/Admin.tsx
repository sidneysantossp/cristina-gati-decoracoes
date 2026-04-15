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
  ChevronRight,
  Menu as MenuIcon
} from 'lucide-react';
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

// --- Admin Components ---

const AdminPanel = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'services' | 'portfolio' | 'testimonials'>('config');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-serif">Carregando...</div>;

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-brand-light p-10">
        <div className="max-w-md w-full bg-white p-12 border border-black/5 text-center flex flex-col gap-8">
          <h1 className="text-4xl font-serif text-brand-dark">Acesso Restrito</h1>
          <p className="text-brand-muted text-sm">Faça login com sua conta Google autorizada para gerenciar o conteúdo.</p>
          <button 
            onClick={loginWithGoogle}
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
          <TabButton active={activeTab === 'services'} onClick={() => setActiveTab('services')} icon={<Layout size={18} />} label="Serviços" />
          <TabButton active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} icon={<ImageIcon size={18} />} label="Portfólio" />
          <TabButton active={activeTab === 'testimonials'} onClick={() => setActiveTab('testimonials')} icon={<MessageSquare size={18} />} label="Depoimentos" />
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
            <span className="text-[10px] uppercase tracking-widest text-brand-muted">{user.email}</span>
            <div className="w-8 h-8 rounded-full bg-brand-dark/10 overflow-hidden">
              <img src={user.photoURL || ''} alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="bg-white p-10 border border-black/5">
          {activeTab === 'config' && <ConfigEditor />}
          {activeTab === 'services' && <ServicesEditor />}
          {activeTab === 'portfolio' && <PortfolioEditor />}
          {activeTab === 'testimonials' && <TestimonialsEditor />}
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

const ConfigEditor = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const docRef = doc(db, 'config', 'site');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfig(docSnap.data() as SiteConfig);
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

  if (!config) return <div>Carregando...</div>;

  return (
    <div className="flex flex-col gap-12">
      <div className="grid grid-cols-2 gap-12">
        <div className="space-y-6">
          <h3 className="text-xl font-serif border-b pb-2">Navbar</h3>
          <Input label="Logo" value={config.navbar.logo} onChange={(v) => setConfig({...config, navbar: {...config.navbar, logo: v}})} />
          <Input label="Subtítulo" value={config.navbar.subtitle} onChange={(v) => setConfig({...config, navbar: {...config.navbar, subtitle: v}})} />
        </div>
        <div className="space-y-6">
          <h3 className="text-xl font-serif border-b pb-2">Hero</h3>
          <Input label="Título Hero" value={config.hero.title} onChange={(v) => setConfig({...config, hero: {...config.hero, title: v}})} />
          <Input label="Subtítulo Hero" value={config.hero.subtitle} onChange={(v) => setConfig({...config, hero: {...config.hero, subtitle: v}})} />
          <Input label="Imagem Hero (URL)" value={config.hero.image} onChange={(v) => setConfig({...config, hero: {...config.hero, image: v}})} />
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
    await updateDoc(doc(db, 'services', docId), data);
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
            <div className="flex-1 grid grid-cols-2 gap-6">
              <Input label="Título" value={s.title} onChange={(v) => handleUpdate(s.docId!, { title: v })} />
              <Input label="ID" value={s.id} onChange={(v) => handleUpdate(s.docId!, { id: v })} />
              <div className="col-span-2">
                <Input label="Imagem (URL)" value={s.image} onChange={(v) => handleUpdate(s.docId!, { image: v })} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] uppercase tracking-widest text-brand-muted font-bold mb-2 block">Descrição</label>
                <textarea 
                  value={s.desc} 
                  onChange={(e) => handleUpdate(s.docId!, { desc: e.target.value })}
                  className="w-full border border-black/10 p-4 font-serif text-sm outline-none focus:border-brand-dark"
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

const PortfolioEditor = () => (
  <div className="text-center py-20 opacity-50 font-serif">Editor de Portfólio em desenvolvimento...</div>
);

const TestimonialsEditor = () => (
  <div className="text-center py-20 opacity-50 font-serif">Editor de Depoimentos em desenvolvimento...</div>
);

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
