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
  const [scores, setScores] = useState({
    quiz: { score: 0, total: 100 },
    lab: { score: 0, total: 100 },
    assign: { score: 0, total: 100 },
    atten: { score: 0, total: 100 },
    exam: { score: 0, total: 100 },
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
      quiz: { score: 0, total: 100 }, lab: { score: 0, total: 100 },
      assign: { score: 0, total: 100 }, atten: { score: 0, total: 100 }, exam: { score: 0, total: 100 },
    });
  };

  const addStudent = async () => {
    if (!name.trim()) return alert("Enter Student Name");
    const p = (part: { score: number; total: number }) => (part.total > 0 ? (part.score / part.total) * 100 : 0);
    const payload = { 
      student_name: name, quiz: p(scores.quiz), laboratory: p(scores.lab), 
      assignment: p(scores.assign), attendance: p(scores.atten), major_exam: p(scores.exam) 
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
      <div className="max-w-6xl mx-auto">
        
        <header className="flex justify-between items-center mb-12 bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-blue-400">Academic Portal</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 italic">V4.0 // Secure Terminal</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-black text-white">{records.length}</span>
            <p className="text-[10px] font-black text-blue-500 uppercase">Records Found</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 h-fit">
            <h3 className="text-xs font-black text-blue-400 uppercase mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> {editingId ? 'Modify Entry' : 'New Entry'}
            </h3>
            
            <div className="space-y-6">
              <input 
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all"
                placeholder="Student Full Name" value={name} onChange={(e) => setName(e.target.value)}
              />
              
              <div className="grid grid-cols-1 gap-3">
                {Object.keys(scores).map((k) => (
                  <div key={k} className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black w-12 text-slate-500 uppercase">{k}</span>
                    <input type="number" className="w-full bg-transparent text-right font-black text-white outline-none" 
                      value={scores[k as keyof typeof scores].score}
                      onChange={(e) => setScores({...scores, [k]: {...scores[k as keyof typeof scores], score: Number(e.target.value)}})} />
                    <span className="text-slate-700">/</span>
                    <input type="number" className="w-12 bg-transparent text-center font-bold text-blue-400 outline-none"
                      value={scores[k as keyof typeof scores].total}
                      onChange={(e) => setScores({...scores, [k]: {...scores[k as keyof typeof scores], total: Number(e.target.value)}})} />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={addStudent} className="w-full bg-blue-600 hover:bg-blue-400 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-900/20 transition-all uppercase text-xs tracking-widest">
                  {editingId ? 'Update Data' : 'Execute Sync'}
                </button>
                {editingId && <button onClick={resetForm} className="text-[10px] font-black text-slate-500 uppercase py-2">Cancel Edit</button>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/5">
                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <th className="px-8 py-6">Identity</th>
                  <th className="px-6 py-6 text-center">Score Matrix</th>
                  <th className="px-6 py-6 text-center">Grade</th>
                  <th className="px-8 py-6 text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-8 py-6">
                      <p className="font-bold text-white text-sm uppercase">{r.student_name}</p>
                      <p className="text-[9px] text-blue-500 font-black mt-0.5 tracking-tighter">NODE_{r.id.substring(0,6)}</p>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex justify-center gap-1.5">
                        {(['quiz', 'laboratory', 'assignment'] as const).map(k => (
                          <div key={k} className="bg-slate-900/50 px-2 py-1 rounded-md text-[8px] font-black border border-white/5 uppercase">
                            {k.substring(0,2)}: <span className="text-blue-400">{Number(r[k] || 0).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="text-xl font-black text-blue-400">{Number(r.final_grade || 0).toFixed(1)}%</span>
                    </td>
                    <td className="px-8 py-6 text-right space-x-3">
                      <button onClick={() => handleEdit(r)} className="text-slate-500 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => deleteRecord(r.id)} className="text-slate-500 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}