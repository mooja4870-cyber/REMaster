import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, TrendingUp, ShieldCheck, Home, AlertTriangle,
  FileText, Menu, X, ChevronRight, Info, CheckCircle2, BookOpen, Activity, Calculator
} from 'lucide-react';

import { locationData } from './data/locationData';
import { planSearch, fetchRealAiAnalysis } from './logic/SearchOrchestrator';
import { validateResult } from './logic/AnalysisHarness';
import AnalysisReport from './components/AnalysisReport';
import WelcomeGuide from './components/WelcomeGuide';
import LoanSimulator from './components/LoanSimulator';
import RiskSignalGuide from './components/RiskSignalGuide';

class ReportErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ReportErrorBoundary] AnalysisReport crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card border-l-4 border-red-500 bg-red-50 p-6 text-center">
          <AlertTriangle size={36} className="mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">분석 리포트 렌더링 오류</h3>
          <p className="text-sm text-slate-600 mb-6">리포트 출력 중 오류가 발생했습니다: {this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-bold">다시 시도</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <motion.div
    whileHover={{ x: 5, backgroundColor: 'var(--color-bg-subtle)' }}
    onClick={onClick}
    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
      active ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    <Icon size={20} />
    <span className="text-sm font-bold tracking-tight">{label}</span>
  </motion.div>
);

