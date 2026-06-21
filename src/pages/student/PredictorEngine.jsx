import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Search, Sliders, GraduationCap, Building2, MapPin, Award, 
  CheckCircle2, HelpCircle, AlertTriangle, Plus, Trash2, 
  Download, ListOrdered, ChevronUp, ChevronDown, 
  Menu, X, BarChart3, LayoutDashboard, FileCheck, Info, BookOpen
} from 'lucide-react';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

class LocalErrorGuard extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, errorLog: '' }; }
  static getDerivedStateFromError(error) { return { hasError: true, errorLog: error.toString() }; }
  componentDidCatch(error, info) { console.error("Crash captured:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center font-mono">
          <div className="max-w-xl w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 font-bold text-lg border-b border-slate-800 pb-3">
              <AlertTriangle className="h-6 w-6" /> Portal Layout Intercepted
            </div>
            <p className="text-xs text-slate-400">Runtime tracking recovered safely.</p>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer">Reset Session Layer</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainPredictorWorkspace() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeWindow, setActiveWindow] = useState(() => localStorage.getItem('cet_active_window') || 'predictor');

  const [query, setQuery] = useState({ percentile: '', category: 'GOPENS' });
  const [selectedCities, setSelectedCities] = useState(["ALL"]);
  const [selectedBranches, setSelectedBranches] = useState(["ALL"]);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  
  const cityRef = useRef(null);
  const branchRef = useRef(null);

  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [branchesList, setBranchesList] = useState([]); 
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedTrendId, setExpandedTrendId] = useState(null);
  const [activeTab, setActiveTab] = useState('match');

  const [directorySearch, setDirectorySearch] = useState('');
  const [allColleges, setAllColleges] = useState([]);         
  const [filteredColleges, setFilteredColleges] = useState([]); 
  const [dirLoading, setDirLoading] = useState(false);
  const [expandedCollegeId, setExpandedCollegeId] = useState(null);

  const [docCategory, setDocCategory] = useState('OPEN');
  const [checkedDocs, setCheckedDocs] = useState(() => JSON.parse(localStorage.getItem('cet_checked_docs') || '{}'));
  const [preferenceList, setPreferenceList] = useState(() => JSON.parse(localStorage.getItem('cet_pref_list') || '[]'));
  const [categories, setCategories] = useState([]);

  const documentDatabase = {
    COMMON: [
      { id: 'com_1', name: 'MHT-CET Score Card (2025/2026)', desc: 'Official printout downloaded from State CET Cell portal.' },
      { id: 'com_2', name: 'MHT-CET Admit Card', desc: 'Hall ticket used during the examination center verification.' },
      { id: 'com_3', name: 'HSC (Class 12th) Marksheet', desc: 'Passing certificate copy issued by board.' },
      { id: 'com_4', name: 'SSC (Class 10th) Marksheet', desc: 'Proof of Date of Birth verification baseline.' },
      { id: 'com_5', name: 'School / College Leaving Certificate (LC)', desc: 'Required for nationality and domicile tracking verification.' },
      { id: 'com_6', name: 'Domicile Certificate / Nationality Proof', desc: 'Mandatory certificate showing Candidate belongs to Maharashtra state.' }
    ],
    OBC: [
      { id: 'obc_1', name: 'Caste Certificate', desc: 'Issued by Competent Authority of Maharashtra State.' },
      { id: 'obc_2', name: 'Caste Validity Certificate', desc: 'Mandatory scrutiny committee validation document.' },
      { id: 'obc_3', name: 'Non-Creamy Layer Certificate (NCL)', desc: 'Must be valid up to 31st March of current financial year.' }
    ],
    EWS: [{ id: 'ews_1', name: 'Eligibility Certificate for EWS', desc: 'Proforma-V issued by competent revenue authority (Tahsildar).' }],
    SC_ST: [
      { id: 'sc_1', name: 'Caste Certificate', desc: 'Issued by Competent Sub-Divisional Officer/Magistrate.' },
      { id: 'sc_2', name: 'Caste/Tribe Validity Certificate', desc: 'Mandatory document for locking institutional seat category reservation.' }
    ],
    TFWS: [{ id: 'tfws_1', name: 'Income Certificate (Family < 8 Lakhs)', desc: 'Issued by Tahsildar explicitly mentioning financial year metrics.' }],
    PWD: [{ id: 'pwd_1', name: 'Disability Certificate (Proforma-F/F-1)', desc: 'Issued by Authorized Medical Board/Civil Surgeon with minimum 40% disability assessment.' }],
    DEFENCE: [{ id: 'def_1', name: 'Defence Service Certificate (Proforma-C/D/E)', desc: 'Ex-Servicemen Certificate/Active Service Certificate issued by Zilla Sainik Welfare Office.' }]
  };

  const getRequiredDocuments = () => {
    let list = [...(documentDatabase.COMMON || [])];
    const cleanDocCat = String(docCategory || '').toUpperCase();
    if (cleanDocCat.includes('OBC') || cleanDocCat.includes('BC')) { list = [...list, ...(documentDatabase.OBC || [])]; }  
    if (cleanDocCat.includes('EWS')) { list = [...list, ...(documentDatabase.EWS || [])]; }   
    if (cleanDocCat.includes('SC') || cleanDocCat.includes('ST')) { list = [...list, ...(documentDatabase.SC_ST || [])]; }
    if (cleanDocCat.includes('TFWS')) { list = [...list, ...(documentDatabase.TFWS || [])]; }
    if (cleanDocCat.includes('PWD')) { list = [...list, ...(documentDatabase.PWD || [])]; }
    if (cleanDocCat.includes('DEF')) { list = [...list, ...(documentDatabase.DEFENCE || [])]; }
    return list;
  };

  useEffect(() => { localStorage.setItem('cet_active_window', activeWindow); }, [activeWindow]);

  useEffect(() => {
      const syncDatabaseDropdowns = async () => {
        setDirLoading(true);
        setError('');
        try {
          const [distRes, branchRes, dirRes, catRes] = await Promise.all([
            axios.get('http://localhost:5000/api/districts'),
            axios.get('http://localhost:5000/api/branches'),
            axios.get('http://localhost:5000/api/colleges-directory'),
            axios.get('http://localhost:5000/api/categories')
          ]);

          if (distRes.data?.success) setDistricts(distRes.data.data);
          if (branchRes.data?.success) setBranchesList(branchRes.data.data);
          if (catRes.data?.success) {
              setCategories(catRes.data.data);
              if (!query.category && catRes.data.data.length > 0) {
                  setQuery(prev => ({ ...prev, category: catRes.data.data[0] }));
              }
          }
          if (dirRes.data?.success) {
            setAllColleges(dirRes.data.data);
            setFilteredColleges(dirRes.data.data);
          }
        } catch (err) {
          console.error("Sync error:", err);
          setError('Network synchronization connection drop detected.');
        } finally { setDirLoading(false); }
      };
      syncDatabaseDropdowns();
  }, [activeWindow]);

  const handleDirectorySearchChange = (e) => {
    const value = e.target.value;
    setDirectorySearch(value);
    if (value.trim() === '') { setFilteredColleges(allColleges); return; }
    const search = value.trim().toLowerCase();
    const computed = allColleges.filter(c => 
      c?.collegeName?.toLowerCase().includes(search) || 
      String(c?.collegeCode || '').toLowerCase().includes(search)
    );
    setFilteredColleges(computed);
  };

  const toggleCollegeCollapse = (code) => { setExpandedCollegeId(expandedCollegeId === code ? null : code); };

  useEffect(() => {
    function handleClickOutside(event) {
      if (cityRef.current && !cityRef.current.contains(event.target)) setIsCityOpen(false);
      if (branchRef.current && !branchRef.current.contains(event.target)) setIsBranchOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { localStorage.setItem('cet_pref_list', JSON.stringify(preferenceList || [])); }, [preferenceList]);
  useEffect(() => { localStorage.setItem('cet_checked_docs', JSON.stringify(checkedDocs || {})); }, [checkedDocs]);

  const handleCityToggle = (cityCode) => {
    if (cityCode === "ALL") { setSelectedCities(["ALL"]); } else {
      let updated = (selectedCities || []).filter(c => c !== "ALL");
      if (updated.includes(cityCode)) { updated = updated.filter(c => c !== cityCode); if (updated.length === 0) updated = ["ALL"]; } else { updated.push(cityCode); }
      setSelectedCities(updated);
    }
  };

  const handleBranchToggle = (branchName) => {
    if (branchName === "ALL") { setSelectedBranches(["ALL"]); } else {
      let updated = (selectedBranches || []).filter(b => b !== "ALL");
      if (updated.includes(branchName)) { updated = updated.filter(b => b !== branchName); if (updated.length === 0) updated = ["ALL"]; } else { updated.push(branchName); }
      setSelectedBranches(updated);
    }
  };

  const handleInputChange = (e) => { setQuery({ ...query, [e.target.name]: e.target.value }); };
  
  const executePrediction = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const payload = { ...query, city: selectedCities, branch: selectedBranches };
      const response = await axios.post('http://localhost:5000/api/predict', payload);
      if (response.data?.success && Array.isArray(response.data.data)) setResults(response.data.data);
    } catch (err) { setError('Predictor connection connection offline.'); } finally { setLoading(false); }
  };

  const addToPreference = (item) => { const isAlreadyAdded = (preferenceList || []).some(p => p?.branchCode === item?.branchCode); if (!isAlreadyAdded) setPreferenceList([...preferenceList, item]); };
  const removeFromPreference = (branchCode) => { setPreferenceList((preferenceList || []).filter(p => p?.branchCode !== branchCode)); };
  const movePreferenceUp = (index) => { if (index === 0) return; const updatedList = [...preferenceList]; const temp = updatedList[index]; updatedList[index] = updatedList[index - 1]; updatedList[index - 1] = temp; setPreferenceList(updatedList); };
  const movePreferenceDown = (index) => { if (index === (preferenceList || []).length - 1) return; const updatedList = [...preferenceList]; const temp = updatedList[index]; updatedList[index] = updatedList[index + 1]; updatedList[index + 1] = temp; setPreferenceList(updatedList); };
  const toggleTrendGraph = (id) => { setExpandedTrendId(expandedTrendId === id ? null : id); };
  const toggleDocumentCheck = (docId) => { setCheckedDocs(prev => ({ ...prev, [docId]: !prev[docId] })); };

  const triggerMockSimulation = async () => {
    if (!query.percentile) {
      alert("Please input your percentile in parameters first to run simulator!");
      return;
    }
    setSimLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/predict/simulate-mock', {
        percentile: query.percentile,
        category: query.category,
        preferences: preferenceList
      });
      if (response.data?.success) { setSimResult(response.data.data); }
    } catch (err) {
      console.error("Simulation frontend handler failed:", err);
    } finally { setSimLoading(false); }
  };

  const exportPreferenceListToPDF = () => {
    const doc = new jsPDF();
    doc.text("MHT-CET Custom Option Form Preferences", 14, 15);
    const tableRows = preferenceList.map((item, idx) => [idx + 1, item.collegeCode, item.collegeName, item.branchName, item.city]);
    autoTable(doc, { head: [['#', 'DTE Code', 'College Institute Name', 'Engineering Branch Stream', 'District']], body: tableRows, startY: 22 });
    doc.save("MHT-CET-Option-Form.pdf");
  };

  const getChanceBadge = (type) => {
    switch (type) {
      case 'SAFE':
        return ( <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="h-3.5 w-3.5" />SAFE</span> );
      case 'MATCH':
        return ( <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-bold text-indigo-400 border border-indigo-500/20"><HelpCircle className="h-3.5 w-3.5" />MATCH</span> );
      default:
        return ( <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/20"><AlertTriangle className="h-3.5 w-3.5" />REACH</span> );
    }
  };

  const matchColleges = results.filter(item => item?.recommendationType === 'MATCH').slice(0,50);
  const safeColleges = results.filter(item => item?.recommendationType === 'SAFE').slice(0,50);
  const dreamColleges = results.filter(item => item?.recommendationType === 'REACH').slice(0,50);
  const displayList = activeTab === 'dream' ? dreamColleges : activeTab === 'safe' ? safeColleges : matchColleges;
  const getRoundCutoff = (rounds, roundNum) => { const found = (rounds || []).find(r => String(r?.round) === String(roundNum)); return found ? found.percentile.toFixed(4) : 'N/A'; };
  
  const currentDocsList = getRequiredDocuments() || [];
  const checkedCount = currentDocsList.filter(d => d && checkedDocs[d?.id]).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans overflow-hidden">
      
      {/* 📱 MOBILE NAVIGATION SLIDEOVER PANEL OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR CONTAINER - MOBILE AND DESKTOP COMPATIBLE */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:h-screen ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col justify-between p-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-indigo-400"><GraduationCap className="h-7 w-7" /><span className="font-extrabold text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">MHT-CET Suite</span></div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 p-1 rounded-md hover:bg-slate-800 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <nav className="space-y-1.5">
              <button onClick={() => { setActiveWindow('predictor'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeWindow === 'predictor' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}><LayoutDashboard className="h-4 w-4" /> Core Predictor Engine</button>
              
              <button onClick={() => { setActiveWindow('simulator'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeWindow === 'simulator' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
                <div className="flex items-center gap-3">
                  <ListOrdered className="h-4 w-4" /> 
                  <span>CAP Choice Simulator</span>
                </div>
                {preferenceList.length > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeWindow === 'simulator' ? 'bg-white text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'}`}>{preferenceList.length}</span>
                )}
              </button>

              <button onClick={() => { setActiveWindow('directory'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeWindow === 'directory' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}><BookOpen className="h-4 w-4" /> College & Branch List</button>
              <button onClick={() => { setActiveWindow('documents'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeWindow === 'documents' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}><FileCheck className="h-4 w-4" /> CAP Document Tracker</button>
            </nav>
          </div>
          <div className="text-[10px] font-mono text-slate-600 text-center pt-3 border-t border-slate-800/60">v4.4 Premium Stable</div>
        </div>
      </aside>

      {/* MAIN LAYOUT WRAPPER LAYER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md px-4 sm:px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-slate-300 p-1.5 rounded-xl bg-slate-900 border border-slate-800/80 hover:bg-slate-800 cursor-pointer shrink-0"><Menu className="h-5 w-5" /></button>
            <h1 className="font-extrabold text-sm sm:text-lg text-white uppercase tracking-wider truncate">
              {activeWindow === 'predictor' ? "Choice Matrix Workplace" : activeWindow === 'simulator' ? "CAP Preference Choice Simulator" : activeWindow === 'directory' ? "DTE Institute Directory" : "DTE Scrutiny Checklist Center"}
            </h1>
          </div>
          <span className="text-[10px] sm:text-[11px] font-mono bg-slate-900 text-slate-400 border border-slate-800 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shrink-0">CAP Live</span>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {error && <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-xs text-center">{error}</div>}

          {/* 💎 WINDOW ONE: CORE PREDICTOR INTERFACE */}
          {activeWindow === 'predictor' && (
            <div className="space-y-6 sm:space-y-8 animate-fadeIn">
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-2 text-indigo-400 mb-4"><Sliders className="h-5 w-5" /><h2 className="font-bold text-base sm:text-lg text-white">Configure Search Parameters</h2></div>
                
                {/* 📱 RESPONSIVE CONFIG PARAMETERS BOX STRIPS FOR PHONE FIELDS */}
                <form onSubmit={executePrediction} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">My Percentile</label>
                    <input name="percentile" type="number" step="0.0000001" required min="0" max="100" value={query.percentile} onChange={handleInputChange} placeholder="e.g. 95.4837" className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Seat Category</label>
                    <select name="category" value={query.category} onChange={handleInputChange} className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer">{categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select>
                  </div>
                  <div className="relative" ref={cityRef}>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Preferred Location</label>
                    <div onClick={() => setIsCityOpen(!isCityOpen)} className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer flex items-center justify-between select-none">
                      <span className="truncate pr-2 font-bold text-indigo-400">{selectedCities.includes("ALL") ? "All Districts (MS)" : `${selectedCities.length} Selected`}</span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isCityOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isCityOpen && (
                      <div className="absolute left-0 mt-2 w-full max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl p-2 z-50 shadow-2xl space-y-1 scrollbar-thin">
                        <div onClick={() => handleCityToggle("ALL")} className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs font-bold transition-all ${selectedCities.includes("ALL") ? 'bg-indigo-600/20 text-indigo-400' : 'hover:bg-slate-800 text-slate-300'}`}>
                          <div className={`h-4 w-4 rounded flex items-center justify-center border ${selectedCities.includes("ALL") ? 'bg-indigo-600 border-indigo-400' : 'border-slate-600'}`}>{selectedCities.includes("ALL") && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}</div>All Districts (MS)
                        </div>
                        {districts.map((dist) => {
                          const isChecked = selectedCities.includes(dist);
                          return (
                            <div key={dist} onClick={() => handleCityToggle(dist)} className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs font-medium transition-all ${isChecked ? 'bg-indigo-600/20 text-indigo-400' : 'hover:bg-slate-800 text-slate-300'}`}>
                              <div className={`h-4 w-4 rounded flex items-center justify-center border ${isChecked ? 'bg-indigo-600 border-indigo-400' : 'border-slate-600'}`}>{isChecked && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}</div>{dist}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="relative" ref={branchRef}>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Preferred Branches</label>
                    <div onClick={() => setIsBranchOpen(!isBranchOpen)} className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer flex items-center justify-between select-none">
                      <span className="truncate pr-2 font-bold text-indigo-400">{selectedBranches.includes("ALL") ? "All Specializations" : `${selectedBranches.length} Selected`}</span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isBranchOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isBranchOpen && (
                      <div className="absolute right-0 lg:left-0 mt-2 w-64 lg:w-72 max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl p-2 z-50 shadow-2xl space-y-1 scrollbar-thin">
                        <div onClick={() => handleBranchToggle("ALL")} className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs font-bold transition-all ${selectedBranches.includes("ALL") ? 'bg-indigo-600/20 text-indigo-400' : 'hover:bg-slate-800 text-slate-300'}`}>
                          <div className={`h-4 w-4 rounded flex items-center justify-center border ${selectedBranches.includes("ALL") ? 'bg-indigo-600 border-indigo-400' : 'border-slate-600'}`}>{selectedBranches.includes("ALL") && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}</div>All Specializations
                        </div>
                        {branchesList.map((branchName) => {
                          const isChecked = selectedBranches.includes(branchName);
                          return (
                            <div key={branchName} onClick={() => handleBranchToggle(branchName)} className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs font-medium transition-all ${isChecked ? 'bg-indigo-600/20 text-indigo-400' : 'hover:bg-slate-800 text-slate-300'}`}>
                              <div className={`h-4 w-4 rounded flex items-center justify-center border ${isChecked ? 'bg-indigo-600 border-indigo-400' : 'border-slate-600'}`}>{isChecked && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}</div><span className="truncate">{branchName}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <button type="submit" className="w-full py-3 px-4 rounded-lg text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"><Search className="h-4 w-4" /> {loading ? "Calculating..." : "Find Options"}</button>
                </form>
              </div>

              <div className="space-y-4">
                {/* 📱 HORIZONTAL SCROLL CHIPS FOR ACTIVE TABS ON MOBILE VIEW */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
                  <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight">Predicted Adjustments</h3>
                  <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-1 text-[11px] overflow-x-auto whitespace-nowrap max-w-full scrollbar-none">
                    <button onClick={() => setActiveTab('match')} className={`px-2.5 py-1.5 font-bold rounded-md transition-all cursor-pointer ${activeTab === 'match' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}>Best Matches ({matchColleges.length})</button>
                    <button onClick={() => setActiveTab('safe')} className={`px-2.5 py-1.5 font-bold rounded-md transition-all cursor-pointer ${activeTab === 'safe' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400'}`}>Safe Bets ({safeColleges.length})</button>
                    <button onClick={() => setActiveTab('dream')} className={`px-2.5 py-1.5 font-bold rounded-md transition-all cursor-pointer ${activeTab === 'dream' ? 'bg-rose-600 text-white shadow' : 'text-slate-400'}`}>Ambitious ({dreamColleges.length})</button>
                  </div>
                </div>

                {/* 📱 PERFECT GRID RESPONSIVENESS MATRIX PAR COLLAPSE CHANNELS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayList.map((item, index) => {
                    const uniqueRoundsMap = {};
                    (item.rounds || []).forEach(r => {
                      const roundNum = String(r.round);
                      const currentPercentile = parseFloat(r.percentile || 0);
                      if (!uniqueRoundsMap[roundNum] || currentPercentile > uniqueRoundsMap[roundNum]) {
                        uniqueRoundsMap[roundNum] = currentPercentile;
                      }
                    });
                    const graphData = Object.keys(uniqueRoundsMap)
                      .sort((a, b) => Number(a) - Number(b))
                      .map(roundNum => ({
                        round: `R${roundNum}`,
                        cutoff: uniqueRoundsMap[roundNum]
                      }));
                    return (
                      <div key={index} className="bg-slate-900/30 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all relative shadow-lg">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <span className="text-[10px] font-mono bg-slate-800 text-indigo-400 px-2 py-0.5 rounded border border-slate-700">Code: {item.collegeCode}</span>
                            {getChanceBadge(item.recommendationType)}
                          </div>
                          <h4 className="font-bold text-sm sm:text-base text-white line-clamp-2 leading-snug">{item.collegeName}</h4>
                        </div>

                        {/* 📈 4 COLUMNS CELL SYSTEM FLEXES PROPERLY */}
                        <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800 grid grid-cols-4 gap-0.5 text-center font-mono text-[10px] sm:text-[11px]">
                          <div className="border-r border-slate-800/80">
                            <div className="text-[9px] text-slate-500 font-bold">R1</div>
                            <div className="text-slate-300 font-bold mt-0.5 truncate">{getRoundCutoff(item.rounds, 1)}</div>
                          </div>
                          <div className="border-r border-slate-800/80">
                            <div className="text-[9px] text-slate-500 font-bold">R2</div>
                            <div className="text-slate-300 font-bold mt-0.5 truncate">{getRoundCutoff(item.rounds, 2)}</div>
                          </div>
                          <div className="border-r border-slate-800/80">
                            <div className="text-[9px] text-slate-500 font-bold">R3</div>
                            <div className="text-slate-300 font-bold mt-0.5 truncate">{getRoundCutoff(item.rounds, 3)}</div>
                          </div>
                          <div>
                            <div className="text-[9px] text-indigo-400 font-bold">R4</div>
                            <div className="text-indigo-400 font-bold mt-0.5 truncate">{getRoundCutoff(item.rounds, 4)}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 font-medium">
                          <div className="flex items-center gap-1.5 text-slate-300 col-span-2"><Award className="h-3.5 w-3.5 text-indigo-400 shrink-0" /><span className="line-clamp-1">{item.branchName}</span></div>
                          <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" /><span className="truncate">{item.city}</span></div>
                          <div className="flex items-center gap-1.5 justify-end"><Building2 className="h-3.5 w-3.5 text-slate-500 shrink-0" /><span className="truncate">{item.status}</span></div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/40">
                          <span className="text-[10px] font-mono text-slate-500">Tier: {item.tierLabel || 'Good'}</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleTrendGraph(`${activeTab}-${index}`)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1.5 rounded-lg text-xs flex items-center gap-1 font-bold cursor-pointer"><BarChart3 className="h-3.5 w-3.5 text-indigo-400" /> Trend</button>
                            <button onClick={() => addToPreference(item)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-lg transition-all shadow-md cursor-pointer"><Plus className="h-4 w-4" /></button>
                          </div>
                        </div>

                        {expandedTrendId === `${activeTab}-${index}` && (
                          <div className="mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl">
                            <div className="h-32 w-full font-mono text-[10px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={graphData} margin={{ left: -5, right: 15, top: 10, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                  <XAxis dataKey="round" stroke="#64748b" />
                                  <YAxis type="number" domain={['dataMin - 0.2', 'dataMax + 0.2']} stroke="#64748b" width={48} tickFormatter={(value) => { if (typeof value === 'number') { return value.toFixed(1); } return value; }} />
                                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                                  <Line type="monotone" dataKey="cutoff" stroke="#6366f1" strokeWidth={2} name="Cutoff" dot={{ r: 3 }} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 💎 WINDOW TWO: SIMULATOR VIEW (MOBILE ADJUSTED INTERACTIVE BARS) */}
          {activeWindow === 'simulator' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-sm shadow-xl flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-indigo-400"><ListOrdered className="h-5 w-5" /><h2 className="font-bold text-base sm:text-lg text-white">CAP Option Form Simulator</h2></div>
                  <p className="text-xs text-slate-400 font-medium">Arrange preferences and execute mock allotment algorithm iterations.</p>
                </div>
                
                {/* Responsive horizontal parameters tray for widgets row elements */}
                <div className="flex flex-row items-center gap-3 bg-slate-950/60 p-2 sm:p-2.5 rounded-xl border border-slate-800/80 max-w-fit">
                  <div className="w-20 sm:w-24">
                    <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-500 mb-1">Percentile</label>
                    <input name="percentile" type="number" step="0.0000001" min="0" max="100" value={query.percentile} onChange={handleInputChange} placeholder="e.g. 98.5" className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono" />
                  </div>
                  <div className="w-24 sm:w-28">
                    <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-500 mb-1">Category</label>
                    <select name="category" value={query.category} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer">{categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select>
                  </div>
                </div>

                {preferenceList.length > 0 && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={triggerMockSimulation} className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer">{simLoading ? "Simulating..." : "⚡ SIMULATE"}</button>
                    <button onClick={exportPreferenceListToPDF} className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"><Download className="h-4 w-4 text-emerald-400" /> Export PDF</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                {preferenceList.length === 0 ? (
                  <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center text-slate-500 text-sm font-medium space-y-3">
                    <p>Your Option Form is currently empty.</p>
                    <button onClick={() => setActiveWindow('predictor')} className="text-xs px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-xl font-bold transition-all cursor-pointer">Go to Core Predictor & Add Colleges</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {preferenceList.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-900/30 border border-slate-800 rounded-xl gap-3 shadow-sm">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-xs font-bold font-mono text-emerald-400 shadow-inner">#{index + 1}</div>
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono"><span className="text-indigo-400 font-bold truncate">Code: {item.collegeCode}</span><span className="text-slate-500 hidden sm:inline">| {item.city}</span></div>
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate">{item.collegeName}</h4>
                            <p className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1"><Award className="h-3 w-3 text-indigo-500 shrink-0" /> {item.branchName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="flex flex-col">
                            <button disabled={index === 0} onClick={() => movePreferenceUp(index)} className="p-0.5 text-slate-500 hover:text-indigo-400 disabled:opacity-10 cursor-pointer"><ChevronUp className="h-4 w-4" /></button>
                            <button disabled={index === preferenceList.length - 1} onClick={() => movePreferenceDown(index)} className="p-0.5 text-slate-500 hover:text-indigo-400 disabled:opacity-10 cursor-pointer"><ChevronDown className="h-4 w-4" /></button>
                          </div>
                          <button onClick={() => removeFromPreference(item.branchCode)} className="p-2 bg-slate-950 border border-slate-800/80 text-slate-400 hover:text-rose-400 rounded-xl cursor-pointer transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {simResult && (
                  <div className="p-4 sm:p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 animate-fadeIn flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs sm:text-sm uppercase tracking-wider"><CheckCircle2 className="h-4 w-4" /> Seat Allocated Successfully</div>
                      <h3 className="font-black text-white text-sm sm:text-base pt-0.5">Choice #{simResult.preferenceNumber}: {simResult.collegeName}</h3>
                      <p className="text-xs sm:text-sm text-indigo-300 font-bold">{simResult.branchName}</p>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800/60 p-3 rounded-xl font-mono text-[11px] text-slate-400 space-y-1 text-center sm:text-right shadow-inner w-full sm:w-auto shrink-0">
                      <div>Round Match: <span className="text-white font-bold">{simResult.round}</span></div>
                      <div>Cutoff: <span className="text-indigo-400 font-bold">{simResult.cutoffMatched.toFixed(4)}</span></div>
                    </div>
                  </div>
                )}

                {simResult === null && !simLoading && preferenceList.length > 0 && results.length > 0 && (
                  <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm animate-fadeIn">
                    <AlertTriangle className="h-4 w-4 shrink-0" /> No Allotment Secured. Add more "Safe Bet" choices below your list!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 💎 WINDOW THREE: DIRECTORY LIST VIEW */}
          {activeWindow === 'directory' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-indigo-400"><BookOpen className="h-5 w-5" /><h2 className="font-bold text-base sm:text-lg text-white">Search Institutional Structure</h2></div>
                <div className="relative">
                  <input type="text" value={directorySearch} onChange={handleDirectorySearchChange} placeholder="Search by College Name or DTE Code..." className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-11 p-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" />
                  <Search className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                </div>
              </div>

              {dirLoading && <div className="text-center py-12 text-sm font-mono text-slate-500">Mapping Rows Directly From Database Layer...</div>}

              <div className="grid grid-cols-1 gap-4">
                {Array.isArray(filteredColleges) && filteredColleges.map((college, idx) => {
                  const isExpanded = expandedCollegeId === college?.collegeCode;
                  return (
                    <div key={idx} className="bg-slate-900/20 border border-slate-800 rounded-xl p-4 sm:p-5 hover:border-slate-700/80 transition-all space-y-4 shadow-md">
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono bg-slate-800 text-indigo-400 border border-slate-700 px-2 py-0.5 rounded">Code: {college?.collegeCode}</span>
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800/80 text-[9px] uppercase tracking-wide font-bold text-slate-400 truncate">{college?.status}</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1 truncate"><MapPin className="h-3 w-3" /> {college?.city}</span>
                          </div>
                          <h3 className="font-bold text-sm sm:text-base text-white pt-1 truncate">{college?.collegeName}</h3>
                        </div>
                        <button type="button" onClick={() => toggleCollegeCollapse(college?.collegeCode)} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 transition-all cursor-pointer"><ChevronDown className={`h-4 w-4 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} /></button>
                      </div>
                      {isExpanded && (
                        <div className="space-y-2 border-t border-slate-800/60 pt-3 transition-all">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Available Specialization Streams:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {college?.branches && college.branches.length > 0 ? (
                              college.branches.map((bName, bIdx) => <span key={bIdx} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/5 border border-indigo-500/20 px-2.5 py-1 text-xs font-medium text-indigo-300"><Award className="h-3.5 w-3.5 text-indigo-500 shrink-0" /> {bName}</span>)
                            ) : ( <span className="text-xs text-slate-600 italic">No stream records populated.</span> )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 💎 WINDOW FOUR: CAP DOCUMENT CHECKLIST CENTER */}
          {activeWindow === 'documents' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 backdrop-blur-sm shadow-xl">
                <div className="space-y-1"><div className="flex items-center gap-2 text-indigo-400"><FileCheck className="h-5 w-5" /><h2 className="font-bold text-base sm:text-lg text-white">Select Admission Entry Quota</h2></div></div>
                <div>
                  <select value={docCategory} onChange={(e) => setDocCategory(e.target.value)} className="rounded-xl bg-slate-950 border border-slate-700 p-3 text-sm text-white font-bold focus:ring-2 focus:ring-indigo-500 cursor-pointer w-full sm:w-48">
                    {categories.length === 0 && <option value="OPEN">General / OPEN</option>}
                    {categories.map((cat) => ( <option key={cat} value={cat}>{cat}</option> ))}
                  </select>
                </div>
              </div>
              <div className="bg-slate-900/20 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs font-medium shadow-md gap-3">
                <div className="flex items-center gap-2 text-slate-400 min-w-0 flex-1"><Info className="h-4 w-4 text-indigo-400 shrink-0" /><span className="truncate">Progress:</span><span className="text-white font-bold font-mono shrink-0">{checkedCount}/{currentDocsList.length}</span></div>
                <div className="w-24 sm:w-48 h-2 bg-slate-900/20 border border-slate-800 rounded-full overflow-hidden shrink-0"><div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300" style={{ width: `${((checkedCount || 0) / (currentDocsList.length || 1)) * 100}%` }}></div></div>
              </div>
              <div className="space-y-3">
                {currentDocsList.map((doc) => {
                  if (!doc) return null; const isChecked = !!checkedDocs[doc.id];
                  return (
                    <div key={doc.id} onClick={() => toggleDocumentCheck(doc.id)} className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 group select-none shadow-sm ${isChecked ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-900/20 border-slate-800'}`}>
                      <div className="space-y-1"><h4 className={`text-sm font-bold transition-colors ${isChecked ? 'text-emerald-400 line-through opacity-70' : 'text-white'}`}>{doc.name}</h4><p className="text-xs text-slate-400 leading-relaxed font-medium">{doc.desc}</p></div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function PredictorEngine() {
  return (
    <LocalErrorGuard>
      <MainPredictorWorkspace />
    </LocalErrorGuard>
  );
}