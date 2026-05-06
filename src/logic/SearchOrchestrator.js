/**
 * SearchOrchestrator.js
 * Handles real-data analysis planning and backend API execution.
 */

export const planSearch = (query = '') => {
  const normalized = String(query).trim();
  const isVilla = /빌라|다세대|연립/i.test(normalized);
  const isPolicy = /정책|규제|대출|세금|LTV|DSR/i.test(normalized);
  const isApartment = /아파트|단지|APT/i.test(normalized) || normalized.length > 1;

  const plan = {
    type: isVilla ? 'VILLA_ANALYSIS' : (isApartment ? 'APARTMENT_ANALYSIS' : (isPolicy ? 'POLICY_ANALYSIS' : 'GENERAL')),
    queries: [],
    steps: []
  };

  if (plan.type === 'VILLA_ANALYSIS') {
    plan.queries = [
      `${normalized} 실거래가 시세 2025 2026`,
      `${normalized} 전세가율 깡통전세 리스크`,
      `${normalized} 주변 빌라 거래량 보증보험`,
      `${normalized} 건축물대장 위반여부`
    ];
    plan.steps = [
      '빌라/연립다세대 요청 분석 중',
      '국토부 실거래 데이터 수집 중',
      '전세 사기 리스크 매트릭스 검증 중',
      'HUG 보증보험 가입 요건 분석 중'
    ];
  } else if (plan.type === 'APARTMENT_ANALYSIS') {
    plan.queries = [
      `${normalized} 실거래가 2025 2026`,
      `${normalized} 아파트 매매 호가 급매물`,
      `${normalized} 주변 개발계획 GTX 지하철 신설`,
      `${normalized} 지역 입주물량 전망 2026 2027`,
      `${normalized} 배정 초중고 학업성취도 학원가`,
      `${normalized} 규제지역 투기과열지구 세금`
    ];
    plan.steps = [
      '마스터 분석 기획 완료',
      '국토부/한국은행/카카오/부동산원 API 병렬 호출 중',
      '10대 핵심 입지 요소 점수 산출 중',
      '가격 전망 시나리오(낙관/중립/비관) 시뮬레이션 중',
      'SWOT 및 리스크 매트릭스 생성 중',
      '15대 철칙 기반 하네스 검증 및 최종 리포트 패키징 중'
    ];
  } else if (plan.type === 'POLICY_ANALYSIS') {
    plan.queries = [
      `${normalized} 보도자료 site:go.kr`,
      `${normalized} 시행일 소득요건 LTV DSR`,
      `${normalized} 시장 영향 분석 전문가 의견`,
      `부동산 규제지역 현황 2026`
    ];
    plan.steps = [
      '정책 요청 파싱 완료',
      '공식 정부 소스 검색 및 팩트체크 중',
      '대출 및 세제 영향 시뮬레이션 중'
    ];
  } else {
    plan.queries = [`${normalized} 부동산 분석`, `${normalized} 시세` ];
    plan.steps = ['요청 파싱 완료', '실데이터 분석 중'];
  }

  return plan;
};

export const fetchRealAiAnalysis = async (query, type) => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ query, type })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || `API server returned ${response.status}`);
    }

    return data;
  } catch (err) {
    console.warn('[AI Analyst] Backend API request failed.', err);
    throw err;
  }
};
