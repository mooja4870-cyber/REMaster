import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, TrendingUp, TrendingDown, ExternalLink, MapPin, ShieldCheck, FileText, Info, ChevronDown, ChevronUp, Search, Download, Printer, Clock } from 'lucide-react';
import { version } from '../../package.json';

const AnalysisReport = ({ result, mode = 'dashboard' }) => {
  const [showRentals, setShowRentals] = useState(false);
  const [openFactorIdx, setOpenFactorIdx] = useState(null);
  if (!result) return null;

  const isAll = mode === 'dashboard';
  const showLoc = isAll || mode === 'apartment';
  const showPrice = isAll || mode === 'market';
  const showPolicy = isAll || mode === 'policy';
  const showVilla = isAll || mode === 'villa';
  const showRisk = isAll || mode === 'factcheck';

  // Helper for safe data access
  const d = result.data || {};
  const guide = result.decisionGuide || d.decisionGuide || {};
  const macro = result.macroIndicators || {};
  const marketTemperature = macro.marketTemperature || {};
  const marketTempScore = Number(marketTemperature.score) || 0;
  const priceRiskFactors = macro.riskFactors || result.aiForecast?.riskFactors || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 pb-20 text-[var(--fg1)] font-sans">
      {/* 1. PDF Report Cover Page (Print Only) */}
      <div className="print-only-cover no-print-hidden">
        <div className="cover-header">
          <div className="logo-box">RE</div>
          <div className="brand-name">REAL ESTATE MASTER ANALYST</div>
        </div>
        <div className="cover-title-wrap">
          <p className="subtitle">ARTIFICIAL INTELLIGENCE INVESTMENT REPORT</p>
          <h1 className="main-title">{result.summary}</h1>
          <div className="target-location">
             <MapPin size={24} className="text-blue-500" />
             <span>{result.rank?.region || '대한민국 주요 권역'} 정밀 입지 분석</span>
          </div>
        </div>
        <div className="cover-footer">
          <div className="info-grid">
            <div className="info-item">
              <span className="label">DATE</span>
              <span className="value">{new Date().toLocaleDateString('ko-KR')}</span>
            </div>
            <div className="info-item">
              <span className="label">PREPARED BY</span>
              <span className="value">AI Analyst Engine v{version}</span>
            </div>
            <div className="info-item">
              <span className="label">CONFIDENCE</span>
              <span className="value">{result.aiForecast?.confidence || '실 데이터 생성 지연'}</span>
            </div>
          </div>
          <p className="copyright">© 2026 Real Estate Master Analyst. All Rights Reserved.</p>
        </div>
      </div>

      {/* PDF Print Header (Logo - appears on every page except cover) */}
      <div className="print-only-header">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-[10px]">RE</div>
          <span className="text-sm font-bold text-slate-800 tracking-tight">RE Master Intelligence Report</span>
        </div>
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{result.summary}</div>
      </div>
      
      {/* 2. Report Hero */}
      <div className="report-hero">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-white">{result.summary}</h1>
            <div className="meta">
              <span><MapPin size={14} className="inline mr-1" /> {result.rank?.region || '분석 권역'}</span>
              <span><b>분석 신뢰도:</b> {result.aiForecast?.confidence || '실 데이터 생성 지연'}</span>
              <span><Clock size={14} className="inline mr-1 ml-2" /> <b>데이터 기준일:</b> {new Date().toLocaleString('ko-KR')}</span>
            </div>
          </div>
          <button 
            onClick={handlePrint}
            className="no-print bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-500/20"
          >
            <Printer size={18} /> 전문 PDF 리포트 다운로드
          </button>
        </div>
        
        {/* Search Log Banner (Transparent search banner) */}
        <div className="search-banner bg-white/10 border-white/20 text-white mt-4">
          <div className="header text-white"><Search size={16} /> 딥 실시간 검색 로그</div>
          <ol className="text-white/80">
            {result.searchLog && result.searchLog.map((log, i) => (
              <li key={i} className="mb-1">
                <code>{log.query}</code> {log.result}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {result.systemWarnings && result.systemWarnings.length > 0 && (
        <div className="alert danger">
          <AlertCircle className="icon" />
          <div className="body">
            <strong>시스템 경고</strong>
            {result.systemWarnings.map((w, i) => <div key={i}>{w}</div>)}
          </div>
        </div>
      )}

      {/* 2. Key Insights Row */}
      {showPrice && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <span className="text-xs font-bold text-[var(--fg3)] uppercase block mb-3">AI 6개월 가격 예측</span>
            <div className="flex justify-between items-end">
              <span className={`text-3xl font-black ${result.aiForecast?.prediction6m?.startsWith('+') ? 'text-[var(--color-bull)]' : 'text-[var(--color-bear)]'}`}>
                {result.aiForecast?.prediction6m || '실 데이터 생성 지연'}
              </span>
            </div>
          </div>
          <div className="card">
            <span className="text-xs font-bold text-[var(--fg3)] uppercase block mb-3">현재 시장 온도</span>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-black">{marketTempScore}점</span>
              <span className={`badge ${marketTemperature.trend === 'Rising' ? 'badge-양호' : 'badge-주의'}`}>
                {marketTemperature.status || '확인 필요'}
              </span>
            </div>
            <div className="score-bar medium mt-3"><div style={{ width: `${marketTempScore}%` }} /></div>
          </div>
          <div className="card">
            <span className="text-xs font-bold text-[var(--fg3)] uppercase block mb-3">핵심 리스크 요인</span>
            <div className="text-lg font-bold">{priceRiskFactors?.[0] || '실 데이터 생성 지연'}</div>
            <div className="text-sm text-[var(--fg2)] mt-1">{priceRiskFactors?.[1] || '지연 상황 없음'}</div>
          </div>
        </div>
      )}

      {/* Naver Real-time Asking Prices */}
      {showPrice && d.naverAskings && d.naverAskings.length > 0 && (
        <div className="card border-l-4 border-green-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-bold flex items-center gap-2">
              <ExternalLink size={16} className="text-green-600" />
              네이버 부동산 실시간 호가 (Asking Price)
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live Scraped Data</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {d.naverAskings.map((item, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded border border-slate-100">
                <div className="text-sm font-black text-slate-800 mb-1">{item.price}</div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>{item.floor}</span>
                  <span className="text-green-600 font-bold">네이버 매물</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-2 line-clamp-2">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Locational Score (10대 핵심 입지 요소) */}
      {showLoc && result.locationFactors && (
        <div className="card">
          <div className="card-title">
            <div className="num">1</div>
            10대 핵심 입지 요소 정밀 평가
          </div>
          
          <div className="score-ring-wrap mb-6">
            <div className="score-ring">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="60" fill="none" stroke="var(--color-border)" strokeWidth="12" />
                <circle cx="70" cy="70" r="60" fill="none" stroke="var(--color-blue)" strokeWidth="12" strokeDasharray={`${(result.score / 100) * 377} 377`} strokeLinecap="round" />
              </svg>
              <div className="center">
                <div className="num">{result.score}</div>
                <div className="of">out of 100</div>
              </div>
            </div>
            <div className="score-ring-info">
              <div className="grade">종합 등급: {result.grade}</div>
              <div className="desc">{d.decisionGuide?.rationale || result.summary}</div>
            </div>
          </div>

          <div className="score-grid">
            {result.locationFactors.map((factor, idx) => (
              <div key={idx} className="border border-[var(--color-border)] rounded-md overflow-hidden cursor-pointer" onClick={() => setOpenFactorIdx(openFactorIdx === idx ? null : idx)}>
                <div className="score-item hover:bg-[var(--color-bg)] transition-colors">
                  <div className="icon">
                    {factor.label === '교통' && '🚇'}
                    {factor.label === '학군' && '🏫'}
                    {factor.label === '인프라' && '🛒'}
                    {factor.label === '규모' && '🏢'}
                    {factor.label === '브랜드' && '✨'}
                    {factor.label === '연식' && '🏗️'}
                    {factor.label === '환경' && '🌳'}
                    {factor.label === '호재' && '🚀'}
                    {factor.label === '수급' && '⚖️'}
                    {factor.label === '규제' && '📜'}
                  </div>
                  <div className="label">
                    {factor.label}
                    <div className="text-[10px] text-[var(--fg3)] truncate">{factor.desc}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="score">{factor.score}<span className="of">/{factor.max}</span></div>
                    {openFactorIdx === idx ? <ChevronUp size={16} className="text-[var(--fg3)]" /> : <ChevronDown size={16} className="text-[var(--fg3)]" />}
                  </div>
                  <div className={`score-bar ${factor.score / factor.max >= 0.8 ? 'high' : factor.score / factor.max >= 0.6 ? 'medium' : 'low'}`}>
                    <div style={{ width: `${(factor.score / factor.max) * 100}%` }} />
                  </div>
                </div>
                
                <AnimatePresence>
                  {openFactorIdx === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 bg-white border-t border-[var(--color-border-subtle)] text-sm text-[var(--fg2)] leading-relaxed">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`badge ${factor.score / factor.max >= 0.8 ? 'badge-우수' : factor.score / factor.max >= 0.6 ? 'badge-양호' : 'badge-주의'}`}>
                            {factor.score / factor.max >= 0.8 ? '우수' : factor.score / factor.max >= 0.6 ? '양호' : '주의'}
                          </span>
                        </div>
                        {factor.reason || `${factor.label} 분석 코멘트가 준비 중입니다.`}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Fact Check & Risk Matrix */}
      {showRisk && d.factCheck && (
        <div className="card">
          <div className="card-title">
            <div className="num">2</div>
            팩트체크 및 리스크 매트릭스
          </div>
          
          <div className="mb-8">
            <h3 className="text-md font-bold mb-4">루머/호재 팩트체크 검증</h3>
            {d.factCheck.map((fc, i) => (
              <div key={i} className={`fact-check-card ${fc.status === 'CONFIRMED' ? '' : fc.status === 'IN PROGRESS' ? 'is-progress' : 'is-false'}`}>
                <div className="fc-header">
                  <div className="fc-claim">{fc.topic}</div>
                  <div className={`fc-tag ${fc.status === 'CONFIRMED' ? 'fc-confirmed' : fc.status === 'IN PROGRESS' ? 'fc-progress' : 'fc-unconfirmed'}`}>
                    {fc.status}
                  </div>
                </div>
                <div className="fc-row">
                  <div className="label">세부 내용</div>
                  <div className="value">{fc.detail}</div>
                </div>
                <div className="fc-row">
                  <div className="label">검증 출처</div>
                  <div className="value"><span className="src-tag level-1">{fc.source}</span></div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-md font-bold mb-4">종합 리스크 매트릭스</h3>
            <div className="border border-[var(--color-border)] rounded-lg">
              {d.riskMatrix?.map((risk, i) => (
                <div key={i} className="risk-row">
                  <div className={`dot ${risk.level === '높음' ? 'high' : risk.level === '낮음' ? 'low' : 'medium'}`} />
                  <div className="type">{risk.type}</div>
                  <div className={`level ${risk.level === '높음' ? 'high' : risk.level === '낮음' ? 'low' : 'medium'}`}>{risk.level}</div>
                  <div className="desc">{risk.desc} <span className="text-xs text-[var(--fg3)] ml-2">대응: {risk.strategy}</span></div>
                </div>
              ))}
            </div>
          </div>

          {d.dueDiligence && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={18} className="text-blue-600" />
                <h3 className="text-md font-bold text-slate-800">대법원 등기부/권리분석 팩트체크</h3>
              </div>
              <div className={`p-4 rounded-lg border-2 mb-4 ${d.dueDiligence.verdict === '안전' ? 'bg-blue-50 border-blue-200' : d.dueDiligence.verdict === '주의' ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Due Diligence Verdict</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${d.dueDiligence.verdict === '안전' ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white'}`}>
                    {d.dueDiligence.verdict}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-800 leading-relaxed mb-3">
                  {d.dueDiligence.summary}
                </div>
                {d.dueDiligence.risks && d.dueDiligence.risks.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {d.dueDiligence.risks.map((risk, i) => (
                      <span key={i} className="text-[10px] px-2 py-1 bg-white/50 border border-current/20 rounded text-slate-600 flex items-center gap-1">
                        <AlertCircle size={10} /> {risk}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 italic">
                * 위 분석은 최근 3개월간의 경매/압류/공고 데이터 및 실시간 뉴스 검색 결과를 기반으로 한 AI 추정치입니다. 실제 권리 관계는 반드시 유료 등기부등본을 발급받아 확인하시기 바랍니다.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. Investment Decision Guide */}
      {guide && (guide.verdict || guide.rationale) && (
        <div className="card">
          <div className="card-title">
            <div className="num">3</div>
            최종 투자의사결정 가이드
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1 bg-[var(--color-bg-subtle)] p-6 rounded-lg">
              <div className="text-xs font-bold text-[var(--fg3)] mb-2">AI INVESTMENT VERDICT</div>
              <div className="text-2xl font-bold mb-2">
                <span style={{ fontSize: '77%', display: 'inline-block', color: '#334155' }}>{guide.verdict || '판정 대기 (실 데이터 지연)'}</span>
              </div>
              <div className="stars mb-4">{Array.from({ length: 5 }).map((_, i) => (<span key={i} className={i < Math.floor(guide.stars || 4) ? '' : 'empty'}>★</span>))}</div>
              <p className="text-sm text-[var(--fg2)] leading-relaxed">
                <span style={{ fontSize: '77%', display: 'inline-block' }}>{guide.rationale}</span>
              </p>
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-[var(--fg3)] mb-3 uppercase">Recommended Price Action</div>
              <div className="price-recommend">
                <div className="price-tier aggressive">
                  <div className="label">적극매수</div>
                  <div className="amt">{guide.targetPrice?.split('~')[0] || '-'}</div>
                </div>
                <div className="price-tier fair">
                  <div className="label">적정가</div>
                  <div className="amt">{guide.fairPrice || '-'}</div>
                </div>
                <div className="price-tier cap">
                  <div className="label">상투위험</div>
                  <div className="amt">{guide.ceilingPrice || '-'}</div>
                </div>
                <div className="price-tier stop">
                  <div className="label">손절라인</div>
                  <div className="amt">{guide.stopLoss || '-'}</div>
                </div>
              </div>
            </div>
          </div>
          
          {d.scenarioAnalysis && (
            <>
              <h3 className="text-md font-bold mb-3 mt-8">시나리오별 가격 변동 예측</h3>
              <div className="scenario-grid">
                {d.scenarioAnalysis.map((sc, i) => (
                  <div key={i} className={`scenario-card ${sc.type === '상승' || sc.type === '낙관' ? 'optimistic' : sc.type === '하락' || sc.type === '비관' ? 'pessimistic' : 'neutral'}`}>
                    <div className="head">
                      <div className="name">{sc.type}적 시나리오</div>
                    </div>
                    <div className="delta">
                      <span style={{ 
                        fontSize: '77%', 
                        display: 'inline-block',
                        color: (sc.type === '상승' || sc.type === '낙관') ? '#2563eb' : (sc.type === '하락' || sc.type === '비관' ? '#dc2626' : '#64748b')
                      }}>{sc.impact}</span>
                    </div>
                    <div className="price">예상가: {sc.price}</div>
                    <div className="conditions">{sc.condition}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Disclaimers */}
      <div className="disclaimer mt-4">
        <strong>법적 고지 (Disclaimer)</strong>
        본 시스템에서 제공하는 모든 부동산 분석 자료 및 가격 예측 데이터는 AI 모델에 의해 산출된 추정치이며, 실제 시장 상황과 다를 수 있습니다. 투자 결정은 본인의 판단과 책임하에 이루어져야 하며, 본 서비스는 어떠 어떠한 투자 결과에 대해서도 법적 책임을 지지 않습니다. 교차 검증을 위해 반드시 공인된 기관의 공부서류(등기부등본 등)를 확인하시기 바랍니다.
      </div>
    </div>
  );
};

export default AnalysisReport;
