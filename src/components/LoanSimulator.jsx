import React, { useEffect, useState } from 'react';
import { AlertCircle, Calculator, Calendar, Info, Percent, ShieldCheck, Wallet } from 'lucide-react';

const REGULATED_REGIONS = [
  '서울 전역',
  '과천시',
  '광명시',
  '성남시 분당구·수정구·중원구',
  '수원시 영통구·장안구·팔달구',
  '안양시 동안구',
  '용인시 수지구',
  '의왕시',
  '하남시'
];

const formatLookupDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const loanInputs = ({
  homePrice,
  ltvLimit,
  income,
  otherLoans,
  interestRate,
  loanTerm,
  setHomePrice,
  setLtvLimit,
  setIncome,
  setOtherLoans,
  setInterestRate,
  setLoanTerm,
  formatCurrency
}) => [
  { label: '주택 매매 가격', value: homePrice, setter: setHomePrice, min: 10000, max: 300000, step: 5000, display: formatCurrency(homePrice) },
  { label: 'LTV 한도', value: ltvLimit, setter: setLtvLimit, min: 20, max: 80, step: 5, display: `${ltvLimit}%`, hasInfo: true },
  { label: '연 소득', value: income, setter: setIncome, min: 2000, max: 30000, step: 500, display: formatCurrency(income) },
  { label: '기존 연간 대출 상환액', value: otherLoans, setter: setOtherLoans, min: 0, max: 10000, step: 100, display: formatCurrency(otherLoans) },
  { label: '금리', value: interestRate, setter: setInterestRate, min: 2, max: 8, step: 0.1, display: `${interestRate}%` },
  { label: '대출 기간', value: loanTerm, setter: setLoanTerm, min: 5, max: 40, step: 5, display: `${loanTerm}년` },
];

const TooltipBubble = ({ children, align = 'left' }) => (
  <span className="relative inline-flex group">
    <Info size={13} className="cursor-help text-blue-500" />
    <span
      className={`pointer-events-none absolute bottom-full z-[80] mb-2 hidden w-[min(24rem,calc(100vw-3rem))] rounded-xl border border-slate-200 bg-white p-3 text-left text-[11px] leading-relaxed text-slate-600 shadow-xl group-hover:block ${
        align === 'right' ? 'right-0' : 'left-0'
      }`}
    >
      {children}
    </span>
  </span>
);

const LtvTooltip = () => {
  const lookupDate = formatLookupDate();

  return (
    <TooltipBubble>
      <span className="mb-1 block font-black text-slate-800">LTV(Loan To Value) 한도</span>
      <span className="mb-2 block">
        주택가격 대비 담보대출 가능 비율입니다. 예를 들어 주택가격이 10억원이고 LTV가 70%라면 최대 대출 가능액은 약 7억원입니다.
      </span>
      <span className="mb-2 block font-bold text-slate-700">
        {lookupDate} 기준 규제 지역 : {REGULATED_REGIONS.join(', ')}
      </span>
      <span className="block">
        실제 한도는 규제지역, 생애최초 여부, 주택 수, DSR, 은행 심사에 따라 달라질 수 있습니다.
      </span>
    </TooltipBubble>
  );
};

const DsrTooltip = () => (
  <TooltipBubble align="right">
    <span className="mb-1 block font-black text-slate-800">DSR(Debt Service Ratio) 추정</span>
    <span className="mb-2 block">
      총부채원리금상환비율입니다. 연간 갚아야 하는 모든 대출 원리금 상환액을 연 소득으로 나눈 비율입니다.
    </span>
    <span className="mb-2 block font-bold text-slate-700">
      이 시뮬레이터는 현재 대출의 예상 연간 상환액과 입력한 기존 연간 대출 상환액을 합산해 DSR을 추정합니다.
    </span>
    <span className="block">
      일반적으로 40% 이하는 안정, 40~60%는 주의, 60% 초과는 위험으로 표시합니다. 실제 심사는 차주 조건, 대출 종류, 금융기관 기준에 따라 달라질 수 있습니다.
    </span>
  </TooltipBubble>
);

