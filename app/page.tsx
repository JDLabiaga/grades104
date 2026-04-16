"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; 

interface StudentRecord {
  id: string; student_name: string; quiz: number; laboratory: number; 
  assignment: number; attendance: number; major_exam: number; final_grade: number;
}

export default function Home() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  
  // Changed initial state to empty strings for better UX
  const [scores, setScores] = useState<any>({
    quiz: { score: '', total: 100 },
    lab: { score: '', total: 100 },
    assign: { score: '', total: 100 },
    atten: { score: '', total: 100 },
    exam: { score: '', total: 100 },
  });
  
  const [records, setRecords] = useState<StudentRecord[]>([]);

  const fetchRecords = useCallback(async () => {
    const { data } = await supabase.from('student4_grades').select('*').order('created_at', { ascending: false });
    setRecords((data as StudentRecord[]) || []);
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const resetForm = () => {
    setName(''); setEditingId(null);
    setScores({
      quiz: { score: '', total: 100 }, lab: { score: '', total: 100 },
      assign: { score: '', total: 100 }, atten: { score: '', total: 100 }, exam: { score: '', total: 100 },
    });
  };

  const addStudent = async () => {
    if (!name.trim()) return alert("Enter Student Name");
    const p = (part: any) => (part.total > 0 ? (Number(part.score) / part.total) * 100 : 0);
    
    const payload = { 
      student_name: name, 
      quiz: p(scores.quiz), 
      laboratory: p(scores.lab), 
      assignment: p(scores.assign), 
      attendance: p(scores.atten), 
      major_exam: p(scores.exam) 
    };

    if (editingId) await supabase.from('student4_grades').update(payload).eq('id', editingId);
    else await supabase.from('student4_grades').insert([payload]);

    resetForm(); fetchRecords();
  };

  const deleteRecord = async (id: string) => {
    if (confirm("Permanently delete this record?")) {
      const { error } = await supabase.from('student4_grades').delete().eq('id', id);
      if (!error) fetchRecords();
    }
  };

  const handleEdit = (r: StudentRecord) => {
    setEditingId(r.id);
    setName(r.student_name);
    setScores({
      quiz: { score: r.quiz, total: 100 },
      lab: { score: r.laboratory, total: 100 },
      assign: { score: r.assignment, total: 100 },
      atten: { score: r.attendance, total: 100 },
      exam: { score: r.major_exam, total: 100 },
    });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-900 via-blue-900 to-black p-4 md:p-12 text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex justify-between items-center mb-12 bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-blue-400">Academic Portal</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 italic tracking-widest">V4.0 // Database Synchronized</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-black text-white">{records.length}</span>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">Units Verified</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* INPUT SECTION */}
          <div className="lg:col-span-4 bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 h-fit sticky top-12">
            <h3 className="text-xs font-black text-blue-400 uppercase mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> {editingId ? 'Modify Record' : 'Create New Entry'}
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Student Name</label>
                <input 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                  placeholder="Enter Full Name..." value={name} onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase block">Score Input</label>
                {Object.keys(scores).map((k) => (
                  <div key={k} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
                    <span className="text-[10px] font-black w-16 text-blue-400 uppercase">{k}</span>
                    <input 
                      type="number" 
                      className="w-full bg-transparent text-right font-black text-white text-lg outline-none placeholder:text-slate-800" 
                      placeholder="--" 
                      value={scores[k].score}
                      onChange={(e) => setScores({...scores, [k]: {...scores[k], score: e.target.value}})} 
                    />
                    <span className="text-slate-700 font-bold">/</span>
                    <input 
                      type="number" 
                      className="w-14 bg-transparent text-center font-bold text-slate-500 outline-none" 
                      value={scores[k].total}
                      onChange={(e) => setScores({...scores, [k]: {...scores[k], total: e.target.value}})} 
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button onClick={addStudent} className="w-full bg-blue-600 hover:bg-blue-400 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-900/40 transition-all uppercase text-xs tracking-widest">
                  {editingId ? 'Update Terminal' : 'Commit to Database'}
                </button>
                {editingId && (
                  <button onClick={resetForm} className="text-[10px] font-black text-slate-500 hover:text-white uppercase transition-colors">Discard Changes</button>
                )}
              </div>
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="lg:col-span-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-white/5 border-b border-white/5">
                  <tr className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    <th className="px-8 py-7">Student Information</th>
                    <th className="px-6 py-7 text-center">Complete Score Matrix</th>
                    <th className="px-6 py-7 text-center">Evaluation</th>
                    <th className="px-8 py-7 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5 transition-all group">
                      <td className="px-8 py-8">
                        <p className="font-black text-white text-base uppercase tracking-tight">{r.student_name}</p>
                        <p className="text-[9px] text-blue-500 font-bold mt-1 tracking-widest">ID: {r.id.substring(0,8).toUpperCase()}</p>
                      </td>
                      <td className="px-6 py-8 text-center">
                        <div className="grid grid-cols-5 gap-1.5 max-w-[400px] mx-auto">
                          {(['quiz', 'laboratory', 'assignment', 'attendance', 'major_exam'] as const).map(k => (
                            <div key={k} className="bg-slate-950/40 px-2 py-2 rounded-xl text-[9px] font-black border border-white/5 uppercase">
                              <p className="text-slate-600 mb-1">{k.substring(0,3)}</p>
                              <span className="text-blue-400 text-xs">{Number(r[k] || 0).toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-8 text-center">
                        <div className="inline-block bg-blue-500/10 px-6 py-3 rounded-2xl border border-blue-500/20">
                          <span className="text-2xl font-black text-blue-400">
                            {Number(r.final_grade || 0).toFixed(1)}<span className="text-xs ml-0.5">%</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleEdit(r)} className="p-3 bg-white/5 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                          </button>
                          <button onClick={() => deleteRecord(r.id)} className="p-3 bg-white/5 rounded-xl hover:bg-red-600 hover:text-white transition-all text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {records.length === 0 && (
              <div className="p-20 text-center text-slate-600 font-black uppercase text-xs tracking-widest animate-pulse">
                Awaiting Data Input...
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}