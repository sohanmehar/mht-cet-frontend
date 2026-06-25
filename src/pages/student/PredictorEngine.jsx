import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Search, Sliders, GraduationCap, Building2, MapPin, Award, 
  CheckCircle2, HelpCircle, AlertTriangle, ArrowLeft, ArrowRight, Plus, Trash2, 
  Download, ListOrdered, ChevronUp, ChevronDown, 
  Menu, X, BarChart3, LayoutDashboard, FileCheck, Info, BookOpen
} from 'lucide-react'; 
import { googleLogout } from '@react-oauth/google';
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
        <div className="min-h-screen bg-slate-50 text-slate-800 p-8 flex flex-col items-center justify-center">
          <div className="max-w-xl w-full bg-white border border-rose-200 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600 font-black text-lg border-b border-slate-100 pb-3 uppercase">
              <AlertTriangle className="h-6 w-6" /> Portal Layout Intercepted
            </div>
            <p className="text-xs text-slate-500 font-medium">Runtime tracking recovered safely.</p>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-600/10">Reset Session Layer</button>
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
  
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('cet_user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('cet_token') || 'null');
  const [isOnboarding, setIsOnboarding] = useState(false);

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
  
  const [preferenceList, setPreferenceList] = useState([]);
  const [categories, setCategories] = useState([]);

  // States to manage inside the onboarding layout closure
  const [onboardStep, setOnboardStep] = useState(1);
  const [isOnboardDistOpen, setIsOnboardDistOpen] = useState(false);
  const [localOnboardData, setLocalOnboardData] = useState({
    mobileNumber: '',
    district: '',
    percentile: '',
    category: 'GOPENS'
  });
  const [onboardError, setOnboardError] = useState('');

  // Profile-lock variables auto synchronization
  useEffect(() => {
    if (user && user.percentile) {
      setQuery(prev => ({
        ...prev,
        percentile: user.percentile.toString(),
        category: user.category || 'GOPENS'
      }));
    }
  }, [user]);

  // EFFECT TO LOAD USER PREFERENCES STRICTLY FROM MONGO CLOUD ON APP RENDER
  useEffect(() => {
    if (token === 'null' || !token || !user) return;

    const fetchCloudPreferences = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/preferences', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.success) {
          setPreferenceList(response.data.data);
        }
      } catch (err) {
        console.error("Failed to sync client memory with user choices stack:", err);
      }
    };
    fetchCloudPreferences();
  }, [token, user]);

  const syncPreferencesToCloud = async (updatedList) => {
    setPreferenceList(updatedList);
    try {
      await axios.post('http://localhost:5000/api/preferences/sync', 
        { choices: updatedList },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Cloud database sync operation failed:", err);
    }
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('cet_token');
    localStorage.removeItem('cet_user');
    localStorage.removeItem('cet_active_window');
    setToken('null');
    setUser(null);
    setResults([]);
    setIsOnboarding(false);
    window.location.href = '/login';
  };

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
    DEFENCE: [
      { id: 'def_1', name: 'Defence Proforma C (For DEF-1, DEF-2, DEF-3)', desc: 'Certificate from the Commandant / Competent Authority stating parent status (Active or Ex-Serviceman).' },
      { id: 'def_2', name: 'Defence Proforma D (Strictly for Active Duty / DEF-1)', desc: 'Certificate from the Master/Commanding Officer specifying current posting placement inside Maharashtra State.' },
      { id: 'def_3', name: 'Defence Proforma E (Strictly for Transfer Cases / DEF-3)', desc: 'Certificate required if parent is posted outside Maharashtra but has specified transfer orders to MH.' },
      { id: 'def_4', name: 'Ex-Servicemen Identity Card & Discharge Book', desc: 'Mandatory for DEF-2 category. Identity card issued by Zilla Sainik Welfare Officer (ZSWO).' },
      { id: 'def_5', name: 'Parent Domicile Certificate of Maharashtra', desc: 'Mandatory for DEF-1 and DEF-2 to prove parent belongs to Maharashtra state baseline.' }
    ]
  };

  const getRequiredDocuments = () => {
    let list = [...(documentDatabase.COMMON || [])];
    const cleanDocCat = String(docCategory || '').toUpperCase();
    if (
      cleanDocCat.includes('OBC') || 
      cleanDocCat.includes('BC') || 
      cleanDocCat.includes('SBC') || 
      cleanDocCat.includes('VJ') || 
      cleanDocCat.includes('NT')
    ) {
      list = [...list, ...(documentDatabase.OBC || [])];
    }  
    if (cleanDocCat.includes('EWS')) {
      list = [...list, ...(documentDatabase.EWS || [])];
    }   
    if (cleanDocCat.includes('SC') || cleanDocCat.includes('ST')) {
      list = [...list, ...(documentDatabase.SC_ST || [])];
    }
    if (cleanDocCat.includes('TFWS')) {
      list = [...list, ...(documentDatabase.TFWS || [])];
    }
    if (cleanDocCat.includes('DEF')) {
      list = [...list, ...(documentDatabase.DEFENCE || [])];
    }
    if (cleanDocCat.includes('PWD')) {
      list = [...list, ...(documentDatabase.PWD || [])];
    }
    return list;
  };

  useEffect(() => { localStorage.setItem('cet_active_window', activeWindow); }, [activeWindow]);

  useEffect(() => {
      if (token === 'null' || !token || !user) return;
      
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
  }, [activeWindow, token, user]);

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
      const response = await axios.post('http://localhost:5000/api/predict', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.success && Array.isArray(response.data.data)) setResults(response.data.data);
    } catch (err) { setError('Predictor connection connection offline.'); } finally { setLoading(false); }
  };

  const addToPreference = (item) => { 
    const isAlreadyAdded = preferenceList.some(p => p?.branchCode === item?.branchCode); 
    if (!isAlreadyAdded) {
      const updated = [...preferenceList, item];
      syncPreferencesToCloud(updated);
    }
  };

  const removeFromPreference = (branchCode) => { 
    const updated = preferenceList.filter(p => p?.branchCode !== branchCode); 
    syncPreferencesToCloud(updated);
  };

  const movePreferenceUp = (index) => { 
    if (index === 0) return; 
    const updated = [...preferenceList]; 
    const temp = updated[index]; 
    updated[index] = updated[index - 1]; 
    updated[index - 1] = temp; 
    syncPreferencesToCloud(updated);
  };

  const movePreferenceDown = (index) => { 
    if (index === preferenceList.length - 1) return; 
    const updated = [...preferenceList]; 
    const temp = updated[index]; 
    updated[index] = updated[index + 1]; 
    updated[index + 1] = temp; 
    syncPreferencesToCloud(updated);
  };

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
      }, { headers: { Authorization: `Bearer ${token}` } });
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
        return ( <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 border border-emerald-500/20"><CheckCircle2 className="h-3.5 w-3.5" />SAFE</span> );
      case 'MATCH':
        return ( <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-600 border border-blue-500/20"><HelpCircle className="h-3.5 w-3.5" />MATCH</span> );
      default:
        return ( <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 border border-amber-500/20"><AlertTriangle className="h-3.5 w-3.5" />REACH</span> );
    }
  };

  const matchColleges = results.filter(item => item?.recommendationType === 'MATCH').slice(0,50);
  const safeColleges = results.filter(item => item?.recommendationType === 'SAFE').slice(0,50);
  const dreamColleges = results.filter(item => item?.recommendationType === 'REACH').slice(0,50);
  const displayList = activeTab === 'dream' ? dreamColleges : activeTab === 'safe' ? safeColleges : matchColleges;
  const getRoundCutoff = (rounds, roundNum) => { const found = (rounds || []).find(r => String(r?.round) === String(roundNum)); return found ? found.percentile.toFixed(4) : 'N/A'; };
  
  const currentDocsList = getRequiredDocuments() || [];
  const checkedCount = currentDocsList.filter(d => d && checkedDocs[d?.id]).length;

  if (token === 'null' || !token || !user) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-sans text-xs text-slate-500 font-bold uppercase tracking-wider">
        Redirecting security layers to verification gateway...
      </div>
    );
  }

  // 👤 RE-ENGINEERED LIGHT-MODE ONBOARDING VIEWPORT
  if (isOnboarding) {
    const handleNextStep = (e) => {
      e.preventDefault();
      setOnboardError('');
      if (!localOnboardData.mobileNumber || !localOnboardData.district) {
        setOnboardError('Please fill out all identity coordinates parameters.');
        return;
      }
      if (localOnboardData.mobileNumber.length < 10) {
        setOnboardError('Enter a valid 10-digit primary mobile trace.');
        return;
      }
      setOnboardStep(2);
    };

    const handleFinalOnboardSubmit = async (e) => {
      e.preventDefault();
      setOnboardError('');
      setLoading(true);

      const perc = parseFloat(localOnboardData.percentile);
      if (isNaN(perc) || perc < 0 || perc > 100) {
        setOnboardError('Strict validation: Percentile must scale cleanly between 0.00 and 100.00');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.put('http://localhost:5000/api/auth/onboard-profile', {
          email: user.email,
          mobileNumber: localOnboardData.mobileNumber,
          district: localOnboardData.district,
          percentile: perc,
          category: localOnboardData.category
        });

        if (response.data?.success) {
          localStorage.setItem('cet_user', JSON.stringify(response.data.user));
          localStorage.setItem('cet_active_window', 'predictor');
          setActiveWindow('predictor');
          
          setQuery(prev => ({
            ...prev,
            percentile: perc.toString(),
            category: localOnboardData.category
          }));
          
          setUser(response.data.user);
          setIsOnboarding(false);
        }
      } catch (err) {
        setOnboardError(err.response?.data?.message || 'Failed to lock profile parameters to database.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-[#F8F9FA] text-slate-800 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#EBF4FF,transparent_55%)] opacity-70"></div>
        
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl relative z-10 animate-fadeIn">
          
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Progress Parameter</span>
              <span className="text-blue-600">Step {onboardStep} of 2</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: onboardStep === 1 ? '50%' : '100%' }}
              ></div>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-[#0B2545] uppercase tracking-tight flex items-center gap-2">
              {onboardStep === 1 ? <Sliders className="h-5 w-5 text-blue-600" /> : <Award className="h-5 w-5 text-blue-600" />}
              {onboardStep === 1 ? 'Lock Profile Coordinates' : 'Verify Academic Metrics'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {onboardStep === 1 ? 'Configure your authentication parameters to sync server tracking variables.' : 'Input your certified official MHT-CET evaluation values.'}
            </p>
          </div>

          {onboardError && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-mono text-center animate-fadeIn">{onboardError}</div>}

          {onboardStep === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Primary Contact Tracker</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-sm text-slate-400 font-bold font-sans">+91</span>
                  <input 
                    type="tel" maxLength="10" required 
                    value={localOnboardData.mobileNumber} 
                    onChange={(e) => setLocalOnboardData({...localOnboardData, mobileNumber: e.target.value})}
                    placeholder="9876543210" 
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-12 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white shadow-inner font-medium transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Home District Region Space</label>
                <div className="relative">
                  <div 
                    onClick={() => setIsOnboardDistOpen(!isOnboardDistOpen)} 
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between select-none cursor-pointer shadow-inner bg-white"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <span className={localOnboardData.district ? "text-slate-900 font-bold" : "text-slate-400 font-medium"}>
                        {localOnboardData.district || "Select District Node"}
                      </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOnboardDistOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isOnboardDistOpen && (
                    <div className="absolute left-0 mt-2 w-full max-h-52 overflow-y-auto bg-white border border-slate-200 rounded-xl p-1.5 z-50 shadow-xl space-y-1 scrollbar-thin animate-fadeIn">
                      {districts && districts.length > 0 ? (
                        districts.map((dist) => (
                          <div 
                            key={dist} 
                            onClick={() => {
                              setLocalOnboardData({...localOnboardData, district: dist});
                              setIsOnboardDistOpen(false);
                            }} 
                            className={`p-2.5 rounded-lg cursor-pointer text-xs font-bold transition-all ${localOnboardData.district === dist ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-50 text-slate-700'}`}
                          >
                            {dist}
                          </div>
                        ))
                      ) : (
                        ["Pune", "Mumbai City", "Nagpur", "Nashik", "Thane"].map((dist) => (
                          <div 
                            key={dist} 
                            onClick={() => {
                              setLocalOnboardData({...localOnboardData, district: dist});
                              setIsOnboardDistOpen(false);
                            }} 
                            className="p-2.5 rounded-lg cursor-pointer text-xs font-bold text-slate-600 hover:bg-slate-50"
                          >
                            {dist}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2 cursor-pointer mt-6 select-none active:scale-98">
                Proceed to Metrics <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {onboardStep === 2 && (
            <form onSubmit={handleFinalOnboardSubmit} className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">MHT-CET Certified Percentile Scale</label>
                <div className="relative">
                  <Award className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="number" step="0.0000001" required min="0" max="100"
                    value={localOnboardData.percentile} 
                    onChange={(e) => setLocalOnboardData({...localOnboardData, percentile: e.target.value})}
                    placeholder="e.g. 99.17253" 
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 p-3 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Counselling Allocation Seat Category (DTE)</label>
                <div className="relative">
                  <FileCheck className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <select 
                    required 
                    value={localOnboardData.category} 
                    onChange={(e) => setLocalOnboardData({...localOnboardData, category: e.target.value})}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer font-bold bg-white"
                  >
                    <option value="GOPENS">GOPENS (General Open State)</option>
                    <option value="OBC">OBC (Other Backward Class)</option>
                    <option value="SC">SC (Scheduled Caste)</option>
                    <option value="ST">ST (Scheduled Tribe)</option>
                    <option value="EWS">EWS (Economically Weaker Section)</option>
                    <option value="TFWS">TFWS (Tuition Fee Waiver Scheme)</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-4 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOnboardStep(1)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                
                <button type="submit" disabled={loading} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2 border border-transparent select-none active:scale-98 cursor-pointer disabled:opacity-50">
                  {loading ? 'Initializing Engine...' : 'Initialize Full Dashboard'} 
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    );
  }
  
  // 🏢 MAIN WORKSPACE CANVASES SYSTEM RENDER (LIGHT CORPORATE MODE)
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 flex font-sans overflow-hidden">
      
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* 🧭 SIDEBAR LINK CONTROLS */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:h-screen ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col justify-between p-4">
          <div className="space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5 text-blue-600">
                  <div className="h-8 w-8 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shadow-sm"><GraduationCap className="h-4 w-4" /></div>
                  <span className="font-black text-base text-[#0B2545] tracking-tight uppercase">MHT-CET Suite</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 p-1 rounded-md hover:bg-slate-100 cursor-pointer"><X className="h-5 w-5" /></button>
              </div>
              <nav className="space-y-1">
                <button onClick={() => { setActiveWindow('predictor'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeWindow === 'predictor' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><LayoutDashboard className="h-4 w-4" /> Core Predictor Engine</button>
                <button onClick={() => { setActiveWindow('simulator'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeWindow === 'simulator' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <div className="flex items-center gap-3"><ListOrdered className="h-4 w-4" /><span>CAP Choice Simulator</span></div>
                  {preferenceList.length > 0 && (<span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeWindow === 'simulator' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}`}>{preferenceList.length}</span>)}
                </button>
                <button onClick={() => { setActiveWindow('directory'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeWindow === 'directory' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><BookOpen className="h-4 w-4" /> College & Branch List</button>
                <button onClick={() => { setActiveWindow('documents'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeWindow === 'documents' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><FileCheck className="h-4 w-4" /> CAP Document Tracker</button>
              </nav>
            </div>
            
            {user && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0 uppercase">{user.name?.[0] || 'C'}</div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate leading-none">{user.name}</p>
                    <span className="text-[9px] text-blue-600 font-mono font-bold uppercase tracking-wider mt-1 block">{user.category || 'GOPENS'}</span>
                  </div>
                </div>
                <button onClick={handleLogout} className="text-[10px] font-bold px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-lg cursor-pointer transition-all shrink-0">Logout</button>
              </div>
            )}
          </div>
          <div className="text-[10px] font-mono font-bold text-slate-400 text-center pt-3 border-t border-slate-100 mt-2">v4.4 Premium Stable</div>
        </div>
      </aside>

      {/* 📥 MAIN DESK LAYOUT SYSTEM */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-slate-600 p-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer shrink-0"><Menu className="h-5 w-5" /></button>
            <h1 className="font-black text-sm sm:text-base text-[#0B2545] uppercase tracking-wider truncate">
              {activeWindow === 'predictor' ? "Choice Matrix Workplace" : activeWindow === 'simulator' ? "CAP Preference Choice Simulator" : activeWindow === 'directory' ? "DTE Institute Directory" : "DTE Scrutiny Checklist Center"}
            </h1>
          </div>
          <span className="text-[10px] sm:text-[11px] font-sans font-bold bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full shrink-0">CAP Round Live</span>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {error && <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold text-center">{error}</div>}

          {/* 💎 WINDOW ONE: CORE PREDICTOR LAYOUTS */}
          {activeWindow === 'predictor' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 text-blue-600 mb-4"><Sliders className="h-5 w-5" /><h2 className="font-black text-xs uppercase tracking-wider text-slate-700">Configure Search Parameters</h2></div>
                <form onSubmit={executePrediction} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">My Percentile</label>
                    <input name="percentile" type="number" step="0.0000001" required min="0" max="100" value={query.percentile} onChange={handleInputChange} placeholder="e.g. 95.4837" className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">Seat Category</label>
                    <select name="category" value={query.category} onChange={handleInputChange} className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white transition-all shadow-inner">{categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select>
                  </div>
                  <div className="relative" ref={cityRef}>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">Preferred Location</label>
                    <div onClick={() => setIsCityOpen(!isCityOpen)} className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold cursor-pointer flex items-center justify-between select-none bg-white transition-all shadow-inner">
                      <span className="truncate pr-2 text-blue-600">{selectedCities.includes("ALL") ? "All Districts (MS)" : `${selectedCities.length} Selected`}</span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isCityOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isCityOpen && (
                      <div className="absolute left-0 mt-2 w-full max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl p-2 z-50 shadow-xl space-y-1 scrollbar-thin">
                        <div onClick={() => handleCityToggle("ALL")} className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs font-bold transition-all ${selectedCities.includes("ALL") ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}>
                          <div className={`h-4 w-4 rounded flex items-center justify-center border ${selectedCities.includes("ALL") ? 'bg-blue-600 border-blue-400' : 'border-slate-300'}`}>{selectedCities.includes("ALL") && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}</div>All Districts (MS)
                        </div>
                        {districts.map((dist) => {
                          const isChecked = selectedCities.includes(dist);
                          return (
                            <div key={dist} onClick={() => handleCityToggle(dist)} className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs font-bold transition-all ${isChecked ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}>
                              <div className={`h-4 w-4 rounded flex items-center justify-center border ${isChecked ? 'bg-blue-600 border-blue-400' : 'border-slate-300'}`}>{isChecked && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}</div>{dist}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="relative" ref={branchRef}>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">Preferred Branches</label>
                    <div onClick={() => setIsBranchOpen(!isBranchOpen)} className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold cursor-pointer flex items-center justify-between select-none bg-white shadow-inner transition-all">
                      <span className="truncate pr-2 text-blue-600">{selectedBranches.includes("ALL") ? "All Specializations" : `${selectedBranches.length} Selected`}</span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isBranchOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isBranchOpen && (
                      <div className="absolute right-0 lg:left-0 mt-2 w-64 lg:w-72 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl p-2 z-50 shadow-xl space-y-1 scrollbar-thin">
                        <div onClick={() => handleBranchToggle("ALL")} className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs font-bold transition-all ${selectedBranches.includes("ALL") ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}>
                          <div className={`h-4 w-4 rounded flex items-center justify-center border ${selectedBranches.includes("ALL") ? 'bg-blue-600 border-blue-400' : 'border-slate-300'}`}>{selectedBranches.includes("ALL") && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}</div>All Specializations
                        </div>
                        {branchesList.map((branchName) => {
                          const isChecked = selectedBranches.includes(branchName);
                          return (
                            <div key={branchName} onClick={() => handleBranchToggle(branchName)} className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs font-bold transition-all ${isChecked ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}>
                              <div className={`h-4 w-4 rounded flex items-center justify-center border ${isChecked ? 'bg-blue-600 border-blue-400' : 'border-slate-300'}`}>{isChecked && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}</div><span className="truncate">{branchName}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <button type="submit" className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2 border border-transparent select-none active:scale-98"><Search className="h-4 w-4" /> {loading ? "Calculating..." : "Find Options"}</button>
                </form>
              </div>

              {/* 📋 RESULT DISPLAY MATRIX */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
                  <h3 className="font-black text-sm uppercase tracking-wider text-slate-700">Predicted Adjustments</h3>
                  <div className="flex rounded-xl bg-slate-100 border border-slate-200 p-1 text-[11px] max-w-full overflow-x-auto whitespace-nowrap scrollbar-none">
                    <button onClick={() => setActiveTab('match')} className={`px-3 py-2 font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeTab === 'match' ? 'bg-white border border-slate-200 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Best Matches ({matchColleges.length})</button>
                    <button onClick={() => setActiveTab('safe')} className={`px-3 py-2 font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeTab === 'safe' ? 'bg-white border border-slate-200 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Safe Bets ({safeColleges.length})</button>
                    <button onClick={() => setActiveTab('dream')} className={`px-3 py-2 font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeTab === 'dream' ? 'bg-white border border-slate-200 text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Ambitious ({dreamColleges.length})</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayList.map((item, index) => {
                    const uniqueRoundsMap = {};
                    (item.rounds || []).forEach(r => {
                      const roundNum = String(r.round);
                      if (!uniqueRoundsMap[roundNum] || parseFloat(r.percentile || 0) > uniqueRoundsMap[roundNum]) {
                        uniqueRoundsMap[roundNum] = parseFloat(r.percentile || 0);
                      }
                    });
                    const graphData = Object.keys(uniqueRoundsMap).sort((a,b)=>Number(a)-Number(b)).map(rNum => ({ round: `R${rNum}`, cutoff: uniqueRoundsMap[rNum] }));
                    
                    return (
                      <div key={index} className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between gap-4 shadow-sm relative hover:border-slate-300/80 transition-all group">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono font-bold bg-slate-50 text-blue-600 px-2 py-0.5 rounded-lg border border-slate-100">Code: {item.collegeCode}</span>
                            {getChanceBadge(item.recommendationType)}
                          </div>
                          <h4 className="font-extrabold text-sm text-[#0B2545] line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{item.collegeName}</h4>
                        </div>

                        <div className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-100 grid grid-cols-4 gap-1 text-center font-mono text-[11px] shadow-inner">
                          {["1", "2", "3", "4"].map(rNum => (
                            <div key={rNum} className={rNum !== "4" ? "border-r border-slate-200" : ""}>
                              <div className="text-[9px] text-slate-400 font-bold uppercase">R{rNum}</div>
                              <div className={`font-bold mt-0.5 truncate ${rNum === "4" ? "text-blue-600" : "text-slate-700"}`}>{getRoundCutoff(item.rounds, rNum)}</div>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 font-semibold">
                          <div className="flex items-center gap-1.5 text-slate-700 col-span-2"><Award className="h-3.5 w-3.5 text-blue-500 shrink-0" /><span className="line-clamp-1">{item.branchName}</span></div>
                          <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span className="truncate">{item.city}</span></div>
                          <div className="flex items-center gap-1.5 justify-end"><Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span className="truncate">{item.status}</span></div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Tier: {item.tierLabel || 'Good'}</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleTrendGraph(`${activeTab}-${index}`)} className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 font-bold cursor-pointer transition-all"><BarChart3 className="h-3.5 w-3.5 text-blue-500" /> Trend</button>
                            <button onClick={() => addToPreference(item)} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer active:scale-95"><Plus className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>

                        {expandedTrendId === `${activeTab}-${index}` && (
                          <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded-xl animate-fadeIn">
                            <div className="h-32 w-full font-mono text-[10px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={graphData} margin={{ left: -5, right: 15, top: 10, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                  <XAxis dataKey="round" stroke="#94a3b8" />
                                  <YAxis type="number" domain={['dataMin - 0.2', 'dataMax + 0.2']} stroke="#94a3b8" width={48} />
                                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px' }} />
                                  <Line type="monotone" dataKey="cutoff" stroke="#2563eb" strokeWidth={2.5} name="Cutoff" dot={{ r: 3, strokeWidth: 2 }} />
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

          {/* 💎 WINDOW TWO: CHOICE OPTION FORM SIMULATOR */}
          {activeWindow === 'simulator' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-blue-600"><ListOrdered className="h-5 w-5" /><h2 className="font-extrabold text-sm sm:text-base text-slate-800 uppercase tracking-tight">CAP Option Form Simulator</h2></div>
                  <p className="text-xs text-slate-500 font-medium">Arrange preferences and execute mock allotment algorithm iterations.</p>
                </div>
                
                <div className="flex flex-row items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200 max-w-fit">
                  <div className="w-20 sm:w-24">
                    <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">Percentile</label>
                    <input name="percentile" type="number" step="0.0000001" min="0" max="100" value={query.percentile} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono" />
                  </div>
                  <div className="w-24 sm:w-28">
                    <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">Category</label>
                    <select name="category" value={query.category} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">{categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select>
                  </div>
                </div>

                {preferenceList.length > 0 && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={triggerMockSimulation} className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl text-xs font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/10 cursor-pointer active:scale-98">⚡ Simulate Allotment</button>
                    <button onClick={exportPreferenceListToPDF} className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"><Download className="h-4 w-4 text-emerald-600" /> Export PDF</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                {preferenceList.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center text-slate-400 text-sm font-bold uppercase tracking-wider space-y-3 shadow-sm">
                    <p>Your Option Form is currently empty.</p>
                    <button onClick={() => setActiveWindow('predictor')} className="text-xs px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-blue-600 border border-slate-200 rounded-xl font-black uppercase tracking-wider transition-all cursor-pointer">Go to Core Predictor Engine</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {preferenceList.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl gap-3 shadow-sm hover:border-slate-300 transition-all">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-xs font-black font-mono text-emerald-600">#{index + 1}</div>
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold"><span className="text-blue-600 truncate">Code: {item.collegeCode}</span><span className="text-slate-400 hidden sm:inline">| {item.city}</span></div>
                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">{item.collegeName}</h4>
                            <p className="text-[11px] text-slate-500 font-semibold truncate flex items-center gap-1"><Award className="h-3 w-3 text-blue-500 shrink-0" /> {item.branchName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex flex-col">
                            <button disabled={index === 0} onClick={() => movePreferenceUp(index)} className="p-0.5 text-slate-400 hover:text-blue-600 disabled:opacity-10 cursor-pointer"><ChevronUp className="h-4 w-4" /></button>
                            <button disabled={index === preferenceList.length - 1} onClick={() => movePreferenceDown(index)} className="p-0.5 text-slate-400 hover:text-blue-600 disabled:opacity-10 cursor-pointer"><ChevronDown className="h-4 w-4" /></button>
                          </div>
                          <button onClick={() => removeFromPreference(item.branchCode)} className="p-2.5 bg-slate-50 border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ⚡ SIMULATION ALLOTMENT CONTAINER VIEW */}
                {simResult && (
                  <div className="p-5 rounded-3xl bg-[#F0FDF4] border border-emerald-200/80 animate-fadeIn flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-wider"><CheckCircle2 className="h-4 w-4" /> Seat Allocated Successfully</div>
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base pt-0.5">Choice #{simResult.preferenceNumber}: {simResult.collegeName}</h3>
                      <p className="text-xs sm:text-sm text-blue-600 font-bold">{simResult.branchName}</p>
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-xl font-mono text-[11px] text-slate-500 space-y-1 text-center sm:text-right shadow-sm w-full sm:w-auto shrink-0 font-bold">
                      <div>Round Match: <span className="text-slate-900 font-black">{simResult.round}</span></div>
                      <div>Cutoff Match: <span className="text-blue-600 font-black">{simResult.cutoffMatched.toFixed(4)}</span></div>
                    </div>
                  </div>
                )}

                {simResult === null && !simLoading && preferenceList.length > 0 && results.length > 0 && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-sm animate-fadeIn">
                    <AlertTriangle className="h-4 w-4 shrink-0" /> No Allotment Secured. Add more "Safe Bet" choices below your preference list!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 💎 WINDOW THREE: INSTITUTIONAL DIRECTORY VIEW */}
          {activeWindow === 'directory' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 backdrop-blur-sm shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-blue-600"><BookOpen className="h-5 w-5" /><h2 className="font-black text-xs uppercase tracking-wider text-slate-700">Search Institutional Structure</h2></div>
                <div className="relative">
                  <input type="text" value={directorySearch} onChange={handleDirectorySearchChange} placeholder="Search by College Name or DTE Code..." className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 p-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner" />
                  <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                </div>
              </div>

              {dirLoading && <div className="text-center py-12 text-xs font-bold uppercase tracking-wider text-slate-400">Mapping Rows Directly From Database Layer...</div>}

              <div className="grid grid-cols-1 gap-4">
                {Array.isArray(filteredColleges) && filteredColleges.map((college, idx) => {
                  const isExpanded = expandedCollegeId === college?.collegeCode;
                  return (
                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-300 transition-all space-y-4 shadow-sm group">
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap font-bold text-[10px]">
                            <span className="font-mono bg-slate-50 text-blue-600 border border-slate-100 px-2 py-0.5 rounded-lg">Code: {college?.collegeCode}</span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wide truncate">{college?.status}</span>
                            <span className="text-slate-400 flex items-center gap-1 truncate font-sans"><MapPin className="h-3 w-3" /> {college?.city}</span>
                          </div>
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-800 pt-1 truncate group-hover:text-blue-600 transition-colors">{college?.collegeName}</h3>
                        </div>
                        <button type="button" onClick={() => toggleCollegeCollapse(college?.collegeCode)} className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-blue-600 hover:bg-slate-100 transition-all cursor-pointer">
                          <ChevronDown className={`h-4 w-4 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="space-y-2 border-t border-slate-100 pt-3 transition-all animate-fadeIn">
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Available Specialization Streams:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {college?.branches && college.branches.length > 0 ? (
                              college.branches.map((bName, bIdx) => <span key={bIdx} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 shadow-sm"><Award className="h-3.5 w-3.5 text-blue-500 shrink-0" /> {bName}</span>)
                            ) : ( <span className="text-xs text-slate-400 italic font-semibold">No stream records populated.</span> )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 💎 WINDOW FOUR: CAP SCRUTINY DOCUMENT TRACKER (EXACT IMAGE LOOKMATCH) */}
          {activeWindow === 'documents' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              {/* 🗳️ BLOCK 1: SELECT QUOTA CONTAINER */}
              <div className="bg-[#FCFBF7] border border-[#F2EFE4] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 text-[#1D2B53] font-black text-sm uppercase tracking-wide">
                    <FileCheck className="h-4 w-4 text-blue-600" /> 
                    <span>Select Admission Entry Quota</span>
                  </div>
                </div>
                <div className="relative">
                  <select value={docCategory} onChange={(e) => setDocCategory(e.target.value)} className="rounded-xl border border-slate-200 p-3 pr-10 text-xs font-black uppercase tracking-wider text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer w-full sm:w-48 appearance-none shadow-sm">
                    {categories.length === 0 && <option value="OPEN">General / OPEN</option>}
                    {categories.map((cat) => ( <option key={cat} value={cat}>{cat}</option> ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* 📊 BLOCK 2: PROGRESS MATRIX ACCENT */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-xs font-bold shadow-sm gap-3">
                <div className="flex items-center gap-2 text-slate-400 min-w-0 flex-1">
                  <Info className="h-4 w-4 text-blue-500 shrink-0" />
                  <span className="uppercase text-[10px] tracking-wider font-black text-slate-500">Progress:</span>
                  <span className="text-slate-800 font-mono font-black shrink-0">{checkedCount}/{currentDocsList.length}</span>
                </div>
                <div className="w-24 sm:w-48 h-2 bg-slate-100 border border-slate-200 rounded-full overflow-hidden shrink-0">
                  <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${((checkedCount || 0) / (currentDocsList.length || 1)) * 100}%` }}></div>
                </div>
              </div>

              {/* 📑 BLOCK 3: CHEKLIST STRUCTURAL GRID */}
              <div className="space-y-2.5">
                {currentDocsList.map((doc) => {
                  if (!doc) return null; 
                  const isChecked = !!checkedDocs[doc.id];
                  return (
                    <div 
                      key={doc.id} 
                      onClick={() => toggleDocumentCheck(doc.id)} 
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 group select-none shadow-sm ${isChecked ? 'bg-blue-50/40 border-blue-200' : 'bg-white border-slate-200/80 hover:border-slate-300'}`}
                    >
                      <div className="mt-0.5 shrink-0">
                        <div className={`h-4 w-4 rounded flex items-center justify-center border transition-all ${isChecked ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-300 bg-slate-50'}`}>
                          {isChecked && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className={`text-xs font-black uppercase tracking-tight transition-colors ${isChecked ? 'text-blue-600 line-through opacity-60' : 'text-slate-800'}`}>{doc.name}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">{doc.desc}</p>
                      </div>
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