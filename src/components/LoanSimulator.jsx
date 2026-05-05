import React, { useEffect, useState } from 'react';
import { Calculator, Wallet, ShieldCheck, Percent, Calendar, AlertCircle } from 'lucide-react';

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

  const formatCurrency = (value) => {
    const amount = Number(value) || 0;
    if (amount >= 10000) {
      const eok = Math.floor(amount / 10000);
      const man = amount % 10000;
      return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
    }
    return `${amount.toLocaleString()}만원`;
  };

  const dsrStatus = Number(dsrRatio) <= 40 ? '안정' : Number(dsrRatio) <= 60 ? '주의' : '위험';
  const dsrColor = dsrStatus === '안정' ? 'text-emerald-600' : dsrStatus === '주의' ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-white p-4 rounded-[20px] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
              <Calculator size={16} className="text-white" />
            </div>
            대출 한도 & 이자 시뮬레이터
          </h2>
          <p className="text-slate-500 mt-0.5 ml-10 text-[10px]">LTV, 금리, 소득 조건을 반영한 자금 계획 도구</p>
        </div>
        <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1.5">
          <ShieldCheck size={14} /> 실시간 계산
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <section className="lg:col-span-5 bg-white p-5 rounded-[20px] shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
            <Wallet size={14} className="text-blue-600" /> 주택 및 소득 정보
          </h3>

          {[
            ['주택 매매 가격', homePrice, setHomePrice, 10000, 300000, 5000, formatCurrency(homePrice)],
            ['LTV 한도', ltvLimit, setLtvLimit, 20, 80, 5, `${ltvLimit}%`],
            ['연 소득', income, setIncome, 2000, 30000, 500, formatCurrency(income)],
            ['기존 연간 대출 상환액', otherLoans, setOtherLoans, 0, 10000, 100, formatCurrency(otherLoans)],
            ['금리', interestRate, setInterestRate, 2, 8, 0.1, `${interestRate}%`],
            ['대출 기간', loanTerm, setLoanTerm, 5, 40, 5, `${loanTerm}년`],
          ].map(([label, value, setter, min, max, step, display]) => (
            <div key={label} className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-600">{label}</label>
                <span className="text-blue-600 font-bold text-sm">{display}</span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(event) => setter(Number(event.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => setRepaymentMethod('level')}
              className={`py-2 rounded-xl text-xs font-bold border ${repaymentMethod === 'level' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
            >
              원리금균등
            </button>
            <button
              onClick={() => setRepaymentMethod('principal')}
              className={`py-2 rounded-xl text-xs font-bold border ${repaymentMethod === 'principal' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
            >
              원금균등
            </button>
          </div>
        </section>

        <section className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-3"><Wallet size={14} /> 예상 대출 한도</div>
            <div className="text-3xl font-black text-slate-800">{formatCurrency(loanAmount)}</div>
          </div>
          <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-3"><Calendar size={14} /> 월 상환액</div>
            <div className="text-3xl font-black text-blue-600">{formatCurrency(monthlyPayment)}</div>
          </div>
          <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-3"><Percent size={14} /> 총 이자</div>
            <div className="text-3xl font-black text-amber-600">{formatCurrency(totalInterest)}</div>
          </div>
          <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-3"><AlertCircle size={14} /> DSR 추정</div>
            <div className={`text-3xl font-black ${dsrColor}`}>{dsrRatio}%</div>
            <div className={`text-xs font-bold mt-2 ${dsrColor}`}>{dsrStatus}</div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoanSimulator;
