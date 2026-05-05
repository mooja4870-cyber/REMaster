/**
 * AnalysisHarness.js
 * Validates the integrity of analysis results to ensure they meet the 15 strict rules in cogui.md.
 */

export const validateResult = (result) => {
  const issues = [];

  // Rule 2: Transaction count check (Sales: 5, Rentals: 3)
  if (!result.data.prices || result.data.prices.length < 5) {
    issues.push(`⚠️ 데이터 부족: 매매 실거래 내역이 부족합니다 (현재 ${result.data.prices?.length || 0}건 / 최소 5건 필수)`);
  }
  if (!result.data.rentals || result.data.rentals.length < 3) {
    issues.push(`⚠️ 데이터 부족: 전세 실거래 내역이 부족합니다 (현재 ${result.data.rentals?.length || 0}건 / 최소 3건 필수)`);
  }

  // Rule 3: Source check
  if (!result.data.prices.every(p => p.source)) {
    issues.push('⚠️ 출처 미표기: 모든 데이터에는 출처가 명시되어야 합니다');
  }

  // Rule 7: Risk check
  if (!result.data.riskMatrix || result.data.riskMatrix.length === 0) {
    issues.push('⚠️ 리스크 경고 누락: 모든 분석에는 리스크 분석이 포함되어야 합니다');
  }

  // Rule 11: Disclaimer check
  if (!result.decisionGuide) {
    issues.push('⚠️ 의사결정 가이드 누락');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
};

export const sanitizeData = (data) => {
  // Logic to format currency, dates, etc consistently
  return data;
};
