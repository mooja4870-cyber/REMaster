import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart4,
  Calculator,
  CheckCircle2,
  Compass,
  FileText,
  Home,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { version } from '../../package.json';

const guidePages = [
  {
    kicker: 'Step 01',
    title: '지금 매수? 보류?\nAI가 말해주는 ‘정답’이 있습니다.',
    content: '실거래·금리·정책·리스크를 3초 만에 연결해, 당신의 계약 전 마지막 체크리스트를 만드세요!',
    icon: ShieldCheck
  },
  {
    kicker: 'Step 02',
    title: '좋은 입지는 느낌이 아니라 반복되는 생활 동선입니다.',
    content: '교통·학군·생활권·단지 경쟁력을 분리해, 이름값이 아니라 실제 수요가 붙을 이유를 확인합니다.',
    icon: LayoutDashboard
  },
  {
    kicker: 'Step 03',
    title: '지금 가격은 숫자가 아니라 시장의 압축된 심리입니다.',
    content: '실거래 흐름, 금리, 거래량, 전망을 겹쳐 지금 가격이 기회인지 고점의 착시인지 가릅니다.',
    icon: TrendingUp
  },
  {
    kicker: 'Step 04',
    title: '정책은 배경이 아니라 내 한도를 바꾸는 변수입니다.',
    content: '규제지역, 세금, 대출 조건을 함께 읽어 같은 집도 누구에게는 기회, 누구에게는 부담이 되는 지점을 짚습니다.',
    icon: FileText
  },
  {
    kicker: 'Step 05',
    title: '빌라와 전세는 싸게 사는 게임이 아니라 안전을 증명하는 게임입니다.',
    content: '전세가율, 공시가격, 위반건축물, 권리관계까지 훑어 싸 보이는 매물 뒤의 보이지 않는 비용을 드러냅니다.',
    icon: Home
  },
  {
    kicker: 'Step 06',
    title: '호재는 믿는 순간 리스크가 되고, 검증하는 순간 근거가 됩니다.',
    content: '주소, 세대수, 사용승인일, 등기·권리 이슈를 팩트체크해 말로 도는 정보와 계약서에 남을 사실을 구분합니다.',
    icon: Search
  },
  {
    kicker: 'Step 07',
    title: '장점만 보면 확신이 되고, SWOT으로 보면 전략이 됩니다.',
    content: '강점·약점·기회·위협을 한 판에 놓고 매수, 협상, 관망, 손절 기준까지 판단의 순서를 만듭니다.',
    icon: Compass
  },
  {
    kicker: 'Step 08',
    title: '위험은 터진 뒤 뉴스가 되고, 그 전에는 신호로 나타납니다.',
    content: '전세가율, 급등 거래, 거래량 변화 같은 이상 신호를 먼저 잡아 추격 매수와 깡통전세 위험을 줄입니다.',
    icon: AlertTriangle
  },
  {
    kicker: 'Step 09',
    title: '살 수 있는 집보다 중요한 건 버틸 수 있는 대출입니다.',
    content: 'LTV, DSR, 금리, 상환 방식을 연결해 승인 가능한 금액과 매달 감당 가능한 금액의 차이를 보여줍니다.',
    icon: Calculator
  }
];

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 420 : -420, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -420 : 420, opacity: 0 })
};

const WelcomeGuide = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const page = guidePages[currentIndex];
  const Icon = page.icon;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === guidePages.length - 1;

  const moveNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    setDirection(1);
    setCurrentIndex((value) => value + 1);
  };

  const movePrev = () => {
    if (isFirst) return;
    setDirection(-1);
    setCurrentIndex((value) => value - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="re-onboarding-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
    >
      <div className="re-dot-pattern" />

      <motion.section
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 12, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        className="re-frosted-panel relative flex h-[min(680px,92vh)] w-full max-w-5xl flex-col overflow-hidden rounded-[36px] p-6 md:p-10"
      >
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-pink-500 text-white shadow-lg shadow-pink-200">
              <TrendingUp size={23} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-black tracking-tight text-rose-950">RE Master Analyst</h2>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-pink-500">AI Real Estate Intelligence · v{version}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50/70 px-4 py-2">
            <Sparkles size={14} className="text-pink-500" />
            <span className="text-xs font-black uppercase tracking-widest text-rose-700">
              {String(currentIndex + 1).padStart(2, '0')} / {String(guidePages.length).padStart(2, '0')}
            </span>
          </div>
        </header>

        <main className="grid flex-1 grid-cols-1 items-center gap-8 py-8 md:grid-cols-[1.05fr_0.95fr] md:gap-12">
          <div className="min-h-[260px] overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 290, damping: 30 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/60 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-pink-500">
                  <CheckCircle2 size={14} />
                  {page.kicker}
                </div>
                <div className="space-y-4">
                  <h1 className="max-w-xl whitespace-pre-line text-4xl font-black leading-tight tracking-tight text-rose-950 md:text-5xl">
                    {page.title}
                  </h1>
                  <p className="max-w-xl text-base font-medium leading-8 text-rose-700/80 md:text-lg">
                    {page.content}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative flex min-h-[260px] items-center justify-center">
            <div className="absolute h-72 w-72 rounded-full bg-pink-400/20 blur-[90px]" />
            <div className="relative flex aspect-square w-full max-w-[310px] flex-col items-center justify-center rounded-[32px] border border-pink-100 bg-white/60 shadow-2xl shadow-pink-100/80 backdrop-blur-md">
              <Icon size={96} className="text-pink-500" strokeWidth={1.8} />
              <div className="mt-8 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-pink-50 px-4 py-3">
                  <BarChart4 size={18} className="mx-auto mb-1 text-pink-500" />
                  <span className="text-[10px] font-black text-rose-700">시세</span>
                </div>
                <div className="rounded-2xl bg-pink-50 px-4 py-3">
                  <ShieldCheck size={18} className="mx-auto mb-1 text-pink-500" />
                  <span className="text-[10px] font-black text-rose-700">리스크</span>
                </div>
                <div className="rounded-2xl bg-pink-50 px-4 py-3">
                  <Compass size={18} className="mx-auto mb-1 text-pink-500" />
                  <span className="text-[10px] font-black text-rose-700">판단</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="flex flex-col gap-5 border-t border-pink-100 pt-6 md:flex-row md:items-center md:justify-between">
          <button
            onClick={onComplete}
            className="text-left text-sm font-bold text-pink-400 transition-colors hover:text-rose-700"
          >
            건너뛰기
          </button>

          <div className="flex items-center justify-center gap-2">
            {guidePages.map((_, index) => (
              <button
                key={index}
                aria-label={`${index + 1}단계로 이동`}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? 'w-9 bg-pink-500' : 'w-2 bg-pink-200 hover:bg-pink-300'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={movePrev}
              disabled={isFirst}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-pink-100 bg-white/60 text-pink-500 transition-colors hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="이전 단계"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={moveNext}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-pink-500 px-7 text-sm font-black text-white shadow-lg shadow-pink-200 transition-colors hover:bg-pink-600"
            >
              {isLast ? '분석 시작하기' : '다음 단계'}
              <ArrowRight size={18} />
            </button>
          </div>
        </footer>
      </motion.section>
    </motion.div>
  );
};

export default WelcomeGuide;