const LoanSimulator = () => {
  const [homePrice, setHomePrice] = useState(100000);
  const [ltvLimit, setLtvLimit] = useState(70);
  const [income, setIncome] = useState(6000);
  const [otherLoans, setOtherLoans] = useState(0);
  const [interestRate, setInterestRate] = useState(4.2);
  const [loanTerm, setLoanTerm] = useState(30);
  const [repaymentMethod, setRepaymentMethod] = useState('level');
  const [loanAmount, setLoanAmount] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [dsrRatio, setDsrRatio] = useState(0);
  const [marketRateInfo, setMarketRateInfo] = useState(null);

  useEffect(() => {
    fetch('/api/market-rates')
      .then(res => res.json())
      .then(json => {
        if (json.mortgageRate) {
          setInterestRate(json.mortgageRate);
          setMarketRateInfo(json);
        }
      })
      .catch(err => console.error('Rate fetch failed:', err));
  }, []);

  const formatCurrency = (value) => {
    const amount = Number(value) || 0;
    if (amount >= 10000) {
      const eok = Math.floor(amount / 10000);
      const man = amount % 10000;
      return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
    }
    return `${amount.toLocaleString()}만원`;
  };

  useEffect(() => {
    const ltvMax = (homePrice * ltvLimit) / 100;
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTerm * 12;
    let monthly = 0;
    let totalInt = 0;

    if (repaymentMethod === 'level') {
      monthly = (ltvMax * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      totalInt = (monthly * totalMonths) - ltvMax;
    } else {
      monthly = (ltvMax / totalMonths) + (ltvMax * monthlyRate);
      totalInt = (ltvMax * (interestRate / 100) * (totalMonths + 1)) / 2 / 12;
    }

    const annualPayment = monthly * 12;
    const dsr = ((annualPayment + otherLoans) / income) * 100;

    setLoanAmount(Math.round(ltvMax));
    setMonthlyPayment(Math.round(monthly));
    setTotalInterest(Math.round(totalInt));
    setDsrRatio(Number.isFinite(dsr) ? dsr.toFixed(1) : 0);
  }, [homePrice, ltvLimit, income, otherLoans, interestRate, loanTerm, repaymentMethod]);

  const dsrStatus = Number(dsrRatio) <= 40 ? '안정' : Number(dsrRatio) <= 60 ? '주의' : '위험';
  const dsrColor = dsrStatus === '안정' ? 'text-emerald-600' : dsrStatus === '주의' ? 'text-amber-600' : 'text-red-600';
  const inputs = loanInputs({
    homePrice,
    ltvLimit,
    income,
    otherLoans,
    interestRate,
    loanTerm,
    setHomePrice,
    setLtvLimit,
    setIncome,
    setOtherLoans,
    setInterestRate,
    setLoanTerm,
    formatCurrency
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <div className="flex flex-col justify-between gap-2 rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-200">
              <Calculator size={16} className="text-white" />
            </div>
            대출 한도 & 이자 시뮬레이터
          </h2>
          <p className="ml-10 mt-0.5 text-[10px] text-slate-500">LTV, 금리, 소득 조건을 반영한 자금 계획 도구</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-600">
          <ShieldCheck size={14} /> 실시간 계산
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="space-y-4 rounded-[20px] border border-slate-100 bg-white p-5 shadow-sm lg:col-span-5">
          <h3 className="flex items-center gap-2 border-b border-slate-50 pb-2 text-sm font-bold text-slate-800">
            <Wallet size={14} className="text-blue-600" /> 주택 및 소득 정보
          </h3>

          {inputs.map((input) => (
            <div key={input.label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-slate-600">{input.label}</label>
                  {input.hasInfo && <LtvTooltip />}
                  {input.label === '금리' && marketRateInfo && (
                    <span className="animate-pulse-slow rounded-full bg-blue-50 px-1.5 py-0.5 text-[8px] font-black text-blue-600 border border-blue-100">
                      LIVE
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-blue-600">{input.display}</span>
                  {input.label === '금리' && marketRateInfo && (
                    <p className="text-[9px] text-slate-400 font-medium">{marketRateInfo.source}</p>
                  )}
                </div>
              </div>
              <input
                type="range"
                min={input.min}
                max={input.max}
                step={input.step}
                value={input.value}
                onChange={(event) => input.setter(Number(event.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-blue-600"
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => setRepaymentMethod('level')}
              className={`rounded-xl border py-2 text-xs font-bold ${repaymentMethod === 'level' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
            >
              원리금균등
            </button>
            <button
              onClick={() => setRepaymentMethod('principal')}
              className={`rounded-xl border py-2 text-xs font-bold ${repaymentMethod === 'principal' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
            >
              원금균등
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-7">
          <div className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-500"><Wallet size={14} /> 예상 대출 한도</div>
            <div className="text-3xl font-black text-slate-800">{formatCurrency(loanAmount)}</div>
          </div>
          <div className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-500"><Calendar size={14} /> 월 상환액</div>
            <div className="text-3xl font-black text-blue-600">{formatCurrency(monthlyPayment)}</div>
          </div>
          <div className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-500"><Percent size={14} /> 총 이자</div>
            <div className="text-3xl font-black text-amber-600">{formatCurrency(totalInterest)}</div>
          </div>
          <div className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-500">
              <AlertCircle size={14} /> DSR 추정 <DsrTooltip />
            </div>
            <div className={`text-3xl font-black ${dsrColor}`}>{dsrRatio}%</div>
            <div className={`mt-2 text-xs font-bold ${dsrColor}`}>{dsrStatus}</div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoanSimulator;
