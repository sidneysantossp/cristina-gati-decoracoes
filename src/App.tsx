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
  Clock,
  Share2,
  MessageCircle
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

interface PortfolioItem {
  url: string;
  category: string;
  order: number;
}

interface Testimonial {
  quote: string;
  author: string;
  type: string;
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
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="flex flex-col gap-4"
            >
              <span className="text-5xl md:text-6xl font-serif text-brand-dark tracking-tight">{stat.value}</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-brand-muted font-medium">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const About = ({ config }: { config: SiteConfig['about'] }) => (
  <section id="sobre" className="py-40 bg-white relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-10">
      <div className="grid lg:grid-cols-2 gap-24 items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative aspect-square overflow-hidden border-4 border-brand-dark"
        >
          <img 
            src={config.image} 
            alt="Cristina Gatti" 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-10"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-brand-muted font-medium">{config.subtitle}</span>
          <h2 
            className="text-5xl md:text-7xl font-serif text-brand-dark leading-tight"
            dangerouslySetInnerHTML={{ __html: config.title }}
          />
          <div 
            className="space-y-8 text-brand-muted text-lg leading-relaxed font-light"
            dangerouslySetInnerHTML={{ __html: config.content }}
          />
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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <SectionHeading 
            subtitle="Nossa Especialidade" 
            title="CURADORIA COMPLETA." 
            align="left"
            className="max-w-4xl"
          />
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((service, idx) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Portfolio = ({ config, items }: { config: SiteConfig['portfolio'], items: PortfolioItem[] }) => {
  const categories = ['Todos', ...new Set(items.map(i => i.category))];
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [sharingItem, setSharingItem] = useState<PortfolioItem | null>(null);

  const filteredItems = activeCategory === 'Todos' 
    ? items 
    : items.filter(i => i.category === activeCategory);

  const shareUrl = window.location.href;

  return (
    <section id="portfolio" className="py-40 bg-white">
      <div className="max-w-7xl mx-auto px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <SectionHeading 
            subtitle={config.subtitle} 
            title={config.title} 
          />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-10 mb-20"
        >
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
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item, idx) => (
            <motion.div 
              key={idx}
              layout
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -5 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (idx % 4) * 0.1 }}
              className="aspect-square overflow-hidden group relative border-2 border-black/5 hover:border-brand-dark transition-all duration-500 bg-white"
            >
              <img 
                src={item.url} 
                alt={`Portfolio item ${idx}`} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSharingItem(item);
                  }}
                  className="bg-white text-brand-dark p-4 rounded-full hover:scale-110 transition-transform shadow-xl"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {sharingItem && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
              onClick={() => setSharingItem(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-sm p-12 flex flex-col gap-8 text-center relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => setSharingItem(null)}
                  className="absolute top-6 right-6 text-brand-muted hover:text-brand-dark transition-colors"
                >
                  <X size={20} />
                </button>
                
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-brand-muted font-bold">Compartilhar</span>
                  <h4 className="text-2xl font-serif text-brand-dark">ESPALHE A ARTE</h4>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharingItem.url)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 p-4 hover:bg-brand-light transition-colors group"
                  >
                    <div className="w-12 h-12 flex items-center justify-center border border-black/5 group-hover:border-brand-dark transition-colors">
                      <Facebook size={20} />
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-bold">Facebook</span>
                  </a>
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(sharingItem.url)}&text=${encodeURIComponent('Confira este trabalho incrível!')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 p-4 hover:bg-brand-light transition-colors group"
                  >
                    <div className="w-12 h-12 flex items-center justify-center border border-black/5 group-hover:border-brand-dark transition-colors">
                      <Twitter size={20} />
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-bold">Twitter</span>
                  </a>
                  <a 
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Confira este trabalho incrível: ' + sharingItem.url)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 p-4 hover:bg-brand-light transition-colors group"
                  >
                    <div className="w-12 h-12 flex items-center justify-center border border-black/5 group-hover:border-brand-dark transition-colors">
                      <MessageCircle size={20} />
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-bold">WhatsApp</span>
                  </a>
                </div>

                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(sharingItem.url);
                    alert('Link da imagem copiado!');
                  }}
                  className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-muted hover:text-brand-dark transition-colors border-t border-black/5 pt-6"
                >
                  Copiar Link da Imagem
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-24 text-center">
          <Button variant="outline">Ver mais no Instagram</Button>
        </div>
      </div>
    </section>
  );
};

