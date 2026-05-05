import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Search, TrendingUp, CheckCircle2, X } from 'lucide-react';

const WelcomeGuide = ({ onComplete }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full glass p-10 rounded-[2rem] relative overflow-hidden border border-white/10"
      >
        <button 
          onClick={onComplete}
          className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <TrendingUp size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">RE Master Analyst v2.1.0</h2>
            <p className="text-blue-400 text-sm font-medium">Professional AI Real Estate Engine</p>
          </div>
        </div>

        <div className="space-y-6 mb-10">
          <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="mt-1 text-blue-500"><Search size={20} /></div>
            <div>
              <h4 className="font-bold text-white mb-1">실시간 데이터 정밀 분석</h4>
              <p className="text-sm text-slate-400 leading-relaxed">국토부 실거래가 및 네이버 부동산 매물을 실시간으로 교차 검증하여 가장 정확한 시세를 산출합니다.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="mt-1 text-emerald-500"><ShieldCheck size={20} /></div>
            <div>
              <h4 className="font-bold text-white mb-1">7단계 팩트체크 엔진</h4>
              <p className="text-sm text-slate-400 leading-relaxed">AI가 뉴스, 공시지가, 등기부 관계를 7단계로 심층 분석하여 투자 리스크를 선제적으로 진단합니다.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="mt-1 text-purple-500"><CheckCircle2 size={20} /></div>
            <div>
              <h4 className="font-bold text-white mb-1">맞춤형 의사결정 가이드</h4>
              <p className="text-sm text-slate-400 leading-relaxed">사용자의 자금 계획과 목적에 맞는 최적의 매수/매도 타이밍과 가격 가이드를 제안합니다.</p>
            </div>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full bg-[#a8e6cf] hover:bg-[#8fd3bc] text-slate-900 py-4 text-lg font-black tracking-tight rounded-xl transition-colors shadow-lg shadow-[#a8e6cf]/20"
        >
          분석 시작하기
        </button>
      </motion.div>
    </div>
  );
};

export default WelcomeGuide;
