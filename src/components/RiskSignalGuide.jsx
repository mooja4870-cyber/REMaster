import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, AlertTriangle, TrendingUp, Activity, ArrowUpRight, BarChart3, MapPin, Building2 } from 'lucide-react';

const RiskSignalGuide = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scanData, setScanData] = useState({
    jeonseAlerts: [],
    priceSpikes: [],
    volumeSignals: [],
    warnings: [],
    scannedRegions: 0,
    scanDate: ''
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('http://localhost:3001/api/risk-scan');
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || `Risk scan API ${response.status}`);
        }

        if (!cancelled) {
          setScanData({
            jeonseAlerts: Array.isArray(payload.jeonseAlerts) ? payload.jeonseAlerts : [],
            priceSpikes: Array.isArray(payload.priceSpikes) ? payload.priceSpikes : [],
            volumeSignals: Array.isArray(payload.volumeSignals) ? payload.volumeSignals : [],
            warnings: Array.isArray(payload.warnings) ? payload.warnings : [],
            scannedRegions: Number(payload.scannedRegions) || 0,
            scanDate: payload.scanDate || ''
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || '실시간 위험 신호 스캔에 실패했습니다.');
          setScanData({
            jeonseAlerts: [],
            priceSpikes: [],
            volumeSignals: [],
            warnings: [],
            scannedRegions: 0,
            scanDate: ''
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const totals = useMemo(() => ({
    jeonse: scanData.jeonseAlerts.length,
    spikes: scanData.priceSpikes.length,
    volume: scanData.volumeSignals.length
  }), [scanData]);

  const formatPrice = (value) => {
    const amount = Number(value) || 0;
    if (amount <= 0) return '-';
    const uk = Math.floor(amount / 10000);
    const man = amount % 10000;
    return man > 0 ? `${uk}억 ${man.toLocaleString()}만원` : `${uk}억원`;
  };

  const ratioClass = (ratio) => {
    if (ratio >= 90) return 'text-red-600';
    if (ratio >= 80) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const levelBlockClass = (level) => {
    if (level === 'critical') return 'bg-red-50 border-red-200';
    if (level === 'danger') return 'bg-amber-50 border-amber-200';
    return 'bg-emerald-50 border-emerald-200';
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-white p-4 rounded-[20px] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-200">
              <AlertTriangle size={16} className="text-white" />
            </div>
            위험 신호 감지 대시보드
          </h2>
          <p className="text-slate-500 mt-0.5 ml-10 text-[10px]">실거래가 기반 위험 신호 자동 스캔 결과</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold border border-red-100 flex items-center gap-1">
            <Activity size={10} /> LIVE 스캔
          </span>
          <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold border border-slate-200">
            {scanData.scanDate || '스캔 대기'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[16px] p-4 text-sm font-bold text-red-700">
          실시간 스캔 실패: {error}
        </div>
      )}

      {scanData.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-[16px] p-4 text-xs text-amber-700 space-y-1">
          <div className="font-bold">데이터 수집 경고</div>
          {scanData.warnings.map((warning, index) => (
            <div key={index}>- {warning}</div>
          ))}
        </div>
      )}

      <section className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-100 space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
          <ShieldCheck size={16} className="text-red-500" /> 전세가율 경보
          <span className="ml-auto text-[10px] text-slate-400 font-medium">전세가율 = 전세보증금 / 매매가</span>
        </h3>

        {loading ? (
          <div className="text-sm text-slate-500 font-bold">스캔 데이터 로딩 중...</div>
        ) : scanData.jeonseAlerts.length === 0 ? (
          <div className="text-sm text-slate-500 font-bold">해당 조건의 전세가율 경보가 없습니다.</div>
        ) : (
          <div className="space-y-2">
            {scanData.jeonseAlerts.map((item) => (
              <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border ${levelBlockClass(item.level)}`}>
                <span className={`text-[9px] text-white px-2 py-0.5 rounded-full font-black whitespace-nowrap ${item.badgeColor || 'bg-slate-600'}`}>
                  {item.badge || '주의'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={11} className="text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-500 truncate">{item.region}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Building2 size={11} className="text-slate-600 shrink-0" />
                    <span className="text-[12px] font-bold text-slate-800 truncate">{item.apt}</span>
                    <span className="text-[10px] text-slate-400">{item.area}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 space-y-0.5">
                  <div className="text-[10px] text-slate-500">매매 <span className="font-bold text-slate-700">{formatPrice(item.salePrice)}</span></div>
                  <div className="text-[10px] text-slate-500">전세 <span className="font-bold text-blue-600">{formatPrice(item.jeonsePrice)}</span></div>
                </div>
                <div className={`text-lg font-black tabular-nums shrink-0 w-16 text-right ${ratioClass(item.ratio)}`}>
                  {item.ratio}%
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-100 space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
          <TrendingUp size={16} className="text-blue-600" /> 거래가 급등 신호
          <span className="ml-auto text-[10px] text-slate-400 font-medium">+5% 이상 또는 +1억원 이상</span>
        </h3>

        {loading ? (
          <div className="text-sm text-slate-500 font-bold">스캔 데이터 로딩 중...</div>
        ) : scanData.priceSpikes.length === 0 ? (
          <div className="text-sm text-slate-500 font-bold">거래가 급등 신호가 없습니다.</div>
        ) : (
          <div className="space-y-2">
            {scanData.priceSpikes.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border bg-blue-50 border-blue-200">
                <span className="text-[9px] text-white px-2 py-0.5 rounded-full font-black whitespace-nowrap bg-blue-600">
                  급등
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={11} className="text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-500 truncate">{item.region}</span>
                    <span className="text-[9px] text-slate-400">{item.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Building2 size={11} className="text-slate-600 shrink-0" />
                    <span className="text-[12px] font-bold text-slate-800 truncate">{item.apt}</span>
                    <span className="text-[10px] text-slate-400">{item.area}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 space-y-0.5">
                  <div className="text-[10px] text-slate-400 line-through">{formatPrice(item.prevPrice)}</div>
                  <div className="text-[11px] font-bold text-blue-700 flex items-center gap-0.5 justify-end">
                    <ArrowUpRight size={11} /> {formatPrice(item.curPrice)}
                  </div>
                </div>
                <div className="text-right shrink-0 w-20">
                  <div className="text-sm font-black text-red-600">+{item.changeRate}%</div>
                  <div className="text-[10px] font-bold text-red-500">+{formatPrice(item.changeAmount)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-100 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
          <BarChart3 size={16} className="text-purple-600" /> 추가 급등 조짐
          <span className="ml-auto text-[10px] text-slate-400 font-medium">거래량 이상 신호</span>
        </h3>

        {loading ? (
          <div className="text-sm text-slate-500 font-bold">스캔 데이터 로딩 중...</div>
        ) : scanData.volumeSignals.length === 0 ? (
          <div className="text-sm text-slate-500 font-bold">거래량 급증 신호가 없습니다.</div>
        ) : (
          <div className="space-y-2">
            {scanData.volumeSignals.map((item, index) => (
              <div key={`${item.region}-${index}`} className="flex items-center gap-3 p-2.5 rounded-lg border bg-purple-50 border-purple-100">
                <span className="text-[9px] text-white px-2 py-0.5 rounded-full font-black bg-purple-600 whitespace-nowrap">거래량 급증</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-800">{item.region}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">{item.month}</span>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] font-bold text-purple-700">{item.prevTrades}건 → {item.curTrades}건</div>
                  <div className="text-[10px] font-black text-purple-600">전월 대비 {item.ratio}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="bg-slate-900 text-white p-5 rounded-[20px] shadow-lg space-y-3">
        <h4 className="text-sm font-bold flex items-center gap-2">
          <ShieldCheck size={14} /> 실시간 스캔 요약
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
          <div className="p-2.5 rounded-lg bg-white/10 space-y-1">
            <div className="font-bold text-red-400">전세가율 경보</div>
            <div className="text-slate-300">{totals.jeonse}건</div>
          </div>
          <div className="p-2.5 rounded-lg bg-white/10 space-y-1">
            <div className="font-bold text-blue-400">거래가 급등</div>
            <div className="text-slate-300">{totals.spikes}건</div>
          </div>
          <div className="p-2.5 rounded-lg bg-white/10 space-y-1">
            <div className="font-bold text-purple-400">거래량 급증</div>
            <div className="text-slate-300">{totals.volume}건</div>
          </div>
        </div>
        <p className="text-[9px] text-slate-500 text-right">
          스캔 권역: {scanData.scannedRegions}개
        </p>
      </div>
    </div>
  );
};

export default RiskSignalGuide;
