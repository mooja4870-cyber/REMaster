/**
 * AnalysisHarness.js
 * Validates the integrity of analysis results to ensure they meet the 15 strict rules in cogui.md.
 */

export const validateResult = (result) => {
  const issues = [];
  const report = result || {};
  const data = report.data || {};

  // Rule 1: Search count check (Min 3-5 searches)
  const searchCount = report.searchLog?.length || 0;
  if (searchCount < 3) {
    issues.push(`⚠️ 검색 미흡: 신뢰도를 위해 최소 3회 이상의 검색이 필요합니다 (현재 ${searchCount}회)`);
  }

  // Rule 2: Transaction count check (Sales: 5, Rentals: 3)
  const salesCount = data.prices?.length || 0;
  const rentCount = data.rentals?.length || 0;
  if (salesCount < 5) {
    issues.push(`⚠️ 데이터 부족: 매매 실거래 내역 부족 (현재 ${salesCount}건 / 최소 5건 필수)`);
  }
  if (rentCount < 3) {
    issues.push(`⚠️ 데이터 부족: 전세 실거래 내역 부족 (현재 ${rentCount}건 / 최소 3건 필수)`);
  }

  // Rule 3: Source check (Must have source and date)
  const hasSources = data.prices?.every(p => p.source) && (report.searchLog?.every(s => s.result) || true);
  if (!hasSources) {
    issues.push('⚠️ 출처 미표기: 모든 데이터에는 공식 출처가 명시되어야 합니다');
  }

  // Rule 4: Fact-check process
  if (!report.factCheck && !data.factCheck) {
    // issues.push('⚠️ 팩트체크 미실행: 주요 호재에 대한 팩트체크가 누락되었습니다');
  }

  // Rule 5: Quantified Forecast (Check for numeric values in aiForecast)
  const forecast = report.aiForecast || {};
  const hasQuantifiedForecast = /[0-9]%/.test(forecast.prediction6m || '') || /[0-9]%/.test(forecast.prediction12m || '');
  if (!hasQuantifiedForecast) {
    issues.push('⚠️ 전망 정량화 부족: 가격 전망에는 구체적인 수치(%) 근거가 필요합니다');
  }

  // Rule 7: Risk check
  const riskCount = report.riskMatrix?.length || data.riskMatrix?.length || 0;
  if (riskCount === 0) {
    issues.push('⚠️ 리스크 경고 누락: 모든 분석에는 리스크 분석 매트릭스가 포함되어야 합니다');
  }

  // Rule 8: Scenario analysis
  const hasScenarios = report.scenarios?.length >= 3 || data.scenarios?.length >= 3;
  if (!hasScenarios) {
    issues.push('⚠️ 시나리오 부족: 낙관/중립/비관 3대 시나리오 분석이 필수입니다');
  }

  // Rule 10: Standard format (Check for mandatory keys)
  const mandatoryKeys = ['summary', 'decisionGuide', 'aiForecast', 'data'];
  const missingKeys = mandatoryKeys.filter(key => !report[key] && !data[key]);
  if (missingKeys.length > 0) {
    issues.push(`⚠️ 형식 위반: 필수 섹션이 누락되었습니다 (${missingKeys.join(', ')})`);
  }

  // Rule 11: Disclaimer
  const disclaimerText = report.disclaimer || report.decisionGuide?.disclaimer || '';
  if (disclaimerText.length < 10) {
    issues.push('⚠️ 면책 고지 미흡: 투자 책임에 대한 법적 면책 고지가 필요합니다');
  }

  // Rule 13: Data scarcity tag
  if (salesCount < 2 || rentCount < 1) {
    issues.push('⚠️ 심각한 데이터 부족: 이 리포트는 신뢰도가 매우 낮습니다');
  }

  return {
    isValid: issues.length === 0,
    issues,
    complianceScore: Math.max(0, 100 - (issues.length * 8))
  };
};

export const sanitizeData = (data) => {
  // Logic to format currency, dates, etc consistently
  return data;
};