const Testimonials = ({ config, items }: { config: SiteConfig['testimonials'], items: Testimonial[] }) => {
  return (
    <section id="depoimentos" className="py-40 bg-brand-light">
      <div className="max-w-7xl mx-auto px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <SectionHeading 
            subtitle={config.subtitle} 
            title={config.title} 
          />
        </motion.div>
        <div className="grid md:grid-cols-3 gap-16">
          {items.map((t, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="flex flex-col gap-10 p-12 border border-black/5 bg-white"
            >
              <p className="text-xl font-serif italic text-brand-dark/80 leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-brand-dark uppercase tracking-widest">{t.author}</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-brand-muted font-medium">{t.type}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Contact = ({ config }: { config: SiteConfig['footer'] }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: { name?: string; email?: string; message?: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    if (!formData.message.trim()) newErrors.message = 'Mensagem é obrigatória';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="contato" className="py-40 bg-white">
      <div className="max-w-7xl mx-auto px-10">
        <div className="grid lg:grid-cols-2 gap-32">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-16"
          >
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
          </motion.div>

          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-10 bg-brand-light p-12 border border-black/5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="flex flex-col gap-4">
                <label className="text-[10px] uppercase tracking-[0.3em] text-brand-muted font-medium">Nome</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={cn(
                    "bg-transparent border-b py-4 focus:border-brand-dark outline-none transition-all font-medium text-lg",
                    errors.name ? "border-red-500" : "border-black/10"
                  )} 
                />
                {errors.name && <span className="text-[10px] text-red-500 uppercase font-bold tracking-widest">{errors.name}</span>}
              </div>
              <div className="flex flex-col gap-4">
                <label className="text-[10px] uppercase tracking-[0.3em] text-brand-muted font-medium">E-mail</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={cn(
                    "bg-transparent border-b py-4 focus:border-brand-dark outline-none transition-all font-medium text-lg",
                    errors.email ? "border-red-500" : "border-black/10"
                  )} 
                />
                {errors.email && <span className="text-[10px] text-red-500 uppercase font-bold tracking-widest">{errors.email}</span>}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <label className="text-[10px] uppercase tracking-[0.3em] text-brand-muted font-medium">Mensagem</label>
              <textarea 
                rows={4} 
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="CONTE-NOS O SEU SONHO..."
                className={cn(
                  "bg-transparent border-b py-4 focus:border-brand-dark outline-none transition-all font-medium text-lg resize-none placeholder:text-black/10",
                  errors.message ? "border-red-500" : "border-black/10"
                )}
              ></textarea>
              {errors.message && <span className="text-[10px] text-red-500 uppercase font-bold tracking-widest">{errors.message}</span>}
            </div>
            
            <div className="flex flex-col gap-6">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
              </Button>
              
              <AnimatePresence>
                {submitted && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center p-4 bg-brand-dark text-white text-[10px] uppercase tracking-[0.2em] font-bold"
                  >
                    Mensagem enviada com sucesso!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

const Location = ({ config }: { config: SiteConfig['footer'] }) => (
  <section className="py-40 bg-brand-light border-y border-black/10">
    <div className="max-w-7xl mx-auto px-10">
      <div className="grid lg:grid-cols-2 gap-32 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-16"
        >
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
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="aspect-video bg-white border-4 border-black/10 p-2 grayscale"
        >
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3654.67562854321!2d-47.4234567!3d-23.7123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQyJzQ0LjQiUyA0N8KwMjUnMjQuNCJX!5e0!3m2!1spt-BR!2sbr!4v1620000000000!5m2!1spt-BR!2sbr" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy"
          ></iframe>
        </motion.div>
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
            {config.footer.address}<br />
            {config.footer.hours}
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
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
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
    const qServices = query(collection(db, 'services'), orderBy('order', 'asc'));
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      if (snapshot.empty) {
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
    });

    // Fetch Portfolio
    const qPortfolio = query(collection(db, 'portfolio'), orderBy('order', 'asc'));
    const unsubPortfolio = onSnapshot(qPortfolio, (snapshot) => {
      if (snapshot.empty) {
        const initialPortfolio: PortfolioItem[] = [
          { url: 'https://picsum.photos/seed/p1-bold/800/800', category: 'Casamentos', order: 0 },
          { url: 'https://picsum.photos/seed/p2-bold/800/800', category: 'Debutantes', order: 1 },
          { url: 'https://picsum.photos/seed/p3-bold/800/800', category: 'Sociais', order: 2 },
          { url: 'https://picsum.photos/seed/p4-bold/800/800', category: 'Arranjos', order: 3 },
          { url: 'https://picsum.photos/seed/p5-bold/800/800', category: 'Casamentos', order: 4 },
          { url: 'https://picsum.photos/seed/p6-bold/800/800', category: 'Debutantes', order: 5 },
          { url: 'https://picsum.photos/seed/p7-bold/800/800', category: 'Sociais', order: 6 },
          { url: 'https://picsum.photos/seed/p8-bold/800/800', category: 'Arranjos', order: 7 },
        ];
        setPortfolio(initialPortfolio);
      } else {
        setPortfolio(snapshot.docs.map(d => d.data() as PortfolioItem));
      }
    });

    // Fetch Testimonials
    const qTestimonials = query(collection(db, 'testimonials'), orderBy('order', 'asc'));
    const unsubTestimonials = onSnapshot(qTestimonials, (snapshot) => {
      if (snapshot.empty) {
        const initialTestimonials: Testimonial[] = [
          { quote: "A Cristina materializou nossa essência em cada detalhe. O resultado foi um cenário atemporal que ainda vive em nossas memórias.", author: "Betânia & Rodrigo", type: "Casamento", order: 0 },
          { quote: "Minimalismo e sofisticação em sua forma mais pura. A festa de 15 anos da minha filha foi um marco de elegância.", author: "Família Santos", type: "Debutante", order: 1 },
          { quote: "Contratar a curadoria da Cristina foi nossa melhor escolha. Paz, harmonia e beleza em cada centímetro do evento.", author: "Kelly & Eliézer", type: "Casamento", order: 2 }
        ];
        setTestimonials(initialTestimonials);
      } else {
        setTestimonials(snapshot.docs.map(d => d.data() as Testimonial));
      }
      setLoading(false);
    });

    return () => {
      unsubConfig();
      unsubServices();
      unsubPortfolio();
      unsubTestimonials();
    };
  }, []);

  if (loading || !config) return <div className="h-screen flex items-center justify-center font-serif">Carregando...</div>;

  return (
    <div className="min-h-screen selection:bg-brand-dark selection:text-white bg-white">
      <Navbar config={config.navbar} />
      <Hero config={config.hero} />
      <Stats />
      <About config={config.about} />
      <Services services={services} />
      <Portfolio config={config.portfolio} items={portfolio} />
      <Testimonials config={config.testimonials} items={testimonials} />
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
