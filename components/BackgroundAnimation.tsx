import React from 'react';

const BackgroundAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-brand-dark to-slate-900 opacity-90 z-10"></div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(60deg) scale(2)',
          transformOrigin: 'top center',
        }}
      ></div>

      {/* Floating Orbs/Glows */}
      {/* Mechanic/Tech Blue */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-secondary rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-pulse"></div>
      
      {/* Festival/Spiritual Orange */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-spiritual rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse delay-1000"></div>

      {/* Warning/Action Amber */}
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-primary rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-pulse delay-700"></div>
    </div>
  );
};

export default BackgroundAnimation;