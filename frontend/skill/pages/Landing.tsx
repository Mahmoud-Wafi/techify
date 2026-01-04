import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, CheckCircle, Star, Award, BookOpen, ShieldCheck, LogIn, Sun, Moon,
  Users, Globe, Code, MessageCircle, GraduationCap, Check
} from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { Button, Card } from '../components/UI';
import { Lang, Theme, PlatformStats } from '../types';
import { ASSETS } from '../constants/assets';
import { api } from '../api/client';

interface LandingProps {
  onLoginClick: () => void;
  onJoinClick: () => void; 
  onExploreClick: () => void;
  onMentorsClick?: () => void;
  onLogoClick?: () => void;
  lang: Lang;
  toggleLang: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

const Landing: React.FC<LandingProps> = ({ 
  onLoginClick, onJoinClick, onExploreClick, onMentorsClick, onLogoClick, lang, toggleLang, theme, toggleTheme 
}) => {
  const isEn = lang === 'en';
  const [statsData, setStatsData] = useState<PlatformStats | null>(null);

  useEffect(() => {
    api.public.getStats().then(setStatsData);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Professional "Home" behavior: Always scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // If we are in a sub-view of the landing page, trigger the callback
    if (onLogoClick) onLogoClick();
  };

  const features = [
    { title: isEn ? "Structured Learning" : "تعليم منظم", desc: isEn ? "Proven curricula designed for deep comprehension." : "مناهج مثبتة مصممة للاستيعاب العميق.", icon: BookOpen },
    { title: isEn ? "Industry Certification" : "شهادات معتمدة", desc: isEn ? "Earn certificates recognized by global employers." : "احصل على شهادات معترف بها من أصحاب العمل العالميين.", icon: Award },
    { title: isEn ? "Expert Tutoring" : "دروس مع خبراء", desc: isEn ? "Learn from professionals with real-world experience." : "تعلم من محترفين ذوي خبرة واقعية.", icon: GraduationCap },
  ];

  return (
    <div className={`relative min-h-screen ${!isEn ? 'rtl' : ''} bg-eden-bg`}>
      
      {/* NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-eden-bg/80 backdrop-blur-2xl border-b border-white/5 px-6 py-5 flex justify-between items-center h-20">
         <div 
           className="flex items-center gap-4 cursor-pointer hover:opacity-80 active:scale-95 transition-all group" 
           onClick={handleLogoClick}
         >
             <img src={ASSETS.LOGO} alt="Teachify Logo" className="h-12 w-12 object-contain group-hover:rotate-6 transition-transform" />
             <span className="font-bold text-2xl text-white tracking-tighter">Teachify</span>
         </div>

         <div className="flex items-center gap-6">
            <button onClick={toggleLang} className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em]">{isEn ? 'العربية' : 'English'}</button>
            <button onClick={onLoginClick} className="hidden sm:block text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-widest">{isEn ? 'Login' : 'دخول'}</button>
            <Button onClick={onJoinClick} className="!h-10 !px-6">{isEn ? 'Join Now' : 'انضم الآن'}</Button>
         </div>
      </nav>
      
      {/* HERO SECTION */}
      <section className="relative pt-48 pb-32 px-6 bg-hero-aura overflow-hidden min-h-[85vh] flex items-center">
        <div className="absolute inset-0 bg-eden-dots opacity-40 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-eden-accent text-[10px] font-bold mb-8 border border-white/5 uppercase tracking-[0.2em] backdrop-blur-md">
               <ShieldCheck size={14} /> {isEn ? "Enterprise Academic Standards" : "معايير أكاديمية مؤسسية"}
            </div>
          </Reveal>
          
          <Reveal delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[1] tracking-tighter max-w-5xl">
               {isEn ? "The Future of" : "مستقبل"} <br />
               <span className="text-eden-accent">{isEn ? "Knowledge Work" : "العمل المعرفي"}</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 font-medium leading-relaxed">
               {isEn 
                 ? "A premium workspace for high-quality education, expert assessments, and industry-recognized certifications." 
                 : "مساحة عمل متميزة للتعليم عالي الجودة وتقييمات الخبراء والشهادات المعتمدة في الصناعة."}
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button onClick={onExploreClick} className="!h-14 !px-12 text-sm">
                 {isEn ? "Browse Catalog" : "تصفح الكتالوج"} <ArrowRight size={20} className={!isEn ? "rotate-180 ml-2" : "ml-2"} />
              </Button>
              <Button onClick={onJoinClick} variant="secondary" className="!h-14 !px-12 text-sm">
                 {isEn ? "Join as Instructor" : "انضم كمدرب"}
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="bg-eden-card/50 border-y border-white/5 py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-16 lg:gap-24 relative z-10">
           {[
             { label: isEn ? 'Enrolled Students' : 'طلابنا', value: statsData?.active_students || '2,500+' },
             { label: isEn ? 'Expert Mentors' : 'الخبراء', value: statsData?.expert_instructors || '12' },
             { label: isEn ? 'Verified Courses' : 'الكورسات', value: statsData?.total_courses || '24' },
             { label: isEn ? 'Job Placements' : 'التوظيف', value: statsData?.hired_graduates || '96%' },
           ].map((stat, i) => (
             <div key={i} className="text-center">
                <h3 className="text-5xl font-black text-white mb-3 tracking-tighter">{stat.value}</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em]">{stat.label}</p>
             </div>
           ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-40 px-6 bg-eden-bg relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
             <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">{isEn ? "Platform Pillars" : "ركائز المنصة"}</h2>
             <div className="w-12 h-1 bg-eden-accent mx-auto rounded-full shadow-[0_0_10px_#22d3ee]"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat, i) => (
              <Card key={i} className="flex flex-col items-center text-center p-12 group hover:border-eden-accent/50 transition-all duration-500 hover:-translate-y-2">
                 <div className="w-20 h-20 bg-white/5 text-eden-accent rounded-2xl flex items-center justify-center mb-10 border border-white/5 group-hover:bg-eden-accent group-hover:text-eden-bg transition-all duration-500 shadow-xl">
                    <feat.icon size={32} />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{feat.title}</h3>
                 <p className="text-slate-400 leading-relaxed text-sm font-medium">{feat.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-eden-card py-24 px-6 text-white border-t border-white/5">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-1 md:col-span-2">
               <div 
                 className="flex items-center gap-4 mb-8 cursor-pointer hover:opacity-80 active:scale-95 transition-all group w-fit"
                 onClick={handleLogoClick}
               >
                  <img src={ASSETS.LOGO} alt="Teachify Logo" className="h-12 w-12 object-contain group-hover:rotate-6 transition-transform" />
                  <span className="font-bold text-2xl tracking-tighter text-white">Teachify</span>
               </div>
               <p className="text-slate-500 max-w-sm text-sm leading-relaxed font-medium">
                 {isEn 
                   ? "Teachify is a high-fidelity learning management ecosystem bridging the gap between theory and industry. We empower the next generation of engineers through structured, professional curricula." 
                   : "تيشيفاي هو نظام تعليمي عالي الدقة يسد الفجوة بين النظرية والتطبيق الصناعي. نحن نمكن الجيل القادم من المهندسين من خلال مناهج احترافية ومنظمة."}
               </p>
            </div>
            <div>
               <h4 className="font-bold text-white mb-8 uppercase text-[10px] tracking-[0.3em]">{isEn ? "Platform" : "المنصة"}</h4>
               <ul className="space-y-4 text-slate-500 text-xs font-bold">
                  <li className="hover:text-eden-accent cursor-pointer transition-colors uppercase tracking-widest">{isEn ? "Course Catalog" : "كتالوج الدورات"}</li>
                  <li className="hover:text-eden-accent cursor-pointer transition-colors uppercase tracking-widest">{isEn ? "Verify Certificate" : "التحقق من الشهادة"}</li>
                  <li className="hover:text-eden-accent cursor-pointer transition-colors uppercase tracking-widest">{isEn ? "Instructor Hub" : "مركز المدربين"}</li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-white mb-8 uppercase text-[10px] tracking-[0.3em]">{isEn ? "Connect" : "تواصل"}</h4>
               <ul className="space-y-4 text-slate-500 text-xs font-bold">
                  <li className="hover:text-eden-accent cursor-pointer transition-colors uppercase tracking-widest">{isEn ? "Enterprise Sales" : "مبيعات المؤسسات"}</li>
                  <li className="hover:text-eden-accent cursor-pointer transition-colors uppercase tracking-widest">{isEn ? "Support Center" : "مركز الدعم"}</li>
               </ul>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default Landing;