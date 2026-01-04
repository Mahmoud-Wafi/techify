
import React, { useState, useEffect } from 'react';
import { Lang, Theme, PendingQuiz, Question, ExamSubmission } from '../../types';
import { api } from '../../api/client';
import { Button, Card, Input } from '../../components/UI';
import { Reveal } from '../../components/Reveal';
import { Plus, ClipboardList, Clock, HelpCircle, X, CheckCircle, Send, Trash2, Check, ArrowLeft, Layout, Users, Star, Target } from 'lucide-react';
// Added useAuth to access the current instructor's session data
import { useAuth } from '../../context/AuthContext';

const InstructorExams: React.FC<{ lang: Lang, theme: Theme }> = ({ lang, theme }) => {
  // Retrieve current user from auth context to get instructor_id
  const { user } = useAuth();
  const [exams, setExams] = useState<PendingQuiz[]>([]);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [viewingResultsFor, setViewingResultsFor] = useState<PendingQuiz | null>(null);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [examData, setExamData] = useState({
      title: '',
      course_title: '',
      due_date: new Date().toISOString().split('T')[0],
      duration_minutes: 30
  });

  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, text: '', options: ['', '', '', ''], correctAnswer: '', points: 10 }
  ]);

  const isEn = lang === 'en';

  const fetchExams = async () => {
      const data = await api.exams.list();
      setExams(data.pending);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchSubmissions = async (exam: PendingQuiz) => {
      const data = await api.instructor.getExamSubmissions(exam.id);
      setSubmissions(data);
      setViewingResultsFor(exam);
  };

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), text: '', options: ['', '', '', ''], correctAnswer: '', points: 10 }]);
  };

  const removeQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const totalExamPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      const isValid = questions.every(q => q.text && q.correctAnswer && q.points > 0);
      if (!isValid) {
          alert(isEn ? "Please complete all questions, points and select correct answers." : "يرجى إكمال جميع الأسئلة والدرجات وتحديد الإجابات الصحيحة.");
          return;
      }

      setIsSubmitting(true);
      // Fixed: Explicitly added instructor_id from authenticated user to satisfy PendingQuiz interface
      const finalExam: Omit<PendingQuiz, 'id'> = {
          ...examData,
          instructor_id: user?.id || 0,
          question_count: questions.length,
          total_points: totalExamPoints,
          questions: questions
      };

      await api.instructor.createExam(finalExam);
      setIsSubmitting(false);
      setShowSuccess(true);
      fetchExams();
      
      setTimeout(() => {
          setShowSuccess(false);
          setIsBuilderOpen(false);
          setExamData({ title: '', course_title: '', due_date: new Date().toISOString().split('T')[0], duration_minutes: 30 });
          setQuestions([{ id: 1, text: '', options: ['', '', '', ''], correctAnswer: '', points: 10 }]);
          document.body.style.overflow = 'auto';
      }, 1500);
  };

  const openBuilder = () => {
    setIsBuilderOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeBuilder = () => {
    setIsBuilderOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="pt-32 sm:pt-40 pb-10 px-4 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <Reveal>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
           <div>
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{isEn ? "Managed Exams" : "الامتحانات المدارة"}</h1>
             <p className="text-slate-500 dark:text-slate-400 mt-1">{isEn ? "Set points and track student performance" : "حدد الدرجات وتابع أداء الطلاب"}</p>
           </div>
           <Button onClick={openBuilder} className="shadow-neon">
             <Plus size={18} /> {isEn ? "Create New Exam" : "إنشاء امتحان جديد"}
           </Button>
        </div>
      </Reveal>

      {/* قائمة الامتحانات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam, i) => (
              <Reveal key={exam.id} delay={i * 0.1} width="100%">
                  <Card className="h-full border-2 border-transparent hover:border-primary/50 transition-all group">
                      <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                              <ClipboardList size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-slate-900 dark:text-white truncate">{exam.title}</h3>
                              <p className="text-xs text-slate-500">{exam.course_title}</p>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-6 text-[11px] font-bold">
                         <div className="bg-slate-50 dark:bg-white/5 p-2 rounded-lg flex justify-between items-center">
                             <span className="text-slate-500 uppercase">{isEn ? "Score" : "المجموع"}</span>
                             <span className="text-primary">{exam.total_points || 100} pts</span>
                         </div>
                         <div className="bg-slate-50 dark:bg-white/5 p-2 rounded-lg flex justify-between items-center">
                             <span className="text-slate-500 uppercase">{isEn ? "Items" : "أسئلة"}</span>
                             <span className="text-slate-900 dark:text-white">{exam.question_count}</span>
                         </div>
                      </div>

                      <div className="flex flex-col gap-2">
                          <Button onClick={() => fetchSubmissions(exam)} variant="primary" className="w-full text-xs py-2 bg-slate-900 dark:bg-primary/20 hover:bg-primary transition-colors">
                             <Users size={14}/> {isEn ? "View Submissions" : "عرض إجابات الطلاب"}
                          </Button>
                          <div className="flex gap-2">
                             <Button variant="outline" className="flex-1 text-[10px] py-1.5">{isEn ? "Edit" : "تعديل"}</Button>
                             <Button variant="outline" className="flex-1 text-[10px] py-1.5 text-red-500">{isEn ? "Delete" : "حذف"}</Button>
                          </div>
                      </div>
                  </Card>
              </Reveal>
          ))}
      </div>

      {/* نافذة عرض نتائج الطلاب (Submissions List) */}
      {viewingResultsFor && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingResultsFor(null)}></div>
              <Card className="relative z-10 w-full max-w-2xl !p-0 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                  <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                      <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">{isEn ? "Exam Submissions" : "إجابات الطلاب"}</h3>
                          <p className="text-xs text-slate-500">{viewingResultsFor.title}</p>
                      </div>
                      <button onClick={() => setViewingResultsFor(null)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto">
                      {submissions.length > 0 ? (
                          <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 dark:bg-black/20 text-slate-500 text-[10px] uppercase">
                                  <tr>
                                      <th className="p-4">{isEn ? "Student" : "الطالب"}</th>
                                      <th className="p-4 text-center">{isEn ? "Points" : "الدرجة"}</th>
                                      <th className="p-4 text-center">{isEn ? "Grade" : "النسبة"}</th>
                                      <th className="p-4 text-center">{isEn ? "Status" : "الحالة"}</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                  {submissions.map((s) => (
                                      <tr key={s.id}>
                                          <td className="p-4 font-bold text-slate-900 dark:text-white">{s.student_name}</td>
                                          <td className="p-4 text-center font-mono">{s.earned_points} / {s.total_points}</td>
                                          <td className="p-4 text-center font-bold text-primary">{s.percentage}%</td>
                                          <td className="p-4 text-center">
                                              {s.percentage >= 50 ? (
                                                  <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-[10px]">{isEn ? "Pass" : "ناجح"}</span>
                                              ) : (
                                                  <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px]">{isEn ? "Fail" : "راسب"}</span>
                                              )}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      ) : (
                          <div className="p-20 text-center text-slate-500">
                              <Users size={48} className="mx-auto mb-4 opacity-10" />
                              <p>{isEn ? "No students have taken this exam yet." : "لم يقم أي طالب بأداء الامتحان بعد."}</p>
                          </div>
                      )}
                  </div>
              </Card>
          </div>
      )}

      {/* منشئ الامتحانات الكامل */}
      {isBuilderOpen && (
          <div className="fixed inset-0 z-[100] bg-white dark:bg-[#0B2D2C] overflow-y-auto animate-in fade-in duration-300">
              <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0F383D]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                      <button onClick={closeBuilder} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                          <ArrowLeft size={24} className={!isEn ? "rotate-180" : ""} />
                      </button>
                      <div>
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{isEn ? "Exam Builder" : "منشئ الامتحانات"}</h2>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase">
                              <Target size={12}/> {isEn ? "Total Points" : "إجمالي الدرجات"}: {totalExamPoints}
                          </div>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <Button onClick={handleCreate} isLoading={isSubmitting} className="!py-2 !px-6 text-sm shadow-neon">
                          <Send size={18}/> {isEn ? "Publish Exam" : "نشر الامتحان"}
                      </Button>
                  </div>
              </header>

              <div className="max-w-4xl mx-auto px-4 py-10">
                  {showSuccess ? (
                      <div className="flex flex-col items-center justify-center py-20 text-emerald-500 animate-in zoom-in">
                          <CheckCircle size={100} className="mb-6 animate-bounce" />
                          <h4 className="font-bold text-3xl">{isEn ? "Exam Published!" : "تم النشر بنجاح!"}</h4>
                          <p className="text-slate-500 dark:text-slate-400 mt-2 text-center">Total Points: {totalExamPoints}</p>
                      </div>
                  ) : (
                      <form onSubmit={handleCreate} className="space-y-12">
                          <section>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                                  <Input label={isEn ? "Exam Title" : "عنوان الامتحان"} value={examData.title} onChange={e => setExamData({...examData, title: e.target.value})} required />
                                  <Input label={isEn ? "Target Course" : "الكورس المستهدف"} value={examData.course_title} onChange={e => setExamData({...examData, course_title: e.target.value})} required />
                                  <Input type="number" label={isEn ? "Duration (Minutes)" : "مدة الامتحان (بالدقائق)"} value={examData.duration_minutes} onChange={e => setExamData({...examData, duration_minutes: parseInt(e.target.value)})} required />
                                  <Input type="date" label={isEn ? "Deadline" : "آخر موعد للتسليم"} value={examData.due_date} onChange={e => setExamData({...examData, due_date: e.target.value})} required />
                              </div>
                          </section>

                          <section className="space-y-8 pb-32">
                              <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-4">
                                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                     <HelpCircle size={20} className="text-primary"/> {isEn ? "Questions" : "الأسئلة"}
                                  </h3>
                                  <Button type="button" variant="outline" onClick={addQuestion} className="!py-2 !px-4 text-xs">
                                      <Plus size={16}/> {isEn ? "Add Question" : "إضافة سؤال"}
                                  </Button>
                              </div>

                              <div className="space-y-8">
                                  {questions.map((q, qIndex) => (
                                      <div key={q.id} className="p-8 border border-slate-200 dark:border-white/10 rounded-3xl bg-white dark:bg-white/5 relative">
                                          <div className="flex justify-between items-center mb-6">
                                              <span className="bg-slate-900 dark:bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">Q{qIndex + 1}</span>
                                              <div className="flex items-center gap-4">
                                                  <div className="flex items-center gap-2">
                                                      <span className="text-[10px] font-bold text-slate-500 uppercase">{isEn ? "Points" : "الدرجات"}</span>
                                                      <input 
                                                        type="number" 
                                                        className="w-16 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-1 text-center font-bold text-primary"
                                                        value={q.points}
                                                        min="1"
                                                        onChange={e => updateQuestion(q.id, 'points', parseInt(e.target.value) || 0)}
                                                      />
                                                  </div>
                                                  <button type="button" onClick={() => removeQuestion(q.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                                              </div>
                                          </div>
                                          
                                          <div className="mb-8">
                                              <textarea 
                                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-slate-900 dark:text-white outline-none focus:border-primary transition-all text-lg"
                                                placeholder={isEn ? "Enter your question here..." : "اكتب سؤالك هنا..."}
                                                rows={2}
                                                value={q.text}
                                                onChange={e => updateQuestion(q.id, 'text', e.target.value)}
                                                required
                                              />
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              {q.options.map((opt, oIndex) => (
                                                  <div key={oIndex} className="relative">
                                                      <input 
                                                        className={`w-full bg-slate-50 dark:bg-black/20 border rounded-2xl p-4 pr-12 text-sm transition-all outline-none ${q.correctAnswer === opt && opt ? 'border-primary ring-4 ring-primary/10' : 'border-slate-200 dark:border-white/10 focus:border-primary'}`}
                                                        placeholder={isEn ? `Option ${oIndex + 1}` : `خيار ${oIndex + 1}`}
                                                        value={opt}
                                                        onChange={e => {
                                                          const newOpts = [...q.options];
                                                          newOpts[oIndex] = e.target.value;
                                                          updateQuestion(q.id, 'options', newOpts);
                                                        }}
                                                        required
                                                      />
                                                      <button
                                                        type="button"
                                                        onClick={() => updateQuestion(q.id, 'correctAnswer', opt)}
                                                        className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${q.correctAnswer === opt && opt ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-400'}`}
                                                      >
                                                          <Check size={16} />
                                                      </button>
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </section>
                      </form>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default InstructorExams;
