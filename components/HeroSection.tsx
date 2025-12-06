import React from 'react';
import { ChevronRight, Car, HeartPulse, Sparkles, Home, Hammer, GraduationCap, Plane, Search } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const categories = [
    { name: 'Vehicle & Road', icon: <Car size={20} />, color: 'text-brand-primary' },
    { name: 'Emergency & Health', icon: <HeartPulse size={20} />, color: 'text-brand-health' },
    { name: 'Religious & Cultural', icon: <Sparkles size={20} />, color: 'text-brand-spiritual' },
    { name: 'Home Services', icon: <Home size={20} />, color: 'text-brand-home' },
    { name: 'Worker & Labour', icon: <Hammer size={20} />, color: 'text-brand-worker' },
    { name: 'Education', icon: <GraduationCap size={20} />, color: 'text-brand-edu' },
    { name: 'Travel & Stay', icon: <Plane size={20} />, color: 'text-brand-travel' },
  ];

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 pt-16">
      
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700 text-brand-secondary text-sm font-medium mb-8 animate-pulse-fast backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-brand-health"></span>
        <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
        <span className="w-2 h-2 rounded-full bg-brand-spiritual"></span>
        Universal Life Assistant
      </div>
      
      {/* Main Headline */}
      <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-tech tracking-tight max-w-6xl leading-tight">
        One App for Every <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-health to-brand-spiritual">
          Need in Life.
        </span>
      </h1>
      
      {/* Subheadline */}
      <p className="text-slate-400 text-lg md:text-xl max-w-3xl mb-10 leading-relaxed">
        From <b>Mechanics</b> to <b>Doctors</b>, <b>Brahmins</b> to <b>Electricians</b>, and <b>Tutors</b> to <b>Travel Guides</b>. 
        Connect with trusted help locally, instantly.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md sm:max-w-none justify-center mb-16">
        <button 
          onClick={onGetStarted}
          className="px-8 py-4 bg-gradient-to-r from-brand-secondary to-blue-600 text-white font-bold rounded-xl text-lg hover:brightness-110 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
        >
          <Search size={20} /> Find Services
        </button>
        <button 
          onClick={onGetStarted}
          className="px-8 py-4 bg-slate-800/50 text-white font-bold rounded-xl text-lg hover:bg-slate-700/50 backdrop-blur-md border border-slate-600 transition-all"
        >
          Register as Partner
        </button>
      </div>

      {/* Category Grid Preview */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 opacity-90">
        {categories.map((cat, idx) => (
          <div key={idx} className="flex flex-col items-center justify-center p-4 bg-slate-900/40 border border-slate-800 rounded-xl backdrop-blur-sm hover:bg-slate-800/60 transition-colors cursor-default">
            <div className={`mb-2 ${cat.color}`}>{cat.icon}</div>
            <span className="text-xs font-medium text-slate-300">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Footer tagline */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-slate-600 text-sm">
        Helping you with Emergency, Spiritual, Daily, and Future needs.
      </div>
    </div>
  );
};

export default HeroSection;