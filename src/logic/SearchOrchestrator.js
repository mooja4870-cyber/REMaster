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
      `${normalized} 실거래가 시세`,
      `${normalized} 전세가율 깡통전세 리스크`,
      `${normalized} 주변 빌라 거래량 보증보험`
    ];
    plan.steps = [
      '빌라 요청 파싱 완료',
      '매매 및 전월세 실거래 데이터 수집 중',
      '전세 사기 리스크 체크리스트 검증 중',
      '주변 보증금 및 환금성 분석 중'
    ];
  } else if (plan.type === 'APARTMENT_ANALYSIS') {
    plan.queries = [
      `${normalized} 실거래가 매매 전세 2025 2026`,
      `${normalized} 입지 분석 학군 교통 인프라`,
      `${normalized} 주변 개발호재 GTX 지하철`,
      `${normalized} 최근 아파트 시세 비교`,
      `${normalized} 지역 입주물량 전망`
    ];
    plan.steps = [
      '사용자 요청 파싱 완료',
      '검색 쿼리 설계 및 실행 중',
      '실거래가 데이터 수집 중',
      '입지 요소 점수 계산 중',
      '가격 전망 시나리오 분석 중',
      '팩트체크 및 리스크 평가 중'
    ];
  } else if (plan.type === 'POLICY_ANALYSIS') {
    plan.queries = [
      `${normalized} 정부 발표 공식 자료 site:go.kr`,
      `${normalized} 시장 영향 분석 전문가 의견`,
      `${normalized} 적용 지역 규제 현황`
    ];
    plan.steps = [
      '정책 요청 파싱 완료',
      '공식 소스 검색 중',
      '시장 영향 시뮬레이션 중'
    ];
  } else {
    plan.queries = [`${normalized} 부동산 분석`];
    plan.steps = ['요청 파싱 완료', '실데이터 분석 중'];
  }

  return plan;
};

export const fetchRealAiAnalysis = async (query, type) => {
  try {
    const response = await fetch('http://localhost:3001/api/analyze', {
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