const ModalShell = ({ children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="bg-[#f4f6fa] w-full max-w-6xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden relative border border-white/20 flex flex-col"
    >
      <button onClick={onClose} className="absolute top-8 right-8 z-50 p-2 bg-white/40 hover:bg-white/70 text-slate-800 rounded-full transition-colors">
        <X size={24} />
      </button>
      <div className="overflow-y-auto flex-1 p-8 md:p-12">{children}</div>
    </motion.div>
  </motion.div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(true);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showRiskGuide, setShowRiskGuide] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  const [systemHealth, setSystemHealth] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [isDetailedSearchOpen, setIsDetailedSearchOpen] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [detailedInput, setDetailedInput] = useState({ city: '', district: '', neighborhood: '', apartment: '', dong: '' });

  const menuItems = [
    { id: 'dashboard', label: '종합 대시보드', icon: Home },
    { id: 'apartment', label: '아파트 입지 분석', icon: MapPin },
    { id: 'market', label: '시세·전망 분석', icon: TrendingUp },
    { id: 'policy', label: '정부 정책 분석', icon: FileText },
    { id: 'villa', label: '빌라·다세대 분석', icon: Home },
    { id: 'factcheck', label: '팩트체크 & 리스크', icon: ShieldCheck },
  ];

  const rawCounts = analysisResult?.realDataMeta?.molit?.rawCounts || {};
  const molitMeta = analysisResult?.realDataMeta?.molit;
  const isApartmentEvidence = molitMeta?.assetType === 'apartment';
  const isVillaEvidence = molitMeta?.assetType === 'villa';
  const sourceEvidence = [
    { label: '국토교통부_아파트 매매 실거래가 상세 자료', active: isApartmentEvidence && rawCounts.trade > 0 },
    { label: '국토교통부_아파트 전월세 실거래가 자료', active: isApartmentEvidence && rawCounts.rent > 0 },
    { label: '국토교통부_연립다세대 매매 실거래가 자료', active: isVillaEvidence && rawCounts.trade > 0 },
    { label: '국토교통부_연립다세대 전월세 실거래가 자료', active: isVillaEvidence && rawCounts.rent > 0 },
  ];

  useEffect(() => {
    let cancelled = false;
    const loadHealth = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health');
        const data = await response.json();
        if (!cancelled && response.ok) setSystemHealth(data);
      } catch (error) {
        if (!cancelled) setSystemHealth(null);
      }
    };
    loadHealth();
    return () => { cancelled = true; };
  }, []);

  const enabledMolitServices = systemHealth?.molitServices ? Object.values(systemHealth.molitServices).filter(Boolean).length : 0;
  const dashboardCards = [
    {
      label: 'API 서버 상태',
      value: systemHealth?.ok ? '정상' : '확인 필요',
      sub: systemHealth ? `Gemini: ${systemHealth.geminiGrounding ? '연동' : '미연동'}` : '헬스체크 대기',
      color: systemHealth?.ok ? 'text-emerald-600' : 'text-amber-600',
      bg: systemHealth?.ok ? 'bg-emerald-50' : 'bg-amber-50',
      icon: Activity
    },
    {
      label: '국토부 실거래 API',
      value: `${enabledMolitServices}개`,
      sub: '활성 서비스 키 수',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      icon: Home
    },
    {
      label: '최근 분석 근거',
      value: analysisResult?.realDataMeta?.molit ? '실데이터' : '대기',
      sub: analysisResult?.realDataMeta?.molit?.lawd?.label || '조회 후 표시',
      color: analysisResult?.realDataMeta?.molit ? 'text-emerald-600' : 'text-slate-500',
      bg: analysisResult?.realDataMeta?.molit ? 'bg-emerald-50' : 'bg-slate-100',
      icon: Info
    }
  ];

  const startAnalysis = (query) => {
    if (!query.trim()) return;

    const plan = planSearch(query);
    const totalSteps = Math.max(plan.steps.length, 1);
    let progressTimer;

    setCurrentPlan(plan);
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setAnalysisProgress(0);
    setAnalysisResult(null);
    setAnalysisError('');

    progressTimer = setInterval(() => {
      setAnalysisProgress((prev) => {
        const next = Math.min(prev + (prev < 80 ? 0.8 : 0.15), 99.5);
        setAnalysisStep(Math.min(Math.floor((next / 100) * totalSteps), totalSteps - 1));
        return next;
      });
    }, 400);

    (async () => {
      try {
        const rawResult = await fetchRealAiAnalysis(query, plan.type);
        clearInterval(progressTimer);
        setAnalysisProgress(100);
        setAnalysisStep(totalSteps - 1);

        let validation = { issues: [] };
        try { validation = validateResult(rawResult); } catch (error) {}

        const finalResult = {
          ...rawResult,
          decisionGuide: rawResult.decisionGuide || rawResult.data?.decisionGuide || {},
          systemWarnings: validation.issues
        };

        const targetTab = plan.type === 'VILLA_ANALYSIS' ? 'villa' : (plan.type === 'APARTMENT_ANALYSIS' ? 'apartment' : 'dashboard');
        setTimeout(() => {
          setActiveTab(targetTab);
          setAnalysisResult(finalResult);
          setIsAnalyzing(false);
        }, 800);
      } catch (err) {
        clearInterval(progressTimer);
        setActiveTab('dashboard');
        setAnalysisResult(null);
        setAnalysisError(err.message || '실제 데이터 분석에 실패했습니다.');
        setIsAnalyzing(false);
      }
    })();
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') startAnalysis(searchQuery);
  };

  const runDetailedSearch = () => {
    const query = `${detailedInput.city} ${detailedInput.district} ${detailedInput.neighborhood} ${detailedInput.apartment} ${detailedInput.dong}`.trim();
    setSearchQuery(query);
    setIsDetailedSearchOpen(false);
    startAnalysis(query);
  };

  return (
    <>
      <AnimatePresence>
        {showWelcomeGuide && <WelcomeGuide onComplete={() => setShowWelcomeGuide(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showLoanModal && <ModalShell onClose={() => setShowLoanModal(false)}><LoanSimulator /></ModalShell>}
      </AnimatePresence>

      <AnimatePresence>
        {showRiskGuide && <ModalShell onClose={() => setShowRiskGuide(false)}><RiskSignalGuide /></ModalShell>}
      </AnimatePresence>

      <div className="flex h-screen min-h-0 bg-[#f4f6fa] text-[#0f2040] overflow-hidden font-sans">
        <aside className="w-72 h-screen min-h-0 shrink-0 border-r border-[#e2e8f0] p-6 flex flex-col gap-8 bg-white shadow-sm z-20 overflow-y-auto overflow-x-hidden">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <TrendingUp size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#0f2040]">RE Master</h1>
          </div>

          <nav className="flex flex-col gap-2 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-3 mb-2">Main Menu</p>
            {menuItems.map((item) => (
              <SidebarItem key={item.id} icon={item.icon} label={item.label} active={activeTab === item.id} onClick={() => setActiveTab(item.id)} />
            ))}
          </nav>

          <div className="mt-auto">
            <button onClick={() => setShowLoanModal(true)} className="w-full flex items-center justify-between p-3 rounded-xl transition-all mb-2 text-sm font-bold border bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200">
              <div className="flex items-center gap-3"><div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"><Calculator size={16} /></div>대출 한도·이자</div>
              <ChevronRight size={14} className="text-slate-400" />
            </button>

            <button onClick={() => setShowRiskGuide(true)} className="w-full flex items-center justify-between p-3 rounded-xl transition-all mb-2 text-sm font-bold border bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200">
              <div className="flex items-center gap-3"><div className="bg-red-100 text-red-500 p-1.5 rounded-lg"><AlertTriangle size={16} /></div>위험 신호 감지</div>
              <ChevronRight size={14} className="text-slate-400" />
            </button>

            <button onClick={() => setShowWelcomeGuide(true)} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors mb-4 text-sm font-bold border border-slate-200">
              <div className="flex items-center gap-3"><div className="bg-blue-100 p-1.5 rounded-lg text-blue-600"><BookOpen size={16} /></div>사용 가이드</div>
              <ChevronRight size={14} className="text-slate-400" />
            </button>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-blue-600" />
                <span className="text-xs font-bold text-blue-600 uppercase">Pro System</span>
              </div>
              <div className="text-[10px] text-blue-800/80 leading-relaxed font-bold">
                <div className="mb-2 text-blue-600">실시간 데이터연동 및 다층분석 엔진가동 중 :</div>
                <div className="space-y-1.5">
                  {sourceEvidence.map((source) => (
                    <div key={source.label} className="flex gap-2 items-center">
                      <span className={`text-[11px] font-black ${source.active ? 'text-emerald-600' : 'text-slate-400'}`}>{source.active ? 'O' : 'X'}</span>
                      <span className={`flex-1 ${source.active ? 'text-blue-800' : 'text-slate-400'}`}>{source.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto relative bg-[#f4f6fa]">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#e2e8f0] px-8 py-4 flex items-center justify-between shadow-sm">
            <div className="flex-1 max-w-2xl relative flex items-center gap-2">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="단지명, 지역 또는 개발호재를 입력하세요"
                  className="w-full pl-12 pr-12 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-400 text-sm text-slate-800 shadow-inner"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={handleSearch}
                />
                <button onClick={() => startAnalysis(searchQuery)} disabled={!searchQuery.trim() || isAnalyzing} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-md active:scale-95">
                  <ChevronRight size={20} />
                </button>
              </div>

              <button onClick={() => setIsDetailedSearchOpen(!isDetailedSearchOpen)} className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all text-sm font-bold whitespace-nowrap ${isDetailedSearchOpen ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}>
                <Menu size={18} /> 구체적 입력
              </button>
            </div>

            <div className="flex items-center gap-6 ml-auto">
              <span className="text-sm font-medium text-slate-500 hidden md:block">반갑습니다, <span className="text-blue-600 font-bold">Master !</span></span>
              <div className="flex flex-col items-end">
                <span className="text-xs text-emerald-600 flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live: AI Analyst
                </span>
              </div>
            </div>
          </header>

          <AnimatePresence>
            {isDetailedSearchOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-white border-b border-slate-200 overflow-hidden shadow-xl">
                <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-slate-800 font-bold text-lg"><MapPin size={20} className="text-blue-600" /> 주소 정보 선택</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <select className="input-select" value={detailedInput.city} onChange={(event) => setDetailedInput({ city: event.target.value, district: '', neighborhood: '', apartment: '', dong: '' })}>
                        <option value="">시·도 선택</option>
                        {Object.keys(locationData).map((city) => <option key={city} value={city}>{city}</option>)}
                      </select>
                      <select className="input-select" value={detailedInput.district} disabled={!detailedInput.city} onChange={(event) => setDetailedInput({ ...detailedInput, district: event.target.value, neighborhood: '', apartment: '', dong: '' })}>
                        <option value="">시·군·구 선택</option>
                        {detailedInput.city && Object.keys(locationData[detailedInput.city]).map((district) => <option key={district} value={district}>{district}</option>)}
                      </select>
                      <select className="input-select" value={detailedInput.neighborhood} disabled={!detailedInput.district} onChange={(event) => setDetailedInput({ ...detailedInput, neighborhood: event.target.value })}>
                        <option value="">동 선택</option>
                        {detailedInput.city && detailedInput.district && locationData[detailedInput.city][detailedInput.district].map((dong) => <option key={dong} value={dong}>{dong}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="아파트명 입력" className="p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50" value={detailedInput.apartment} onChange={(event) => setDetailedInput({ ...detailedInput, apartment: event.target.value })} />
                      <input type="text" placeholder="동·호 선택" className="p-2.5 rounded-xl border border-slate-200" value={detailedInput.dong} onChange={(event) => setDetailedInput({ ...detailedInput, dong: event.target.value })} />
                    </div>
                    <button onClick={runDetailedSearch} disabled={!detailedInput.neighborhood} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none">
                      분석 시작
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-slate-800 font-bold text-lg"><TrendingUp size={20} className="text-emerald-600" /> 개발·정책 테마</h4>
                    <div className="flex flex-wrap gap-2">
                      {['재건축', '재개발', 'GTX 노선', '신도시', '지하철 연장', '기업 유치', '학군 이슈'].map((tag) => (
                        <button key={tag} onClick={() => { const q = `${tag} 관련 분석`; setSearchQuery(q); setIsDetailedSearchOpen(false); startAnalysis(q); }} className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-all font-bold text-sm">
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-slate-800 font-bold text-lg"><Home size={20} className="text-amber-600" /> 브랜드 아파트 퀵서치</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['자이', '래미안', '푸르지오', '힐스테이트', 'e편한세상', '아이파크'].map((brand) => (
                        <button key={brand} onClick={() => setSearchQuery(brand)} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-left hover:bg-amber-50 hover:border-amber-200 transition-all flex items-center justify-between group font-bold text-sm">
                          {brand}<ChevronRight size={14} className="text-slate-300 group-hover:text-amber-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-[500px]">
                  <div className="relative mb-8">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-100 flex items-center justify-center relative overflow-hidden">
                      <motion.div className="absolute bottom-0 left-0 right-0 bg-blue-500/10" initial={{ height: 0 }} animate={{ height: `${analysisProgress}%` }} />
                      <span className="text-2xl font-bold text-blue-600 z-10">{Math.round(analysisProgress)}%</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">실제 데이터 분석 중...</h3>
                  <p className="text-slate-500 mb-8 text-sm">실거래가, 검색 근거, 리스크 지표를 대조하고 있습니다.</p>
                  <div className="w-full max-w-md bg-slate-100 h-1.5 rounded-full overflow-hidden mb-10">
                    <motion.div className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" animate={{ width: `${analysisProgress}%` }} transition={{ type: 'spring', damping: 20, stiffness: 50 }} />
                  </div>
                  <div className="w-fit flex flex-col gap-3">
                    {(currentPlan?.steps || []).map((step, index) => (
                      <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: index <= analysisStep ? 1 : 0.4, x: 0, color: index === analysisStep ? '#2563eb' : (index < analysisStep ? '#16a34a' : '#64748b') }} className="flex items-center gap-4 text-base font-bold">
                        {index < analysisStep ? <CheckCircle2 size={18} className="text-emerald-500" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                        {step}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  {analysisResult ? (
                    <ReportErrorBoundary><AnalysisReport result={analysisResult} mode={activeTab} /></ReportErrorBoundary>
                  ) : (
                    <>
                      {activeTab === 'dashboard' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="col-span-full mb-4">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">반갑습니다, <span className="text-blue-600">Master !</span></h2>
                            <p className="text-slate-500">오늘은 어떤 부동산 데이터를 정밀 분석해볼까요?</p>
                          </div>

                          {analysisError && <div className="col-span-full p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm font-bold">실제 데이터 분석 실패: {analysisError}</div>}

                          {dashboardCards.map((card, index) => (
                            <div key={index} className="card hover:shadow-md transition-all cursor-pointer border border-slate-200">
                              <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${card.bg}`}><card.icon size={20} className={card.color} /></div>
                                <ChevronRight size={18} className="text-slate-400" />
                              </div>
                              <p className="text-sm text-slate-500 font-medium mb-1">{card.label}</p>
                              <h3 className="text-2xl font-bold text-slate-800 mb-1">{card.value}</h3>
                              <p className="text-xs text-slate-400">{card.sub}</p>
                            </div>
                          ))}

                          <div className="col-span-full mt-8 space-y-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2"><ShieldCheck size={24} className="text-blue-600" /> AI 실시간 리스크 엔진 작동 중</h4>
                              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">Live Scan: Active</span>
                            </div>
                            <div className="p-5 rounded-[24px] border border-slate-200 bg-white shadow-sm flex items-center justify-between gap-4">
                              <p className="text-sm text-slate-600 font-bold">실시간 위험 단지와 가격 신호는 <span className="text-red-600">위험 신호 감지</span>에서 실제 스캔 데이터로 확인합니다.</p>
                              <button onClick={() => setShowRiskGuide(true)} className="shrink-0 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors">위험 신호 열기</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab !== 'dashboard' && (() => {
                        const ActiveIcon = menuItems.find((item) => item.id === activeTab)?.icon || Home;
                        return (
                          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6"><ActiveIcon size={40} className="text-slate-400" /></div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{menuItems.find((item) => item.id === activeTab)?.label} 모듈 준비 중</h3>
                            <p className="text-slate-500 max-w-sm">상단 검색창에 분석할 대상을 입력하면 실제 데이터 기반 분석이 시작됩니다.</p>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <footer className="mt-auto p-8 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold tracking-widest bg-white">
            <div>© 2026 Real Estate Master Analyst System</div>
            <div className="flex gap-6"><span>Last Updated: 2026.05.06</span><span>Region: KR-SEOUL</span></div>
          </footer>
        </main>
      </div>
    </>
  );
};

export default App;
