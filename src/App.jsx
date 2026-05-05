import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, TrendingUp, ShieldCheck, Home, AlertTriangle, 
  FileText, Menu, X, ChevronRight, Info, Loader2, CheckCircle2, BookOpen
} from 'lucide-react';

import { planSearch, mockAnalysisResult, fetchRealAiAnalysis } from './logic/SearchOrchestrator';
import { validateResult } from './logic/AnalysisHarness';
import AnalysisReport from './components/AnalysisReport';
import WelcomeGuide from './components/WelcomeGuide';

// ErrorBoundary to catch rendering crashes in AnalysisReport
class ReportErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('[ReportErrorBoundary] AnalysisReport crashed:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="card border-l-4 border-red-500 bg-red-50 p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
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
    <span className="font-medium">{label}</span>
  </motion.div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);

  const menuItems = [
    { id: 'dashboard', label: '종합 대시보드', icon: Home },
    { id: 'apartment', label: '아파트 입지 분석', icon: MapPin },
    { id: 'market', label: '시세·전망 분석', icon: TrendingUp },
    { id: 'policy', label: '정부 정책 분석', icon: FileText },
    { id: 'villa', label: '빌라·다세대 분석', icon: Home },
    { id: 'factcheck', label: '팩트체크 & 리스크', icon: ShieldCheck },
  ];

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      startAnalysis(searchQuery);
    }
  };

  const startAnalysis = (query) => {
    const plan = planSearch(query);
    setCurrentPlan(plan);
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setAnalysisResult(null);

    let step = 0;
    const interval = setInterval(async () => {
      step++;
      if (step >= plan.steps.length) {
        clearInterval(interval);
        try {
          let rawResult;
          try {
            rawResult = await fetchRealAiAnalysis(query, plan.type);
          } catch (apiErr) {
            rawResult = mockAnalysisResult(query, plan.type);
          }
          
          let validation = { issues: [] };
          try { validation = validateResult(rawResult); } catch (valErr) {}
          
          const finalResult = {
            ...rawResult,
            decisionGuide: rawResult.decisionGuide || rawResult.data?.decisionGuide || {},
            systemWarnings: validation.issues
          };
          
          const targetTab = plan.type === 'VILLA_ANALYSIS' ? 'villa' : (plan.type === 'APARTMENT_ANALYSIS' ? 'apartment' : 'dashboard');
          
          setActiveTab(targetTab);
          setAnalysisResult(finalResult);
          setIsAnalyzing(false);
        } catch (err) {
          const fallbackResult = mockAnalysisResult(query, plan.type);
          const targetTab = plan.type === 'VILLA_ANALYSIS' ? 'villa' : (plan.type === 'APARTMENT_ANALYSIS' ? 'apartment' : 'dashboard');
          setActiveTab(targetTab);
          setAnalysisResult({
            ...fallbackResult,
            decisionGuide: fallbackResult.data?.decisionGuide || {},
            systemWarnings: [`⚠️ 분석 중 오류 발생: ${err.message}. 목업 데이터로 대체합니다.`]
          });
          setIsAnalyzing(false);
        }
      } else {
        setAnalysisStep(step);
      }
    }, 1200);
  };

  return (
    <>
      <AnimatePresence>
        {showWelcomeGuide && <WelcomeGuide onComplete={() => setShowWelcomeGuide(false)} />}
      </AnimatePresence>
      
      <div className="flex h-screen bg-[#f4f6fa] text-[#0f2040] overflow-hidden font-sans">
        {/* Sidebar */}
      <aside className="w-72 border-r border-[#e2e8f0] p-6 flex flex-col gap-8 bg-white shadow-sm z-20">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <TrendingUp size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#0f2040]">RE Master</h1>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-3 mb-2">Main Menu</p>
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>

        <div className="mt-auto">
          <button 
            onClick={() => setShowWelcomeGuide(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors mb-4 text-sm font-medium border border-slate-200"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
                <BookOpen size={16} />
              </div>
              사용 가이드
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </button>
          
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-600" />
                <span className="text-xs font-bold text-blue-600 uppercase">Pro System</span>
              </div>
            </div>
            <p className="text-xs text-blue-800/70 leading-relaxed">
              실시간 데이터 연동 및 다층 분석 엔진 가동 중
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[#f4f6fa]">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#e2e8f0] px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="단지명, 지역 또는 개발호재를 입력하세요..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 text-sm text-slate-800 shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <button
              onClick={() => startAnalysis(searchQuery)}
              disabled={!searchQuery.trim() || isAnalyzing}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-md"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-4 ml-8">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 font-bold uppercase">System Status</span>
              <span className="text-xs text-emerald-600 flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live: AI Analyst
              </span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[500px]"
              >
                <div className="relative mb-8">
                  <Loader2 size={64} className="text-blue-600 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">{Math.round((analysisStep / currentPlan.steps.length) * 100)}%</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-6">데이터 정밀 분석 중...</h3>
                
                <div className="w-full max-w-md flex flex-col gap-3">
                  {currentPlan.steps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ 
                        opacity: idx <= analysisStep ? 1 : 0.4, 
                        x: 0,
                        color: idx === analysisStep ? '#2563eb' : (idx < analysisStep ? '#16a34a' : '#64748b')
                      }}
                      className="flex items-center gap-3 text-sm font-medium"
                    >
                      {idx < analysisStep ? <CheckCircle2 size={16} className="text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-current" />}
                      {step}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {analysisResult ? (
                  <ReportErrorBoundary>
                    <AnalysisReport result={analysisResult} mode={activeTab} />
                  </ReportErrorBoundary>
                ) : (
                  <>
                    {activeTab === 'dashboard' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Hero Section */}
                        <div className="col-span-full mb-4">
                          <h2 className="text-3xl font-bold text-slate-800 mb-2">반갑습니다, 분석관님.</h2>
                          <p className="text-slate-500">오늘은 어떤 부동산 데이터를 정밀 분석해볼까요?</p>
                        </div>

                        {/* Summary Cards */}
                        {[
                          { label: '시장 동향', value: '상승 반전', sub: '강남구 실거래가 기준', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: TrendingUp },
                          { label: '입주 물량', value: '24,500세대', sub: '2026년 서울 예정', color: 'text-blue-600', bg: 'bg-blue-50', icon: Home },
                          { label: '금리 전망', value: '3.25%', sub: '한은 기준금리 동결', color: 'text-amber-600', bg: 'bg-amber-50', icon: Info },
                        ].map((card, idx) => (
                          <div key={idx} className="card hover:shadow-md transition-all cursor-pointer border border-slate-200">
                            <div className="flex justify-between items-start mb-4">
                              <div className={`p-3 rounded-2xl ${card.bg}`}>
                                <card.icon size={20} className={card.color} />
                              </div>
                              <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                            </div>
                            <p className="text-sm text-slate-500 font-medium mb-1">{card.label}</p>
                            <h3 className="text-2xl font-bold text-slate-800 mb-1">{card.value}</h3>
                            <p className="text-xs text-slate-400">{card.sub}</p>
                          </div>
                        ))}

                        {/* Fact Check Alert */}
                        <div className="col-span-full mt-4 p-6 rounded-3xl bg-amber-50 border border-amber-200 flex gap-4 items-center shadow-sm">
                          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                            <AlertTriangle className="text-amber-600" size={24} />
                          </div>
                          <div>
                            <h4 className="text-amber-700 font-bold">⚠️ 실시간 리스크 알림</h4>
                            <p className="text-sm text-amber-900/70">인천 서구 지역의 전세가율이 85%를 상회하고 있습니다. 깡통전세 리스크에 유의하시기 바랍니다.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab !== 'dashboard' && (() => {
                      const ActiveIcon = menuItems.find(i => i.id === activeTab).icon;
                      return (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                            <ActiveIcon size={40} className="text-slate-400" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-800 mb-2">{menuItems.find(i => i.id === activeTab).label} 모듈 준비 중</h3>
                          <p className="text-slate-500 max-w-sm">
                            현재 시스템 초기화 단계입니다. 상단 검색창에 분석을 원하는 대상을 입력하시면 분석 프로세스가 시작됩니다.
                          </p>
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
          <div className="flex gap-6">
            <span>Last Updated: 2026.05.05 13:15</span>
            <span>Region: KR-SEOUL</span>
          </div>
        </footer>
      </main>
      </div>
    </>
  );
};

export default App;
