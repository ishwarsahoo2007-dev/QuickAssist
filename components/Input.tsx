import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, icon, className, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-slate-400 text-sm font-medium mb-1 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-primary transition-colors">
          {icon}
        </div>
        <input
          className={`w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all placeholder-slate-600 backdrop-blur-sm ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};