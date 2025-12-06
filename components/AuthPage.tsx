import React, { useState } from 'react';
import { User, UserRole, User as UserType } from '../types';
import { User as UserIcon, Smartphone, ArrowRight, ShieldCheck, Cog, KeyRound, Sparkles, Briefcase, HeartPulse, GraduationCap, AlertCircle, CheckCircle, Hammer } from 'lucide-react';
import { Input } from './Input';

interface AuthPageProps {
  onLogin: (user: UserType) => void;
}

// Simple in-memory storage for the session
const sessionUsers: Record<string, { password: string; fullName: string; role: UserRole; profession?: string }> = {};

const PROFESSIONS = [
  'Mechanic',
  'Electrician',
  'Plumber',
  'Doctor',
  'Nurse',
  'Priest/Pandit',
  'Driver',
  'Labourer',
  'Tutor',
  'Tour Guide',
  'Carpenter',
  'Painter'
];

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('traveler');
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [profession, setProfession] = useState(PROFESSIONS[0]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    setTimeout(() => {
      if (isLogin) {
        // LOGIN LOGIC
        const userRecord = sessionUsers[mobile];
        
        if (!userRecord) {
           setIsLoading(false);
           setError("Account not found. Please Sign Up first.");
           return;
        }
        
        if (userRecord.password !== password) {
           setIsLoading(false);
           setError("Incorrect password.");
           return;
        }

        // Login Success
        const user: User = {
            id: mobile,
            fullName: userRecord.fullName,
            mobile: mobile,
            role: userRecord.role,
            profession: userRecord.profession
        };
        setIsLoading(false);
        onLogin(user);

      } else {
        // SIGN UP LOGIC
        if (sessionUsers[mobile]) {
            setIsLoading(false);
            setError("User already exists. Please Sign In.");
            return;
        }

        // Create Account
        sessionUsers[mobile] = {
            password,
            fullName,
            role,
            profession: role === 'provider' ? profession : undefined
        };

        setIsLoading(false);
        setIsLogin(true); // Switch to Sign In view
        setSuccess("Account created successfully! Please Sign In.");
        setPassword(''); 
      }
    }, 1500);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
    setFullName('');
    setPassword('');
  };

  return (
    <div className="relative z-20 min-h-screen flex items-center justify-center p-4 py-20">
      <div className="w-full max-w-5xl bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50 flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Visuals & Info */}
        <div className="w-full md:w-1/2 p-8 md:p-12 relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="absolute -top-20 -left-20 text-slate-700/20 animate-spin-slow duration-[20s]">
            <Cog size={300} />
          </div>
          <div className="absolute -bottom-20 -right-20 text-slate-700/20 animate-spin-slow duration-[15s] reverse">
            <Sparkles size={250} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-gradient-to-br from-brand-secondary to-brand-health p-2 rounded-lg shadow-lg">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <span className="font-tech text-xl font-bold tracking-wider text-white">QUICKASSIST</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {role === 'traveler' ? (
                <>
                  Help is just a <span className="text-brand-secondary">Click Away.</span>
                </>
              ) : (
                <>
                  Your Skills. <span className="text-brand-worker">Someone's Need.</span>
                </>
              )}
            </h1>
            
            <div className="text-slate-400 text-lg mb-8 max-w-md space-y-4">
              {role === 'traveler' ? (
                <p>
                  Access our massive network of <b>Mechanics, Doctors, Priests, Labourers, Tutors</b>, and more.
                  Any problem, any time, anywhere.
                </p>
              ) : (
                <p>
                   Are you a professional? Join us to find people who need you right now. 
                   <br/><b>Receive instant job alerts in your area.</b>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-slate-950/50 flex flex-col justify-center">
          
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2 font-tech">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-slate-400 text-sm">
              {isLogin ? 'Login to access the network' : 'Create an account to connect'}
            </p>
          </div>

          {success && (
            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/50 rounded-xl flex items-center gap-3 text-green-400 text-sm animate-pulse-fast">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-pulse-fast">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-xl mb-8">
            <button
              onClick={() => setRole('traveler')}
              className={`py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                role === 'traveler' 
                  ? 'bg-slate-700 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserIcon size={16} /> User / Seeker
            </button>
            <button
              onClick={() => setRole('provider')}
              className={`py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                role === 'provider' 
                  ? 'bg-gradient-to-r from-brand-secondary to-brand-worker text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase size={16} /> Service Partner
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <Input
                  label="Full Name / Business Name"
                  placeholder="Ex: John Doe or City Garage"
                  type="text"
                  icon={<UserIcon size={18} />}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />

                {role === 'provider' && (
                    <div className="mb-4">
                      <label className="block text-slate-400 text-sm font-medium mb-1 ml-1">Your Profession</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <Hammer size={18} />
                        </div>
                        <select
                          className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all appearance-none cursor-pointer"
                          value={profession}
                          onChange={(e) => setProfession(e.target.value)}
                        >
                          {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                )}
              </>
            )}
            
            <Input
              label="Mobile Number"
              placeholder="+91 98765 43210"
              type="tel"
              icon={<Smartphone size={18} />}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />

            <Input
              label="Password"
              placeholder="••••••••"
              type="password"
              icon={<KeyRound size={18} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 mt-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                role === 'traveler' 
                  ? 'bg-slate-700 hover:bg-slate-600' 
                  : 'bg-gradient-to-r from-brand-secondary to-brand-worker hover:brightness-110'
              } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={toggleMode}
                className={`font-semibold hover:underline ${role === 'provider' ? 'text-brand-secondary' : 'text-white'}`}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;