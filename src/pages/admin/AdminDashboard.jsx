import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Building2, Sliders, Users, Database, Plus, Trash2, 
  ChevronDown, LayoutDashboard, FileCheck, RefreshCw, BarChart3, ShieldAlert
} from 'lucide-react';

export default function AdminDashboard() {
  const [adminTab, setAdminTab] = useState('overview'); // 'overview' | 'ingestion' | 'scrutiny'
  const [token] = useState(() => localStorage.getItem('cet_token') || 'null');
  
  // Quick Dashboard Counters State
  const [stats, setStats] = useState({ totalColleges: 0, activeStudents: 0, pendingDocs: 0 });
  const [syncLoading, setSyncLoading] = useState(false);

  // Ingestion Form State (Data Entry Matrix)
  const [collegeForm, setCollegeForm] = useState({
    collegeCode: '',
    collegeName: '',
    branchName: '',
    city: '',
    status: 'Government Autonomous',
    tierLabel: 'Elite',
    r1: '', r2: '', r3: '', r4: ''
  });

  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Dropdown list targets
  const [citiesList, setCitiesList] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch metrics data on dashboard load
  useEffect(() => {
    // Sync active stats numbers here later via endpoint
    setStats({ totalColleges: 342, activeStudents: 1240, pendingDocs: 48 });
  }, [adminTab]);

  const handleFormChange = (e) => {
    setCollegeForm({ ...collegeForm, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');
    
    // Convert round values to standard cutoffs payload structure
    const roundsPayload = [
      { round: 1, percentile: parseFloat(collegeForm.r1) || 0 },
      { round: 2, percentile: parseFloat(collegeForm.r2) || 0 },
      { round: 3, percentile: parseFloat(collegeForm.r3) || 0 },
      { round: 4, percentile: parseFloat(collegeForm.r4) || 0 }
    ].filter(r => r.percentile > 0);

    try {
      const response = await axios.post('https://mht-cet-backend-uxqs.onrender.com/api/admin/colleges/add', {
        collegeCode: collegeForm.collegeCode,
        collegeName: collegeForm.collegeName,
        branchName: collegeForm.branchName,
        city: collegeForm.city || 'Pune',
        status: collegeForm.status,
        tierLabel: collegeForm.tierLabel,
        rounds: roundsPayload
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        setFormSuccess(`DTE Records compiled successfully for Code: ${collegeForm.collegeCode}`);
        setCollegeForm({
          collegeCode: '', collegeName: '', branchName: '', city: '',
          status: 'Government Autonomous', tierLabel: 'Elite',
          r1: '', r2: '', r3: '', r4: ''
        });
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Database ingestion operation rejected.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#222222] flex font-sans overflow-hidden">
      
      {/* 🧭 LEFT CONTROL MENU: ADMIN CONTROL HUB */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0 hidden lg:flex">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1 py-2 border-b border-slate-100">
            <div className="h-7 w-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-xs text-[#222222] tracking-widest uppercase">Admin Matrix</span>
          </div>
          
          <nav className="space-y-0.5">
            <button onClick={() => setAdminTab('overview')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${adminTab === 'overview' ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
              <LayoutDashboard className="h-4 w-4" /> Cluster Overview
            </button>
            <button onClick={() => setAdminTab('ingestion')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${adminTab === 'ingestion' ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Database className="h-4 w-4" /> DTE Ingestion Hub
            </button>
            <button onClick={() => setAdminTab('scrutiny')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${adminTab === 'scrutiny' ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
              <FileCheck className="h-4 w-4" /> Verification Queue
            </button>
          </nav>
        </div>

        <div className="text-[10px] font-mono font-bold text-slate-400 text-center pt-3 border-t border-slate-100">
          SECURE ADMINISTRATION CORE
        </div>
      </aside>

      {/* 📥 MAIN WORKSPACE LAYER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <h1 className="font-black text-xs text-[#222222] uppercase tracking-widest">
            {adminTab === 'overview' ? "Data System Management Dashboard" : adminTab === 'ingestion' ? "Cutoff Data Pipeline Matrix" : "Identity Audit & Scrutiny Panel"}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold bg-[#00B386]/10 text-[#00B386] border border-[#00B386]/20 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">Database Synchronized</span>
          </div>
        </header>

        <main className="p-6 space-y-6 flex-1">
          
          {/* 📊 QUANTITATIVE METRICS CARDS ROW (Finance platform style look) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Cutoff Rows Loaded</p>
                <h3 className="text-xl font-black text-[#222222] mt-0.5">{stats.totalColleges}</h3>
              </div>
              <Building2 className="h-5 w-5 text-slate-400" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Simulated Sessions</p>
                <h3 className="text-xl font-black text-[#00B386] mt-0.5">{stats.activeStudents}</h3>
              </div>
              <Users className="h-5 w-5 text-slate-400" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Document Claims</p>
                <h3 className="text-xl font-black text-amber-600 mt-0.5">{stats.pendingDocs}</h3>
              </div>
              <FileCheck className="h-5 w-5 text-slate-400" />
            </div>
          </div>

          {/* 🟢 VIEW A: CLUSTER OVERVIEW PANEL */}
          {adminTab === 'overview' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <BarChart3 className="h-4 w-4 text-[#2563EB]" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">System Integration Logs</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Welcome to the administration gateway dashboard layout interface. Select options from the left control node column template shell to ingest runtime datasets parameters directly into the connected production clusters pipeline layer.
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl font-mono text-[11px] text-slate-500 space-y-1">
                <div>[SYSTEM] API Tunnel Secured via Bearer Strategy Headers</div>
                <div>[CLUSTER] Node status tracking verified safely on Render Server</div>
              </div>
            </div>
          )}

          {/* 🟢 VIEW B: DATA INGESTION HUB FORM SCREEN */}
          {adminTab === 'ingestion' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 animate-fadeIn max-w-3xl">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Database className="h-4 w-4 text-[#2563EB]" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">Manual Entry Data Pipeline</h3>
              </div>

              {formSuccess && <div className="p-3 bg-emerald-50 border border-emerald-100 text-[#00B386] rounded-xl text-xs font-mono text-center">{formSuccess}</div>}
              {formError && <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-mono text-center">{formError}</div>}

              <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1.5">DTE Institute Code</label>
                    <input name="collegeCode" type="text" required value={collegeForm.collegeCode} onChange={handleFormChange} placeholder="e.g. 6271" className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563EB]" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1.5">Institute Name</label>
                    <input name="collegeName" type="text" required value={collegeForm.collegeName} onChange={handleFormChange} placeholder="e.g. SCTR's Pune Institute of Computer Technology" className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563EB]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1.5">Engineering Branch / Specialization</label>
                    <input name="branchName" type="text" required value={collegeForm.branchName} onChange={handleFormChange} placeholder="e.g. Computer Engineering" className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563EB]" />
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1.5">District Location Node</label>
                    <input name="city" type="text" required value={collegeForm.city} onChange={handleFormChange} placeholder="e.g. Pune" className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563EB]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1.5">Institute Status</label>
                    <select name="status" value={collegeForm.status} onChange={handleFormChange} className="w-full rounded-xl bg-white border border-slate-200 p-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2563EB]">
                      <option value="Government Autonomous">Government Autonomous</option>
                      <option value="Unaided - Autonomous">Unaided - Autonomous</option>
                      <option value="University Managed">University Managed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1.5">Institutional Tier Sorting</label>
                    <select name="tierLabel" value={collegeForm.tierLabel} onChange={handleFormChange} className="w-full rounded-xl bg-white border border-slate-200 p-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2563EB]">
                      <option value="Elite">Elite Tier (Top 10)</option>
                      <option value="Tier 1">Tier 1 Core</option>
                      <option value="Tier 2">Tier 2 Choice</option>
                    </select>
                  </div>
                </div>

                {/* ROUND-WISE CUTOFF SCALES MATRIX */}
                <div className="border-t border-slate-100 pt-4">
                  <label className="block font-black uppercase tracking-widest text-[#2563EB] mb-3">Round Cutoffs Metrics Entry (GOPENS Baseline)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">ROUND 1 %</label>
                      <input name="r1" type="number" step="0.00001" value={collegeForm.r1} onChange={handleFormChange} placeholder="99.4523" className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563EB]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">ROUND 2 %</label>
                      <input name="r2" type="number" step="0.00001" value={collegeForm.r2} onChange={handleFormChange} placeholder="99.1204" className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563EB]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">ROUND 3 %</label>
                      <input name="r3" type="number" step="0.00001" value={collegeForm.r3} onChange={handleFormChange} placeholder="98.8641" className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563EB]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">ROUND 4 %</label>
                      <input name="r4" type="number" step="0.00001" value={collegeForm.r4} onChange={handleFormChange} placeholder="98.5321" className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563EB]" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full mt-4 py-3 bg-[#00B386] hover:brightness-105 text-white font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#00B386]/10 flex items-center justify-center gap-2 select-none active:scale-98 cursor-pointer">
                  <Plus className="h-4 w-4" /> Inject Into Database Stack
                </button>
              </form>
            </div>
          )}

          {/* 🟢 VIEW C: VERIFICATION QUEUE SCRUTINY */}
          {adminTab === 'scrutiny' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileCheck className="h-4 w-4 text-[#2563EB]" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">Live Scrutiny Queue</h3>
              </div>
              
              {/* Standalone Empty Tab Queue Table Blueprint layout */}
              <div className="border border-slate-100 rounded-xl overflow-hidden shadow-inner">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="p-3.5">Cadet Student Name</th>
                      <th className="p-3.5">MHT-CET %</th>
                      <th className="p-3.5">Quota Claim</th>
                      <th className="p-3.5 text-center">Tracking Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    <tr className="hover:bg-slate-50/50 transition-all">
                      <td className="p-3.5 font-bold text-[#222222]">Sohan Mehar</td>
                      <td className="p-3.5 font-mono text-[#2563EB]">99.1725</td>
                      <td className="p-3.5"><span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100 font-mono text-[10px]">OBC</span></td>
                      <td className="p-3.5 text-center"><button className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg font-bold text-[11px] transition-all cursor-pointer text-slate-600">Audit Profile</button></td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-all">
                      <td className="p-3.5 font-bold text-[#222222]">Amit Deshmukh</td>
                      <td className="p-3.5 font-mono text-[#2563EB]">95.4831</td>
                      <td className="p-3.5"><span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px]">GOPENS</span></td>
                      <td className="p-3.5 text-center"><button className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg font-bold text-[11px] transition-all cursor-pointer text-slate-600">Audit Profile</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}