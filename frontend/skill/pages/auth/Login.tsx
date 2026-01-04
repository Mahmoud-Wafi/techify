import React, { useState } from 'react';
import { Button, Card, Input } from '../../components/UI';
import { api } from '../../api/client';
import { User, Lang, Theme } from '../../types';
import { Sun, Moon, ArrowLeft, ShieldCheck } from 'lucide-react';
import { ASSETS } from '../../constants/assets';
import { motion } from 'framer-motion';

interface LoginProps {
  onLogin: (u: User) => void;
  onBack: () => void;
  lang: Lang;
  toggleLang: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

const LoginPage: React.FC<LoginProps> = ({ onLogin, onBack, lang, toggleLang, theme, toggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEn = lang === 'en';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError(null);
    try {
        const u = await api.auth.login(email, password);
        onLogin(u);
    } catch (err: any) {
        setError(isEn ? "Access denied. Please verify your credentials." : "تم رفض الوصول. يرجى التحقق من بياناتك.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative z-10 bg-eden-bg overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-eden-accent/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />

        <div className="absolute top-6 right-6 flex items-center gap-4">
            <button onClick={toggleLang} className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em]">
                {isEn ? 'العربية' : 'English'}
            </button>
            <button onClick={toggleTheme} className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-eden-accent transition-all border border-white/5">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
        </div>

        <Card className="w-full max-w-md !p-0 overflow-hidden border-white/10 bg-eden-card/40 backdrop-blur-3xl shadow-2xl">
            <div className="p-8 sm:p-14 flex flex-col items-center">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-10 relative cursor-pointer group"
                  onClick={onBack}
                >
                    <div className="absolute inset-0 bg-eden-accent/20 blur-2xl rounded-full group-hover:bg-eden-accent/40 transition-all" />
                    <img src={ASSETS.LOGO} alt="Logo" className="w-24 h-24 object-contain relative z-10 group-hover:rotate-12 transition-transform duration-500" />
                </motion.div>
                
                <h1 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">Teachify</h1>
                <p className="text-[10px] text-slate-500 mb-12 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    <ShieldCheck size={14} className="text-eden-accent" />
                    {isEn ? "Authentication Required" : "مطلوب مصادقة الدخول"}
                </p>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full p-4 mb-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase text-center tracking-widest">
                    {error}
                  </motion.div>
                )}
                
                <form onSubmit={handleLogin} className="w-full space-y-4">
                    <Input 
                        label={isEn ? "Email Identity" : "الهوية البريدية"} 
                        placeholder="pilot@teachify.io" 
                        value={email} 
                        type="email"
                        onChange={(e) => setEmail(e.target.value)} 
                        required
                    />
                    <Input 
                        label={isEn ? "Access Code" : "رمز الوصول"} 
                        type="password" 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required
                    />
                    <Button type="submit" className="w-full mt-8 shadow-glow !h-16" isLoading={loading}>
                        {isEn ? "Authorize Session" : "مصادقة الجلسة"}
                    </Button>
                </form>

                <div className="mt-12 flex flex-col items-center gap-6">
                    <button onClick={onBack} className="text-[10px] font-black text-slate-500 hover:text-eden-accent transition-colors flex items-center gap-2 uppercase tracking-[0.3em] group">
                        <ArrowLeft size={14} className={`${!isEn ? "rotate-180" : ""} group-hover:-translate-x-1 transition-transform`} />
                        {isEn ? "Back to Mainframe" : "العودة للقائمة الرئيسية"}
                    </button>
                    
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest opacity-50">
                        &copy; 2024 Teachify Neural Systems
                    </p>
                </div>
            </div>
        </Card>
    </div>
  );
};

export default LoginPage;