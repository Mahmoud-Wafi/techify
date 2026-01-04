import React, { useState, useEffect } from 'react';
import { Lang, PublicInstructor } from '../types';
import { api } from '../api/client';
import { Card } from '../components/UI';
import { Reveal } from '../components/Reveal';
import { ArrowLeft, CheckCircle, Users, Star } from 'lucide-react';

interface MentorsListProps {
  onBack: () => void;
  lang: Lang;
}

const MentorsList: React.FC<MentorsListProps> = ({ onBack, lang }) => {
  const [mentors, setMentors] = useState<PublicInstructor[]>([]);
  const isEn = lang === 'en';

  useEffect(() => {
    api.public.getInstructors().then(setMentors).catch(console.error);
  }, []);

  return (
    <div className="pt-32 sm:pt-40 pb-10 px-4 max-w-7xl mx-auto min-h-screen">
      <Reveal>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
           <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-700 dark:text-white">
             <ArrowLeft size={24} className={!isEn ? "rotate-180" : ""} />
           </button>
           <div>
             <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{isEn ? 'Our Mentors' : 'نخبة المدربين'}</h1>
             <p className="text-slate-500 dark:text-slate-400 mt-1">{isEn ? 'Learn from industry experts at top tech companies' : 'تعلم من خبراء الصناعة في كبرى الشركات التقنية'}</p>
           </div>
        </div>
      </Reveal>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mentors.map((mentor, i) => (
          <Reveal key={mentor.id} delay={i * 0.1} width="100%">
            <Card className="h-full flex flex-col items-center text-center !p-6 hover:border-primary/50 transition-colors group">
              <div className="relative w-28 h-28 mb-4">
                 <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:bg-primary/40 transition-colors"></div>
                 <img 
                   src={mentor.image} 
                   alt={mentor.name} 
                   className="w-full h-full object-cover rounded-full border-2 border-white/10 group-hover:border-primary transition-all duration-500 group-hover:scale-105 grayscale group-hover:grayscale-0" 
                 />
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1 mb-1">
                 {mentor.name} <CheckCircle size={14} className="text-blue-400" fill="currentColor" />
              </h3>
              <p className="text-sm font-medium text-primary mb-2">{mentor.role} @ {mentor.company}</p>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">{mentor.bio}</p>
              
              <div className="mt-auto w-full flex justify-between items-center border-t border-slate-100 dark:border-white/10 pt-4">
                 <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Users size={12} /> {mentor.student_count}
                 </div>
                 <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                    <Star size={12} fill="currentColor" /> {mentor.rating}
                 </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
};

export default MentorsList;