"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; 

interface StudentRecord {
  id: string; 
  student_name: string; 
  quiz: number; 
  laboratory: number; 
  assignment: number; 
  attendance: number; 
  major_exam: number;
}

export default function Home() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  
  // Explicitly set scores to empty strings for better UX
  const [scores, setScores] = useState<any>({
    quiz: { score: '', total: 100 },
    lab: { score: '', total: 100 },
    assign: { score: '', total: 100 },
    atten: { score: '', total: 100 },
    exam: { score: '', total: 100 },
  });
  
  const [records, setRecords] = useState<StudentRecord[]>([]);

  const fetchRecords = useCallback(async () => {
    const { data } = await supabase
      .from('student4_grades')
      .select('*')
      .order('created_at', { ascending: false });
    setRecords((data as StudentRecord[]) || []);
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const resetForm = () => {
    setName(''); 
    setEditingId(null);
    setScores({
      quiz: { score: '', total: 100 }, 
      lab: { score: '', total: 100 },
      assign: { score: '', total: 100 }, 
      atten: { score: '', total: 100 }, 
      exam: { score: '', total: 100 },
    });
  };

  const addStudent = async () => {
    if (!name.trim()) return alert("Enter Student Name");
    const p = (part: any) => (part.total > 0 ? (Number(part.score || 0) / part.total) * 100 : 0);
    
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

    resetForm(); 
    fetchRecords();
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-12 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER - INCREASED BORDER THICKNESS */}
        <header className="flex justify-between items-center mb-8 bg-white p-8 rounded-2xl border-2 border-slate-300 shadow-md">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">BSIT Student Grading System</h1>
            <p className="text-xs font-black text-blue-600 uppercase mt-1 tracking-widest">Active: Student 4 Database</p>
          </div>
          <div className="bg-slate-900 px-8 py-4 rounded-xl border-b-4 border-blue-600">
            <span className="text-4xl font-black text-white">{records.length}</span>
            <span className="text-xs font-bold text-slate-400 uppercase ml-3 tracking-widest">Units</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* INPUT SECTION - ENHANCED VISIBILITY */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-8 border-2 border-slate-300 h-fit sticky top-8 shadow-md">
            <h3 className="text-sm font-black text-slate-900 uppercase mb-8 pb-4 border-b-2 border-slate-100 flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></span>
              {editingId ? 'Modify Record' : 'Create Entry'}
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-slate-600 uppercase mb-2 block">Full Student Name</label>
                <input 
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-4 text-base font-black text-slate-900 focus:border-blue-600 outline-none transition-all"
                  placeholder="" // Placeholder is now completely empty
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-600 uppercase block">Raw Scores (Empty = 0)</label>
                {Object.keys(scores).map((k) => (
                  <div key={k} className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border-2 border-slate-200 focus-within:border-blue-500 transition-colors">
                    <span className="text-[10px] font-black w-14 text-slate-900 uppercase">{k === 'assign' ? 'Asgn' : k === 'atten' ? 'Attn' : k}</span>
                    <input 
                      type="number" 
                      className="w-full bg-transparent text-right font-black text-blue-700 text-xl outline-none" 
                      placeholder="--" 
                      value={scores[k].score}
                      onChange={(e) => setScores({...scores, [k]: {...scores[k], score: e.target.value}})} 
                    />
                    <span className="text-slate-400 font-bold text-xl">/</span>
                    <input 
                      type="number" 
                      className="w-16 bg-white border border-slate-200 p-2 rounded text-center text-sm font-black text-slate-600 outline-none" 
                      value={scores[k].total}
                      onChange={(e) => setScores({...scores, [k]: {...scores[k], total: e.target.value}})} 
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button onClick={addStudent} className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-5 rounded-xl transition-all uppercase text-sm tracking-widest shadow-xl active:scale-95">
                  {editingId ? 'Update System' : 'Add Student and Grades'}
                </button>
                {editingId && (
                  <button onClick={resetForm} className="w-full mt-4 text-xs font-black text-red-500 hover:underline uppercase transition-colors">Cancel Session</button>
                )}
              </div>
            </div>
          </div>

          {/* TABLE SECTION - HIGH CONTRAST */}
          <div className="lg:col-span-8 bg-white rounded-2xl border-2 border-slate-300 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[850px]">
                <thead className="bg-slate-900 border-b-2 border-slate-300">
                  <tr className="text-xs font-black text-slate-300 uppercase tracking-widest">
                    <th className="px-8 py-6">Validated Student</th>
                    <th className="px-6 py-6 text-center">Score Matrix</th>
                    <th className="px-6 py-6 text-center">Grade</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 text-slate-700">
                  {records.map((r) => {
                    const avg = (Number(r.quiz||0) * 0.20) + 
                                (Number(r.laboratory||0) * 0.30) + 
                                (Number(r.assignment||0) * 0.10) + 
                                (Number(r.attendance||0) * 0.10) + 
                                (Number(r.major_exam||0) * 0.30);
                    return (
                      <tr key={r.id} className="hover:bg-blue-50/50 transition-all font-bold">
                        <td className="px-8 py-6">
                          <p className="font-black text-slate-900 text-base uppercase">{r.student_name}</p>
                          <span className="text-[10px] text-blue-600 font-black uppercase tracking-tighter mt-1 block">Student_ID: {r.id.substring(0,8)}</span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex justify-center gap-1.5">
                            {(['quiz', 'laboratory', 'assignment', 'attendance', 'major_exam'] as const).map(k => (
                              <div key={k} className="bg-white w-12 py-3 rounded-lg text-center border-2 border-slate-200">
                                <p className="text-[8px] text-slate-400 font-black uppercase">{k.substring(0,3)}</p>
                                <p className="text-slate-900 text-xs font-black">{Number(r[k] || 0).toFixed(0)}</p>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <div className="inline-block bg-blue-600 px-6 py-3 rounded-xl shadow-lg">
                            <span className="text-2xl font-black text-white">
                              {avg.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-3">
                            <button onClick={() => handleEdit(r)} className="p-3 bg-slate-100 border-2 border-slate-200 rounded-xl hover:bg-slate-900 hover:text-white transition-all text-slate-600">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            </button>
                            <button onClick={() => deleteRecord(r.id)} className="p-3 bg-slate-100 border-2 border-slate-200 rounded-xl hover:bg-red-600 hover:text-white transition-all text-slate-600">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}