import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronRight,
  FileText,
  Home,
  Info,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  TrendingUp,
  X
} from 'lucide-react';

import { locationData } from './data/locationData';
import { planSearch, fetchRealAiAnalysis } from './logic/SearchOrchestrator';
import { validateResult } from './logic/AnalysisHarness';
import AnalysisReport from './components/AnalysisReport';
import WelcomeGuide from './components/WelcomeGuide';
import LoanSimulator from './components/LoanSimulator';
import RiskSignalGuide from './components/RiskSignalGuide';
import MarketTrendChart from './components/MarketTrendChart';
import { version } from '../package.json';

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
          <h3 className="mb-2 text-xl font-bold text-slate-800">분석 리포트 렌더링 오류</h3>
          <p className="mb-6 text-sm text-slate-600">
            리포트 출력 중 오류가 발생했습니다: {this.state.error?.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-md bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const menuItems = [
  { id: 'dashboard', label: '종합 대시보드', icon: Home },
  { id: 'apartment', label: '아파트 입지 분석', icon: MapPin },
  { id: 'market', label: '시세·전망 분석', icon: TrendingUp },
  { id: 'policy', label: '정부 정책 분석', icon: FileText },
  { id: 'villa', label: '빌라·전세 분석', icon: Home },
  { id: 'factcheck', label: '팩트체크 & 리스크', icon: ShieldCheck }
];

const themeTags = ['재건축', '재개발', 'GTX 노선', '역세권', '지하철 연장', '기업 유치', '학군 이슈'];
const brandTags = ['래미안', '자이', '힐스테이트', '푸르지오', 'e편한세상', '아이파크'];

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <motion.button
    type="button"
    whileHover={{ x: 5 }}
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
      active
        ? 'border border-pink-200 bg-pink-50 text-rose-700'
        : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
    }`}
  >
    <Icon size={20} />
    <span className="text-sm font-bold tracking-tight">{label}</span>
  </motion.button>
);

const ModalShell = ({ children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/40 bg-white/85 shadow-2xl backdrop-blur-xl"
    >
      <button
        onClick={onClose}
        className="absolute right-8 top-8 z-50 rounded-full bg-white/70 p-2 text-slate-800 transition-colors hover:bg-white"
        aria-label="닫기"
      >
        <X size={24} />
      </button>
      <div className="flex-1 overflow-y-auto p-8 md:p-12">{children}</div>
    </motion.div>
  </motion.div>
);

const listFrom = (...sources) => {
  for (const source of sources) {
    const values = Array.isArray(source) ? source : (source ? [source] : []);
    const normalized = values
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (!item || typeof item !== 'object') return '';
        return String(item.title || item.label || item.desc || item.description || item.factor || item.type || '').trim();
      })
      .filter(Boolean);

    if (normalized.length > 0) return normalized.slice(0, 4);
  }

  return [];
};

const SwotAnalysisPanel = ({ result }) => {
  const data = result?.data || {};
  const swot = result?.swot || data.swot || {};
  const hasResult = Boolean(result);
  const strengths = listFrom(swot.strengths, swot.s, data.pros, result?.pros, [
    '입지, 실거래, 시세 데이터를 기반으로 강점을 정리합니다.'
  ]);
  const weaknesses = listFrom(swot.weaknesses, swot.w, data.cons, result?.cons, [
    '가격 부담, 유동성, 상품성 약점을 점검합니다.'
  ]);
  const opportunities = listFrom(swot.opportunities, swot.o, result?.aiForecast?.drivers, data.aiForecast?.drivers, [
    '개발 호재, 수급 개선, 금리 변화 가능성을 확인합니다.'
  ]);
  const threats = listFrom(
    swot.threats,
    swot.t,
    result?.aiForecast?.riskFactors,
    data.aiForecast?.riskFactors,
    result?.macroIndicators?.riskFactors,
    data.riskMatrix,
    ['규제, 금리, 전세가율, 거래량 위험 신호를 감시합니다.']
  );

  const quadrants = [
    { key: 's', title: 'Strengths', label: '강점', items: strengths, className: 'swot-s' },
    { key: 'w', title: 'Weaknesses', label: '약점', items: weaknesses, className: 'swot-w' },
    { key: 'o', title: 'Opportunities', label: '기회', items: opportunities, className: 'swot-o' },
    { key: 't', title: 'Threats', label: '위협', items: threats, className: 'swot-t' }
  ];

  const strategyCards = [
    { title: 'SO 전략', text: '강점과 기회가 함께 확인되면 목표가 이하 분할 매수 구간을 좁혀 봅니다.' },
    { title: 'WO 전략', text: '약점은 협상 카드로 전환하고, 보수적 적정가와 수리비를 함께 반영합니다.' },
    { title: 'ST 전략', text: '강점이 있어도 위협이 크면 LTV와 DSR 여유를 먼저 확보합니다.' },
    { title: 'WT 전략', text: '약점과 위협이 겹치면 관망 기준, 손절 기준, 재검토 날짜를 명확히 둡니다.' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-500 text-white shadow-lg shadow-pink-200">
          <BarChart3 size={24} />
        </div>
        <div>
          <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-pink-500">Decision Intelligence</p>
          <h2 className="text-3xl font-black text-rose-950">SWOT분석</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            분석 결과의 강점, 약점, 기회, 위협을 매수 판단용 체크리스트로 재정리합니다.
          </p>
        </div>
      </div>

      {!hasResult && (
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="rounded-2xl border border-pink-100 bg-pink-50/70 p-5 text-center text-sm font-bold leading-6 text-rose-800 shadow-sm shadow-pink-100"
        >
          먼저 상단 검색창에서 단지명 또는 지역을 분석해 주세요. 분석 결과가 생성되면 SWOT 항목과 실행 전략이 자동으로 채워집니다.
        </motion.div>
      )}

      <div className="swot-grid">
        {quadrants.map((quad) => (
          <div key={quad.key} className={`swot-quad ${quad.className}`}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="label">{quad.title}</div>
                <h3 className="text-lg font-black text-slate-800">{quad.label}</h3>
              </div>
            </div>
            <ul>
              {quad.items.map((item, index) => (
                <li key={`${quad.key}-${index}`}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {strategyCards.map((card) => (
          <div key={card.title} className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm">
            <h4 className="mb-2 text-sm font-black text-rose-900">{card.title}</h4>
            <p className="text-sm font-semibold leading-6 text-slate-600">{card.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(true);
  const [showSwotModal, setShowSwotModal] = useState(false);
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
  const [detailedInput, setDetailedInput] = useState({
    city: '',
    district: '',
    neighborhood: '',
    apartment: '',
    dong: ''
  });

  const rawCounts = analysisResult?.realDataMeta?.molit?.rawCounts || {};
  const molitMeta = analysisResult?.realDataMeta?.molit;
  const isApartmentEvidence = molitMeta?.assetType === 'apartment';
  const isVillaEvidence = molitMeta?.assetType === 'villa';
  const sourceEvidence = [
    { label: '국토교통부 아파트 매매 실거래가', active: isApartmentEvidence && rawCounts.trade > 0 },
    { label: '국토교통부 아파트 전월세 실거래가', active: isApartmentEvidence && rawCounts.rent > 0 },
    { label: '국토교통부 연립·다세대 매매 실거래가', active: isVillaEvidence && rawCounts.trade > 0 },
    { label: '국토교통부 연립·다세대 전월세 실거래가', active: isVillaEvidence && rawCounts.rent > 0 }
  ];

  useEffect(() => {
    let cancelled = false;
    const loadHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        if (!cancelled && response.ok) setSystemHealth(data);
      } catch (error) {
        if (!cancelled) setSystemHealth(null);
      }
    };
    loadHealth();
    return () => {
      cancelled = true;
    };
  }, []);

  const enabledMolitServices = systemHealth?.molitServices
    ? Object.values(systemHealth.molitServices).filter(Boolean).length
    : 0;

  const dashboardCards = [
    {
      label: 'API 서버 상태',
      value: systemHealth?.ok ? '정상' : '확인 필요',
      sub: systemHealth ? `Gemini: ${systemHealth.geminiGrounding ? '연동' : '미연동'}` : '상태 체크 대기',
      color: systemHealth?.ok ? 'text-emerald-600' : 'text-amber-600',
      bg: systemHealth?.ok ? 'bg-emerald-50' : 'bg-amber-50',
      icon: Activity
    },
    {
      label: '국토부 실거래 API',
      value: `${enabledMolitServices}개`,
      sub: '활성 서비스 기준',
      color: 'text-pink-600',
      bg: 'bg-pink-50',
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
    const normalized = query.trim();
    if (!normalized) return;

    const plan = planSearch(normalized);
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
        const rawResult = await fetchRealAiAnalysis(normalized, plan.type);
        clearInterval(progressTimer);
        setAnalysisProgress(100);
        setAnalysisStep(totalSteps - 1);

        let validation = { issues: [] };
        try {
          validation = validateResult(rawResult);
        } catch (error) {
          console.warn('[AnalysisHarness] Validation failed.', error);
        }

        const finalResult = {
          ...rawResult,
          decisionGuide: rawResult.decisionGuide || rawResult.data?.decisionGuide || {},
          systemWarnings: validation.issues
        };

        const targetTab = plan.type === 'VILLA_ANALYSIS'
          ? 'villa'
          : plan.type === 'APARTMENT_ANALYSIS'
            ? 'apartment'
            : 'dashboard';

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
    const query = [
      detailedInput.city,
      detailedInput.district,
      detailedInput.neighborhood,
      detailedInput.apartment,
      detailedInput.dong
    ].filter(Boolean).join(' ');
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
        {showSwotModal && (
          <ModalShell onClose={() => setShowSwotModal(false)}>
            <SwotAnalysisPanel result={analysisResult} />
          </ModalShell>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoanModal && (
          <ModalShell onClose={() => setShowLoanModal(false)}>
            <LoanSimulator />
          </ModalShell>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRiskGuide && (
          <ModalShell onClose={() => setShowRiskGuide(false)}>
            <RiskSignalGuide />
          </ModalShell>
        )}
      </AnimatePresence>

      <div className="re-app-shell relative flex h-screen min-h-0 overflow-hidden font-sans text-[#0f2040]">
        <div className="re-dot-pattern" />

        <aside className="z-20 flex h-screen min-h-0 w-72 shrink-0 flex-col gap-6 overflow-y-auto overflow-x-hidden border-r border-white/60 bg-white/70 px-6 py-5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500 shadow-lg shadow-pink-200">
              <TrendingUp size={21} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-rose-950">RE Master</h1>
              <p className="text-[12px] font-bold uppercase tracking-widest text-pink-400">AI Analyst v{version}</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1.5">
            <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Main Menu</p>
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
              onClick={() => setShowSwotModal(true)}
              className="mb-1.5 flex w-full items-center justify-between rounded-xl border border-pink-100 bg-white/60 px-3 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-pink-50"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-pink-100 p-1.5 text-pink-600"><BarChart3 size={15} /></div>
                SWOT분석
              </div>
              <ChevronRight size={14} className="text-slate-400" />
            </button>

            <button
              onClick={() => setShowRiskGuide(true)}
              className="mb-1.5 flex w-full items-center justify-between rounded-xl border border-red-100 bg-white/60 px-3 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-red-50"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-100 p-1.5 text-red-500"><AlertTriangle size={15} /></div>
                위협신호 감시
              </div>
              <ChevronRight size={14} className="text-slate-400" />
            </button>

            <button
              onClick={() => setShowLoanModal(true)}
              className="mb-1.5 flex w-full items-center justify-between rounded-xl border border-pink-100 bg-white/60 px-3 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-pink-50"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-pink-100 p-1.5 text-pink-600"><Calculator size={15} /></div>
                대출 한도·이자
              </div>
              <ChevronRight size={14} className="text-slate-400" />
            </button>

            <button
              onClick={() => setShowWelcomeGuide(true)}
              className="mb-3 flex w-full items-center justify-between rounded-xl border border-pink-100 bg-white/60 px-3 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-pink-50"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-pink-100 p-1.5 text-pink-600"><BookOpen size={15} /></div>
                사용 가이드
              </div>
              <ChevronRight size={14} className="text-slate-400" />
            </button>

            <div className="rounded-2xl border border-pink-100 bg-white/60 p-3">
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck size={16} className="text-pink-600" />
                <span className="text-xs font-bold uppercase text-rose-700">Pro System</span>
              </div>
              <div className="text-[10px] font-bold leading-relaxed text-rose-800/80">
                <div className="mb-2 text-pink-600">현재 리포트의 실데이터 근거:</div>
                <div className="space-y-1.5">
                  {sourceEvidence.map((source) => (
                    <div key={source.label} className="flex items-center gap-2">
                      <span className={`text-[11px] font-black ${source.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {source.active ? 'O' : 'X'}
                      </span>
                      <span className={`flex-1 ${source.active ? 'text-rose-800' : 'text-slate-400'}`}>{source.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="relative flex-1 overflow-y-auto bg-transparent">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/60 bg-white/70 px-8 py-4 shadow-sm backdrop-blur-xl">
            <div className="relative flex max-w-2xl flex-1 items-center gap-2">
              <div className="group relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-pink-500" size={18} />
                <input
                  type="text"
                  placeholder="단지명, 지역, 개발 호재를 입력하세요"
                  className="w-full rounded-2xl border border-pink-100 bg-white/80 py-3 pl-12 pr-12 text-sm text-slate-800 shadow-inner transition-all placeholder:text-slate-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={handleSearch}
                />
                <button
                  onClick={() => startAnalysis(searchQuery)}
                  disabled={!searchQuery.trim() || isAnalyzing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-pink-500 p-2 text-white shadow-md transition-all hover:bg-pink-600 disabled:opacity-50 active:scale-95"
                  aria-label="분석 시작"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <button
                onClick={() => setIsDetailedSearchOpen(!isDetailedSearchOpen)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${
                  isDetailedSearchOpen
                    ? 'border-pink-500 bg-pink-500 text-white shadow-lg shadow-pink-200'
                    : 'border-pink-100 bg-white/80 text-slate-600 shadow-sm hover:bg-pink-50'
                }`}
              >
                <Menu size={18} /> 상세 입력
              </button>
            </div>

            <div className="ml-auto flex items-center gap-6">
              <span className="hidden text-sm font-medium text-slate-500 md:block">
                반갑습니다, <span className="font-bold text-pink-600">Master!</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live: AI Analyst
              </span>
            </div>
          </header>

          <AnimatePresence>
            {isDetailedSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-white/60 bg-white/80 shadow-xl backdrop-blur-xl"
              >
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 p-8 md:grid-cols-3">
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                      <MapPin size={20} className="text-pink-600" /> 주소 정보 선택
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      <select
                        className="input-select"
                        value={detailedInput.city}
                        onChange={(event) => setDetailedInput({ city: event.target.value, district: '', neighborhood: '', apartment: '', dong: '' })}
                      >
                        <option value="">시·도 선택</option>
                        {Object.keys(locationData).map((city) => <option key={city} value={city}>{city}</option>)}
                      </select>
                      <select
                        className="input-select"
                        value={detailedInput.district}
                        disabled={!detailedInput.city}
                        onChange={(event) => setDetailedInput({ ...detailedInput, district: event.target.value, neighborhood: '', apartment: '', dong: '' })}
                      >
                        <option value="">시·군·구 선택</option>
                        {detailedInput.city && Object.keys(locationData[detailedInput.city]).map((district) => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                      <select
                        className="input-select"
                        value={detailedInput.neighborhood}
                        disabled={!detailedInput.district}
                        onChange={(event) => setDetailedInput({ ...detailedInput, neighborhood: event.target.value })}
                      >
                        <option value="">동 선택</option>
                        {detailedInput.city && detailedInput.district && locationData[detailedInput.city][detailedInput.district].map((dong) => (
                          <option key={dong} value={dong}>{dong}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="단지명 입력"
                        className="rounded-xl border border-pink-100 p-2.5 focus:border-pink-400 focus:ring-2 focus:ring-pink-50"
                        value={detailedInput.apartment}
                        onChange={(event) => setDetailedInput({ ...detailedInput, apartment: event.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="동/호 선택"
                        className="rounded-xl border border-pink-100 p-2.5"
                        value={detailedInput.dong}
                        onChange={(event) => setDetailedInput({ ...detailedInput, dong: event.target.value })}
                      />
                    </div>
                    <button
                      onClick={runDetailedSearch}
                      disabled={!detailedInput.neighborhood}
                      className="w-full rounded-xl bg-pink-500 py-3 font-bold text-white shadow-lg shadow-pink-100 transition-all hover:bg-pink-600 disabled:opacity-50 disabled:shadow-none"
                    >
                      분석 시작
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                      <TrendingUp size={20} className="text-emerald-600" /> 개발·정책 테마
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {themeTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            const q = `${tag} 관련 부동산 분석`;
                            setSearchQuery(q);
                            setIsDetailedSearchOpen(false);
                            startAnalysis(q);
                          }}
                          className="rounded-lg border border-pink-100 bg-white/70 px-3 py-1.5 text-sm font-bold text-slate-600 transition-all hover:border-pink-300 hover:text-pink-600"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                      <Home size={20} className="text-amber-600" /> 브랜드 아파트 검색
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {brandTags.map((brand) => (
                        <button
                          key={brand}
                          onClick={() => setSearchQuery(brand)}
                          className="group flex items-center justify-between rounded-xl border border-pink-100 bg-white/70 p-2.5 text-left text-sm font-bold transition-all hover:border-pink-200 hover:bg-pink-50"
                        >
                          {brand}
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-pink-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-[1] mx-auto max-w-7xl p-8">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[500px] flex-col items-center justify-center"
                >
                  <div className="relative mb-8">
                    <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white/80 bg-white/60 shadow-xl shadow-pink-100">
                      <motion.div className="absolute bottom-0 left-0 right-0 bg-pink-500/10" initial={{ height: 0 }} animate={{ height: `${analysisProgress}%` }} />
                      <span className="z-10 text-2xl font-bold text-pink-600">{Math.round(analysisProgress)}%</span>
                    </div>
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-slate-800">실제 데이터 분석 중...</h3>
                  <p className="mb-8 text-sm text-slate-500">실거래가, 검색 근거, 리스크 지표를 대조하고 있습니다.</p>
                  <div className="mb-10 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/70">
                    <motion.div className="h-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.45)]" animate={{ width: `${analysisProgress}%` }} transition={{ type: 'spring', damping: 20, stiffness: 50 }} />
                  </div>
                  <div className="flex w-fit flex-col gap-3">
                    {(currentPlan?.steps || []).map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                          opacity: index <= analysisStep ? 1 : 0.4,
                          x: 0,
                          color: index === analysisStep ? '#db2777' : (index < analysisStep ? '#16a34a' : '#64748b')
                        }}
                        className="flex items-center gap-4 text-base font-bold"
                      >
                        {index < analysisStep ? <CheckCircle2 size={18} className="text-emerald-500" /> : <div className="h-4 w-4 rounded-full border-2 border-current" />}
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
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                          <div className="re-dashboard-hero col-span-full">
                            <div className="max-w-3xl">
                              <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-pink-500">Real Estate Master Analyst</p>
                              <h2 className="mb-4 text-4xl font-black leading-tight text-rose-950 md:text-5xl">
                                지금 매수? 보류?<br />
                                AI가 말해주는 ‘정답’이 있습니다.
                              </h2>
                              <p className="max-w-2xl text-base font-medium leading-7 text-rose-700/80">
                                단지명, 지역, 개발 호재를 입력하면 실거래가와 시장 지표를 바탕으로 리포트를 생성합니다.
                              </p>
                            </div>
                          </div>

                          {analysisError && (
                            <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                              실제 데이터 분석 실패: {analysisError}
                            </div>
                          )}

                          {/* 컴팩트 상태 카드 (높이 33% 축소) */}
                          <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {dashboardCards.map((card, index) => (
                              <div key={index} className="re-frosted-panel flex items-center gap-4 p-3 rounded-2xl border border-white/60 shadow-sm transition-all hover:shadow-md cursor-pointer">
                                <div className={`rounded-xl p-2 ${card.bg} shrink-0`}><card.icon size={18} className={card.color} /></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{card.label}</p>
                                  <div className="flex items-baseline gap-2">
                                    <h3 className="text-lg font-black text-slate-800 truncate">{card.value}</h3>
                                    <p className="text-[10px] font-medium text-slate-400 truncate">{card.sub}</p>
                                  </div>
                                </div>
                                <ChevronRight size={14} className="text-slate-300 shrink-0" />
                              </div>
                            ))}
                          </div>

                          <div className="col-span-full">
                            <MarketTrendChart />
                          </div>

                          <div className="col-span-full mt-8 space-y-4">
                            <div className="mb-4 flex items-center justify-between">
                              <h4 className="flex items-center gap-2 text-xl font-bold text-slate-800">
                                <ShieldCheck size={24} className="text-pink-600" /> AI 실시간 리스크 엔진 작동 중
                              </h4>
                              <span className="animate-pulse text-xs font-bold uppercase tracking-widest text-slate-400">Live Scan: Active</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-[24px] border border-white/70 bg-white/75 p-5 shadow-sm">
                              <p className="text-sm font-bold text-slate-600">
                                실시간 위험 신호와 가격 이상 징후는 <span className="text-red-600">위험 신호 감지</span>에서 확인할 수 있습니다.
                              </p>
                              <button
                                onClick={() => setShowRiskGuide(true)}
                                className="shrink-0 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700"
                              >
                                위험 신호 열기
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab !== 'dashboard' && (() => {
                        const activeItem = menuItems.find((item) => item.id === activeTab);
                        const ActiveIcon = activeItem?.icon || Home;
                        return (
                          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/70 shadow-lg shadow-pink-100">
                              <ActiveIcon size={40} className="text-pink-400" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-slate-800">{activeItem?.label} 모듈 준비 중</h3>
                            <p className="max-w-sm text-slate-500">
                              상단 검색창에 분석 대상을 입력하면 실제 데이터 기반 분석을 시작합니다.
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

          <footer className="relative z-[1] mt-auto flex items-center justify-between border-t border-white/60 bg-white/60 p-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 backdrop-blur-xl">
            <div>© 2026 Real Estate Master Analyst System</div>
            <div className="flex gap-6"><span>Last Updated: 2026.05.06</span><span>Region: KR-SEOUL</span></div>
          </footer>
        </main>
      </div>
    </>
  );
};

export default App;
