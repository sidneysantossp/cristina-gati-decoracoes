/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Menu, 
  X, 
  ArrowRight, 
  MapPin,
  Clock
} from 'lucide-react';
import { cn } from './lib/utils';
import { db } from './lib/firebase';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import AdminPanel from './Admin';

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
  title: string;
  desc: string;
  image: string;
  order: number;
}

// --- Components ---

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' | 'link' }) => {
  const variants = {
    primary: 'bg-brand-dark text-white hover:bg-black transition-all',
    outline: 'border border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white transition-all',
    ghost: 'text-brand-dark hover:bg-brand-light transition-colors',
    link: 'text-brand-dark border-b border-brand-dark/30 hover:border-brand-dark transition-all px-0 py-1',
  };

  return (
    <button 
      className={cn(
        'px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const SectionHeading = ({ 
  title, 
  subtitle, 
  className,
  align = 'center'
}: { title: string; subtitle?: string; className?: string; align?: 'left' | 'center' }) => (
  <div className={cn('mb-20', align === 'center' ? 'text-center' : 'text-left', className)}>
    {subtitle && (
      <span className="block text-[10px] uppercase tracking-[0.4em] text-brand-muted mb-6 font-medium">
        {subtitle}
      </span>
    )}
    <h2 className="text-5xl md:text-7xl font-serif text-brand-dark leading-tight">
      {title}
    </h2>
  </div>
);

// --- Sections ---

const Navbar = ({ config }: { config: SiteConfig['navbar'] }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      'fixed top-0 left-0 w-full z-50 transition-all duration-500 py-8',
      isScrolled ? 'bg-white/95 backdrop-blur-md py-4 border-b border-black/5' : 'bg-transparent'
    )}>
      <div className="max-w-[1600px] mx-auto px-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-serif text-xl tracking-widest text-brand-dark leading-none">{config.logo}</span>
            <span className="text-[8px] uppercase tracking-[0.3em] text-brand-muted mt-1">{config.subtitle}</span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-10">
          {config.links.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-[10px] uppercase tracking-[0.2em] font-medium text-brand-dark/60 hover:text-brand-dark transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="hidden lg:block">
          <a href="#contato" className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-dark">
            CONTATO
          </a>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-brand-dark" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center gap-8 lg:hidden"
          >
            <button className="absolute top-8 right-10 text-brand-dark" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={32} />
            </button>
            {config.links.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-serif text-brand-dark hover:opacity-50 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ config }: { config: SiteConfig['hero'] }) => (
  <section className="relative h-screen flex items-center justify-center overflow-hidden px-10 text-center">
    <div className="absolute inset-0 z-0">
      <img 
        src={config.image} 
        alt="Hero Background" 
        className="w-full h-full object-cover opacity-10 grayscale"
        referrerPolicy="no-referrer"
      />
    </div>

    <div className="relative z-10 max-w-4xl">
      <motion.span 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="block text-[10px] uppercase tracking-[0.6em] text-brand-muted mb-10 font-medium"
      >
        {config.subtitle}
      </motion.span>
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-6xl md:text-8xl lg:text-9xl font-serif text-brand-dark mb-16 leading-[1.1]"
        dangerouslySetInnerHTML={{ __html: config.title }}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="flex flex-row items-center justify-center gap-12"
      >
        <Button variant="link">VER PORTFÓLIO</Button>
        <Button variant="link">WHATSAPP</Button>
      </motion.div>
    </div>

    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-brand-dark/20"></div>
  </section>
);

