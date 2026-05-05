import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

const WelcomeGuide = ({ onComplete }) => {
  const features = [
    { icon: TrendingUp, title: '실거래 기반 시세 분석', desc: '국토교통부 실거래가와 실제 검색 데이터를 우선 반영해 가격 판단의 기준을 세웁니다.' },
    { icon: ShieldCheck, title: '위험 신호 검증', desc: '전세가율, 거래가 급등, 권리·정책 리스크를 분리해 투자 전 확인할 지점을 보여줍니다.' },
    { icon: Zap, title: 'AI 의사결정 가이드', desc: '확인된 데이터만으로 매수·보류·주의 판단을 정리하고 근거를 함께 표시합니다.' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[32px] shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row"
      >
        <div className="md:w-5/12 bg-blue-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
              <TrendingUp size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">RE Master Analyst</h2>
            <p className="text-blue-100 text-sm font-medium">Professional Real Estate Intelligence</p>
          </div>

          <div className="relative z-10 mt-12">
            <div className="text-4xl font-bold mb-2">Real Data First.</div>
            <p className="text-blue-100 text-sm leading-relaxed">
              가짜 데이터 없이 실제 API와 검증 가능한 출처를 우선하는 부동산 분석 시스템입니다.
            </p>
          </div>

          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="md:w-7/12 p-12 flex flex-col justify-center">
          <div className="mb-10">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">분석 시스템 준비 완료</h3>
            <p className="text-slate-500 text-sm">상단 검색창에 지역, 단지명, 개발 이슈를 입력하면 실데이터 분석이 시작됩니다.</p>
          </div>

          <div className="space-y-6 mb-12">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-5">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100">
                  <feature.icon size={20} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">{feature.title}</h4>
                  <p className="text-slate-500 leading-relaxed text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onComplete}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 group"
          >
            시스템 대시보드 입장하기
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeGuide;
