
import React, { useState, useEffect, useRef } from 'react';
import { Course, Lang, Theme, Lesson, Assignment } from '../../types';
import { api } from '../../api/client';
import { geminiService } from '../../services/geminiService';
import { Card, Button, Input } from '../../components/UI';
import { Reveal } from '../../components/Reveal';
import { Play, FileText, CheckCircle, Video, Book, Menu, Sparkles, Send, BrainCircuit, Upload, ArrowRight, MessageSquare } from 'lucide-react';

const CoursePlayer: React.FC<{ lang: Lang, theme: Theme, isMobile: boolean }> = ({ lang, theme, isMobile }) => {
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [tab, setTab] = useState<'lessons' | 'ai' | 'assignments'>('lessons');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // AI Chat States
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiChat, setAiChat] = useState<{role: 'user'|'bot', text: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isEn = lang === 'en';

  useEffect(() => {
    api.courses.getDashboard().then(dash => {
        if (dash.active_courses[0]) {
            api.courses.getDetail(dash.active_courses[0].id).then(res => {
                setActiveCourse(res);
                setActiveLesson(res.lessons?.[0] || null);
            });
        }
    });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChat]);

  const handleAiAsk = async () => {
    if (!aiQuestion.trim() || isAiLoading) return;
    const q = aiQuestion;
    setAiQuestion('');
    setAiChat(prev => [...prev, { role: 'user', text: q }]);
    setIsAiLoading(true);
    
    const ans = await geminiService.askTutor(activeLesson?.title || activeCourse?.title || '', q);
    setAiChat(prev => [...prev, { role: 'bot', text: ans || 'Error' }]);
    setIsAiLoading(false);
  };

  if (!activeCourse) return <div className="pt-40 text-center">Loading Classroom...</div>;

  return (
    <div className="pt-24 sm:pt-28 pb-10 px-4 max-w-7xl mx-auto min-h-screen flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0">
         <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative mb-6 border border-slate-800">
            {activeLesson ? (
                <iframe src={activeLesson.video_url} className="w-full h-full" allowFullScreen></iframe>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-500">Select a Lesson</div>
            )}
         </div>

         <Card className="!p-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{activeLesson?.title || activeCourse.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{activeLesson?.description || activeCourse.description}</p>
         </Card>
      </div>

      <div className={`lg:w-96 shrink-0 ${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
         <Card className="h-[600px] !p-0 overflow-hidden flex flex-col sticky top-28 shadow-xl border-2 border-primary/10">
            <div className="flex border-b border-slate-200 dark:border-white/10 shrink-0 bg-slate-50 dark:bg-black/20">
               <button onClick={() => setTab('lessons')} className={`flex-1 py-4 text-[10px] font-bold flex flex-col items-center gap-1 ${tab === 'lessons' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}><Video size={16}/> {isEn ? 'Lessons' : 'الدروس'}</button>
               <button onClick={() => setTab('ai')} className={`flex-1 py-4 text-[10px] font-bold flex flex-col items-center gap-1 ${tab === 'ai' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}><BrainCircuit size={16}/> {isEn ? 'AI Tutor' : 'المعلم الذكي'}</button>
               <button onClick={() => setTab('assignments')} className={`flex-1 py-4 text-[10px] font-bold flex flex-col items-center gap-1 ${tab === 'assignments' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}><FileText size={16}/> {isEn ? 'Tasks' : 'المهام'}</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
               {tab === 'lessons' && (
                  activeCourse.lessons?.map(l => (
                    <div key={l.id} onClick={() => setActiveLesson(l)} className={`p-3 rounded-xl mb-2 cursor-pointer transition-all ${activeLesson?.id === l.id ? 'bg-primary text-white' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}`}>
                        <div className="font-bold text-sm truncate">{l.title}</div>
                        <span className="text-[10px] opacity-70">{l.duration}</span>
                    </div>
                  ))
               )}

               {tab === 'ai' && (
                  <div className="flex flex-col h-full">
                     <div className="flex-1 space-y-4 mb-4">
                        <div className="bg-primary/10 p-3 rounded-2xl text-xs text-primary font-bold">
                            {isEn ? "Hello! Ask me anything about this lesson." : "أهلاً! اسألني عن أي شيء في هذا الدرس."}
                        </div>
                        {aiChat.map((m, i) => (
                           <div key={i} className={`p-3 rounded-2xl text-xs ${m.role === 'user' ? 'bg-slate-100 dark:bg-white/5 ml-8 text-right' : 'bg-primary/10 mr-8 text-primary font-medium'}`}>
                              {m.text}
                           </div>
                        ))}
                        {isAiLoading && <div className="text-[10px] text-primary animate-pulse">{isEn ? "Thinking..." : "جاري التفكير..."}</div>}
                        <div ref={chatEndRef} />
                     </div>
                     <div className="flex gap-2">
                        <input value={aiQuestion} onChange={e => setAiQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiAsk()} className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs" placeholder={isEn ? "Ask AI..." : "اسأل الذكاء..."} />
                        <button onClick={handleAiAsk} className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20"><Send size={16}/></button>
                     </div>
                  </div>
               )}

               {tab === 'assignments' && (
                  <div className="space-y-4">
                     <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <h4 className="font-bold text-sm text-emerald-500 mb-2">Final Project Task</h4>
                        <p className="text-xs text-slate-500 mb-4">Build a fully responsive dashboard using Next.js and Tailwind CSS.</p>
                        <div className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl p-6 text-center group cursor-pointer hover:bg-white/5">
                           <Upload size={24} className="mx-auto mb-2 text-slate-400 group-hover:text-primary transition-colors" />
                           <span className="text-[10px] font-bold text-slate-500">{isEn ? "Upload Project (ZIP/PDF)" : "ارفع المشروع"}</span>
                        </div>
                        <Button className="w-full mt-4 !py-2 text-xs shadow-neon">Submit Task</Button>
                     </div>
                  </div>
               )}
            </div>
         </Card>
      </div>
    </div>
  );
};

export default CoursePlayer;