const Stats = () => {
  const stats = [
    { value: '10+', label: 'Anos de experiência' },
    { value: '300+', label: 'Eventos realizados' },
    { value: '500+', label: 'Sonhos realizados' },
    { value: '3', label: 'Prêmios de negócios' },
  ];

  return (
    <section className="py-32 border-y border-black/5 bg-white">
      <div className="max-w-7xl mx-auto px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <span className="text-5xl md:text-6xl font-serif text-brand-dark tracking-tight">{stat.value}</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-brand-muted font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const About = () => (
  <section id="sobre" className="py-40 bg-white relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-10">
      <div className="grid lg:grid-cols-2 gap-24 items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative aspect-square overflow-hidden border-4 border-brand-dark"
        >
          <img 
            src="https://picsum.photos/seed/cristina-bold/1000/1000" 
            alt="Cristina Gatti working" 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col gap-10"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-brand-muted font-medium">Legado & Paixão</span>
          <h2 className="text-5xl md:text-7xl font-serif text-brand-dark leading-tight">
            Detalhes que<br />contam histórias.
          </h2>
          <div className="space-y-8 text-brand-muted text-lg leading-relaxed font-light">
            <p>
              A <strong className="text-brand-dark font-serif font-medium italic">Cristina Gatti</strong> nasceu do desejo de materializar o invisível: a emoção crua de um momento único.
            </p>
            <p>
              Com mais de uma década de experiência, elevamos o conceito de decoração para uma curadoria artística, onde a estética minimalista e a harmonia se fundem para criar memórias perenes.
            </p>
          </div>
          <a href="#" className="inline-flex items-center gap-6 text-[10px] uppercase tracking-[0.3em] font-bold text-brand-dark group">
            Conheça nossa curadoria
            <ArrowRight size={18} className="group-hover:translate-x-4 transition-transform text-brand-dark" />
          </a>
        </motion.div>
      </div>
    </div>
  </section>
);

const Services = ({ services }: { services: Service[] }) => {
  return (
    <section id="servicos" className="py-40 bg-brand-light">
      <div className="max-w-7xl mx-auto px-10">
        <SectionHeading 
          subtitle="Nossa Especialidade" 
          title="CURADORIA COMPLETA." 
          align="left"
          className="max-w-4xl"
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="relative aspect-[4/5] overflow-hidden group border border-black/5 bg-white hover:shadow-2xl hover:shadow-black/5 transition-all duration-500"
            >
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover grayscale opacity-10 group-hover:opacity-30 group-hover:scale-110 group-hover:grayscale-0 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 h-full p-12 flex flex-col gap-8">
                <span className="text-3xl font-serif italic text-brand-dark/10 group-hover:text-brand-dark/20 transition-colors">{service.id}</span>
                <h3 className="text-3xl font-serif text-brand-dark leading-tight">{service.title}</h3>
                <p className="text-sm text-brand-muted leading-relaxed font-light">
                  {service.desc}
                </p>
                <button className="mt-auto text-[10px] uppercase tracking-[0.2em] font-bold text-brand-dark border-b border-black/10 pb-1 w-fit transition-all hover:border-brand-dark">
                  Saiba Mais
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Portfolio = () => {
  const categories = ['Todos', 'Casamentos', 'Debutantes', 'Sociais', 'Arranjos'];
  const [activeCategory, setActiveCategory] = useState('Todos');

  const images = [
    'https://picsum.photos/seed/p1-bold/800/800',
    'https://picsum.photos/seed/p2-bold/800/800',
    'https://picsum.photos/seed/p3-bold/800/800',
    'https://picsum.photos/seed/p4-bold/800/800',
    'https://picsum.photos/seed/p5-bold/800/800',
    'https://picsum.photos/seed/p6-bold/800/800',
    'https://picsum.photos/seed/p7-bold/800/800',
    'https://picsum.photos/seed/p8-bold/800/800',
  ];

  return (
    <section id="portfolio" className="py-40 bg-white">
      <div className="max-w-7xl mx-auto px-10">
        <SectionHeading 
          subtitle="Galeria de Eventos" 
          title="FOCO RADICAL." 
        />
        
        <div className="flex flex-wrap justify-center gap-10 mb-20">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'text-[10px] uppercase tracking-[0.3em] font-bold transition-all pb-2 border-b-2',
                activeCategory === cat ? 'text-brand-dark border-brand-dark' : 'text-brand-muted border-transparent hover:text-brand-dark'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.map((img, idx) => (
            <motion.div 
              key={idx}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="aspect-square overflow-hidden group cursor-pointer border-2 border-black/5 hover:border-brand-dark transition-all"
            >
              <img 
                src={img} 
                alt={`Portfolio item ${idx}`} 
                className="w-full h-full object-cover grayscale hover:grayscale-0 hover:scale-110 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <Button variant="outline">Ver mais no Instagram</Button>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const testimonials = [
    { quote: "A Cristina materializou nossa essência em cada detalhe. O resultado foi um cenário atemporal que ainda vive em nossas memórias.", author: "Betânia & Rodrigo", type: "Casamento" },
    { quote: "Minimalismo e sofisticação em sua forma mais pura. A festa de 15 anos da minha filha foi um marco de elegância.", author: "Família Santos", type: "Debutante" },
    { quote: "Contratar a curadoria da Cristina foi nossa melhor escolha. Paz, harmonia e beleza em cada centímetro do evento.", author: "Kelly & Eliézer", type: "Casamento" }
  ];

  return (
    <section id="depoimentos" className="py-40 bg-brand-light">
      <div className="max-w-7xl mx-auto px-10">
        <SectionHeading 
          subtitle="Vozes de Emoção" 
          title="QUEM VIVEU." 
        />
        <div className="grid md:grid-cols-3 gap-16">
          {testimonials.map((t, idx) => (
            <div key={idx} className="flex flex-col gap-10 p-12 border border-black/5 bg-white">
              <p className="text-xl font-serif italic text-brand-dark/80 leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-brand-dark uppercase tracking-widest">{t.author}</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-brand-muted font-medium">{t.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Contact = ({ config }: { config: SiteConfig['footer'] }) => (
  <section id="contato" className="py-40 bg-white">
    <div className="max-w-7xl mx-auto px-10">
      <div className="grid lg:grid-cols-2 gap-32">
        <div className="flex flex-col gap-16">
          <SectionHeading 
            subtitle="Conversa & Curadoria" 
            title="VAMOS CRIAR?" 
            align="left"
          />
          <p className="text-brand-dark/50 text-xl font-light leading-relaxed max-w-md">
            O futuro não se espera, se constrói com código e pixels. Vamos materializar o seu sonho radical?
          </p>
          <div className="space-y-12">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand-muted font-medium">WhatsApp</span>
              <a href="#" className="text-3xl font-serif text-brand-dark hover:opacity-50 transition-all">{config.whatsapp}</a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand-muted font-medium">E-mail</span>
              <a href="#" className="text-3xl font-serif text-brand-dark hover:opacity-50 transition-all">{config.email}</a>
            </div>
          </div>
        </div>

        <form className="flex flex-col gap-10 bg-brand-light p-12 border border-black/5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div className="flex flex-col gap-4">
              <label className="text-[10px] uppercase tracking-[0.3em] text-brand-muted font-medium">Nome</label>
              <input type="text" className="bg-transparent border-b border-black/10 py-4 focus:border-brand-dark outline-none transition-all font-medium text-lg" />
            </div>
            <div className="flex flex-col gap-4">
              <label className="text-[10px] uppercase tracking-[0.3em] text-brand-muted font-medium">E-mail</label>
              <input type="email" className="bg-transparent border-b border-black/10 py-4 focus:border-brand-dark outline-none transition-all font-medium text-lg" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <label className="text-[10px] uppercase tracking-[0.3em] text-brand-muted font-medium">Mensagem</label>
            <textarea 
              rows={4} 
              placeholder="CONTE-NOS O SEU SONHO..."
              className="bg-transparent border-b border-black/10 py-4 focus:border-brand-dark outline-none transition-all font-medium text-lg resize-none placeholder:text-black/10"
            ></textarea>
          </div>
          <Button className="w-full">Enviar Solicitação</Button>
        </form>
      </div>
    </div>
  </section>
);

const Location = ({ config }: { config: SiteConfig['footer'] }) => (
  <section className="py-40 bg-brand-light border-y border-black/10">
    <div className="max-w-7xl mx-auto px-10">
      <div className="grid lg:grid-cols-2 gap-32 items-center">
        <div className="flex flex-col gap-16">
          <SectionHeading 
            subtitle="Onde Estamos" 
            title="PIEDADE & PILAR." 
            align="left"
          />
          <div className="space-y-12">
            <div className="flex gap-8">
              <MapPin size={24} className="text-brand-dark shrink-0" />
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-brand-muted font-medium">Endereço</span>
                <p className="text-2xl font-serif text-brand-dark">{config.address}</p>
              </div>
            </div>
            <div className="flex gap-8">
              <Clock size={24} className="text-brand-dark shrink-0" />
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-brand-muted font-medium">Horário</span>
                <p className="text-2xl font-serif text-brand-dark">{config.hours}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="aspect-video bg-white border-4 border-black/10 p-2 grayscale">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3654.67562854321!2d-47.4234567!3d-23.7123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQyJzQ0LjQiUyA0N8KwMjUnMjQuNCJX!5e0!3m2!1spt-BR!2sbr!4v1620000000000!5m2!1spt-BR!2sbr" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  </section>
);

const Footer = ({ config }: { config: SiteConfig }) => (
  <footer className="py-32 bg-white">
    <div className="max-w-7xl mx-auto px-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col">
            <span className="font-serif text-xl tracking-widest text-brand-dark leading-none">{config.navbar.logo}</span>
            <span className="text-[8px] uppercase tracking-[0.3em] text-brand-muted mt-1">{config.navbar.subtitle}</span>
          </div>
          <p className="text-[10px] text-brand-muted leading-relaxed font-medium uppercase tracking-wider">
            {config.footer.about}
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-dark">Navegação</span>
          <ul className="flex flex-col gap-4">
            {config.navbar.links.map(item => (
              <li key={item.name}>
                <a href={item.href} className="text-[10px] uppercase tracking-[0.2em] text-brand-muted hover:text-brand-dark transition-colors font-bold">{item.name}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-8">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-dark">Social</span>
          <ul className="flex flex-col gap-4">
            {['Instagram', 'Facebook', 'TikTok'].map(item => (
              <li key={item}>
                <a href="#" className="text-[10px] uppercase tracking-[0.2em] text-brand-muted hover:text-brand-dark transition-colors font-bold">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-8">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-dark">Local</span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted leading-relaxed font-bold">
            Piedade / Pilar do Sul — SP<br />
            Atendemos toda região de Sorocaba.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-10 pt-16 border-t border-black/5">
        <span className="text-[9px] uppercase tracking-[0.3em] text-brand-muted font-medium">
          © 2024 Cristina Gatti. Todos os direitos reservados.
        </span>
        <div className="flex items-center gap-12">
          <Instagram size={18} className="text-brand-muted hover:text-brand-dark cursor-pointer transition-colors" />
          <Facebook size={18} className="text-brand-muted hover:text-brand-dark cursor-pointer transition-colors" />
          <Twitter size={18} className="text-brand-muted hover:text-brand-dark cursor-pointer transition-colors" />
        </div>
        <span className="text-[9px] uppercase tracking-[0.3em] text-brand-muted font-medium">
          Desenvolvido por AIS
        </span>
      </div>
    </div>
  </footer>
);

const LandingPage = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Config
    const unsubConfig = onSnapshot(doc(db, 'config', 'site'), (docSnap) => {
      if (docSnap.exists()) {
        setConfig(docSnap.data() as SiteConfig);
      } else {
        // Initial Seed
        const initialConfig: SiteConfig = {
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
          footer: {
            about: 'Curadoria de eventos e momentos inesquecíveis há mais de 10 anos.',
            whatsapp: '(15) 99723-0588',
            email: 'contato@cristinagatti.com.br',
            address: 'Rodovia José de Carvalho, km 127,5 — Bairro da Paineira',
            hours: 'Segunda a Sábado, 9h às 18h'
          }
        };
        setConfig(initialConfig);
      }
    });

    // Fetch Services
    const q = query(collection(db, 'services'), orderBy('order', 'asc'));
    const unsubServices = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // Initial Seed
        const initialServices: Service[] = [
          { id: '01', title: 'Casamentos', desc: 'Cenários românticos e minimalistas que traduzem a essência do seu amor em pureza e harmonia.', image: 'https://picsum.photos/seed/wedding-service/800/1000', order: 0 },
          { id: '02', title: 'Cerimonial', desc: 'Assessoria completa para que cada segundo da sua cerimônia seja vivido com tranquilidade e precisão.', image: 'https://picsum.photos/seed/ceremony-service/800/1000', order: 1 },
          { id: '03', title: 'Debutantes', desc: 'Transformamos o clássico em atemporal, criando uma atmosfera mágica para a celebração da juventude.', image: 'https://picsum.photos/seed/debutante-service/800/1000', order: 2 },
          { id: '04', title: 'Eventos Sociais', desc: 'De aniversários a bodas, curamos ambientes personalizados que elevam qualquer comemoração.', image: 'https://picsum.photos/seed/social-service/800/1000', order: 3 },
          { id: '05', title: 'Formatura', desc: 'O cenário ideal para coroar anos de dedicação com sofisticação, orgulho e elegância.', image: 'https://picsum.photos/seed/graduation-service/800/1000', order: 4 },
          { id: '06', title: 'Arranjos & Design', desc: 'Design floral exclusivo com flores permanentes e naturais, compondo mesas postas inesquecíveis.', image: 'https://picsum.photos/seed/floral-service/800/1000', order: 5 }
        ];
        setServices(initialServices);
      } else {
        setServices(snapshot.docs.map(d => d.data() as Service));
      }
      setLoading(false);
    });

    return () => {
      unsubConfig();
      unsubServices();
    };
  }, []);

  if (loading || !config) return <div className="h-screen flex items-center justify-center font-serif">Carregando...</div>;

  return (
    <div className="min-h-screen selection:bg-brand-dark selection:text-white bg-white">
      <Navbar config={config.navbar} />
      <Hero config={config.hero} />
      <Stats />
      <About />
      <Services services={services} />
      <Portfolio />
      <Testimonials />
      <Contact config={config.footer} />
      <Location config={config.footer} />
      <Footer config={config} />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}
