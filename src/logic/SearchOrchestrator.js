/**
 * SearchOrchestrator.js
 * Handles the planning and execution logic for real estate data collection.
 * Follows the 12-step Part A workflow from cogui.md.
 */

export const planSearch = (query) => {
  // Simple heuristic to determine search type
  const isApartment = query.includes('아파트') || query.includes('단지') || query.length > 2;
  const isPolicy = query.includes('정책') || query.includes('규제') || query.includes('대출');
  const isVilla = query.includes('빌라') || query.includes('다세대') || query.includes('연립');
  
  const plan = {
    type: isVilla ? 'VILLA_ANALYSIS' : (isApartment ? 'APARTMENT_ANALYSIS' : (isPolicy ? 'POLICY_ANALYSIS' : 'GENERAL')),
    queries: [],
    steps: []
  };

  if (plan.type === 'VILLA_ANALYSIS') {
    plan.queries = [
      `${query} 실거래가 시세`,
      `${query} 전세가율 및 깡통전세 리스크`,
      `${query} 주변 빌라 거래량 및 환금성`
    ];
    plan.steps = [
      '빌라 요청 파싱 완료',
      '시세 및 전세가율 데이터 수집 중',
      '전세사기 리스크 체크리스트 가동 중',
      '주변 환금성 분석 중'
    ];
  } else if (plan.type === 'APARTMENT_ANALYSIS') {
    plan.queries = [
      `${query} 실거래가 매매 전세 2025 2026`,
      `${query} 입지 분석 학군 교통 인프라`,
      `${query} 주변 개발호재 GTX 지하철`,
      `${query} 인근 아파트 시세 비교`,
      `${query} 지역 입주물량 전망`
    ];
    plan.steps = [
      '사용자 요청 파싱 완료',
      '검색 쿼리 설계 및 실행 중',
      '실거래가 데이터 수집 중',
      '입지 요소 점수 산정 중',
      '가격 전망 시나리오 분석 중',
      '팩트체크 및 리스크 평가 중'
    ];
  } else if (plan.type === 'POLICY_ANALYSIS') {
    plan.queries = [
      `${query} 정부 발표 공식 자료 site:go.kr`,
      `${query} 시장 영향 분석 전문가 의견`,
      `${query} 적용 지역 규제 현황`
    ];
    plan.steps = [
      '정책 요청 파싱 완료',
      '공식 소스 검색 중',
      '시장 영향력 시뮬레이션 중'
    ];
  }

  return plan;
};

// Simple hash to make mock data deterministic per query
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

export const calculateLocationScore = (seed, query) => {
  const variation = (seed % 20) - 10; // -10 to +10
  const region = query ? query.split(' ')[0] : '해당 지역';
  
  // Dynamic description generators based on seed and region
  const getDesc = (opts, i) => opts[(seed + i) % opts.length].replace('{region}', region);

  const baseFactors = [
    { label: '교통', base: 18, max: 20, desc: getDesc(['지하철 도보 5분 초역세권', '다중 환승역 및 광역버스망', '{region} 교통 핵심 허브 인접'], 1) },
    { label: '학군', base: 14, max: 15, desc: getDesc(['{region} 명문 학군 및 대형 학원가', '초품아(단지 내 초등학교)', '도보권 우수 초·중·고 밀집'], 2) },
    { label: '인프라', base: 11, max: 12, desc: getDesc(['대형 백화점 및 종합병원 인접', '{region} 핵심 상업지구 도보권', '몰세권 및 다양한 편의시설'], 3) },
    { label: '규모', base: 9, max: 10, desc: getDesc(['2,000세대 이상 매머드급 대단지', '1,000세대 규모의 안정적 커뮤니티', '단지 내 프리미엄 조경 및 커뮤니티'], 4) },
    { label: '브랜드', base: 8, max: 8, desc: getDesc(['1군 메이저 건설사 시그니처', '인지도 높은 1군 브랜드', '프리미엄 하이엔드 브랜드 적용'], 5) },
    { label: '연식', base: 6, max: 8, desc: getDesc(['준공 5년 이내 신축급', '10년 차 준신축, 양호한 관리', '리모델링/재건축 연한 도래 (기대감)'], 6) },
    { label: '환경', base: 7, max: 8, desc: getDesc(['대형 공원 인접, 우수한 쾌적성', '수변 조망권 및 산책로', '{region} 대표 녹지 공간 인접'], 7) },
    { label: '호재', base: 9, max: 10, desc: getDesc(['{region} 핵심 정비사업 구역', '광역 교통망(GTX 등) 확충 수혜', '대규모 일자리 창출 부지 인접'], 8) },
    { label: '수급', base: 4, max: 5, desc: getDesc(['{region} 향후 3년 입주물량 급감', '주변 수요 대비 공급 부족 심화', '안정적인 전세 수요 유지'], 9) },
    { label: '규제', base: 3, max: 4, desc: getDesc(['비규제지역 대출 및 세금 혜택', '실거주 의무 폐지 수혜', '재건축 안전진단 완화 적용'], 10) }
  ];
  
  // Detailed reason generators per factor (score-based, injected with deterministic data)
  const reasonTemplates = {
    '교통': (score, max, region, seed) => {
      const walkTime = 3 + (seed % 5);
      const commuteTime = 25 + (seed % 15);
      if (score >= max * 0.85) return `${region} 지역은 지하철역 도보 ${walkTime}분 이내 초역세권으로, 2개 이상의 광역버스 노선이 단지 앞을 경유합니다. 향후 핵심 교통망 확충이 예정되어 있어 주요 업무지구(CBD·GBD)까지 약 ${commuteTime}분 이내 도달이 가능해 교통 접근성이 최상급입니다.`;
      if (score >= max * 0.6) return `${region} 지역은 대중교통 접근성이 양호한 편입니다. 인근 역까지 도보 ${walkTime + 7}분 거리이며, 주요 노선 탑승이 용이합니다. 주요 업무지구까지 평균 ${commuteTime + 15}분 정도 소요되며, 향후 교통망 확충 계획에 따른 단계적 개선이 기대됩니다.`;
      return `${region} 지역의 대중교통 인프라는 개선이 필요한 수준입니다. 최인접 지하철역까지 도보 ${walkTime + 15}분 이상 소요되며, 버스 배차 간격이 넓어 자차 의존도가 상대적으로 높습니다. 신규 대중교통 노선 연장 여부를 확인할 필요가 있습니다.`;
    },
    '학군': (score, max, region, seed) => {
      const academyCount = 40 + (seed % 60);
      const percentile = 3 + (seed % 7);
      if (score >= max * 0.85) return `${region} 일대는 전국 상위권 학군으로 평가됩니다. 지역 내 주요 중학교의 학업성취도가 상위 ${percentile}% 이내에 들며, 반경 1km 내에 ${academyCount}여 곳 이상의 대형 학원가가 밀집해 있어 학령기 자녀를 둔 실수요자의 진입이 꾸준합니다.`;
      if (score >= max * 0.6) return `${region} 지역은 지역 평균 이상의 안정적인 학군 환경을 갖추고 있습니다. 초등학교 배정이 원활하며(초품아 또는 인접), 인근에 약 ${Math.floor(academyCount / 2)}개의 중소형 학원가가 형성되어 있어 기본적인 사교육 접근성은 양호합니다.`;
      return `${region} 지역의 학군 인프라는 보통 수준으로, 특목고 진학률이 높은 명문 중학교 배정을 위해서는 세밀한 학구도 확인이 필요합니다. 대규모 밀집 학원가까지는 다소 거리가 있어 셔틀버스 등 보조 수단 활용이 권장됩니다.`;
    },
    '인프라': (score, max, region, seed) => {
      const hosp = 1 + (seed % 2);
      const malls = 2 + (seed % 3);
      if (score >= max * 0.85) return `${region} 주변 반경 1.5km 이내에 ${malls}개의 대형 복합 쇼핑몰과 ${hosp}곳의 종합 상급병원이 위치해 생활 인프라가 매우 우수합니다. 관공서, 도서관, 스포츠센터 등 공공 편의시설이 도보권에 집중되어 '슬세권' 특성을 강하게 보입니다.`;
      if (score >= max * 0.6) return `${region} 지역은 기본적인 생활 인프라가 잘 갖추어져 있습니다. 도보 10분 거리에 중대형 마트와 로컬 상권이 활성화되어 있으며, 차량으로 ${5 + (seed % 10)}분 이내에 주요 상업시설 접근이 가능합니다.`;
      return `${region} 지역은 생활 핵심 인프라가 아직 발전 중인 단계입니다. 대규모 상업시설이나 의료 인프라 이용을 위해 타 지역으로 차량 이동이 필수적이며, 신도시 특성상 상권이 완전히 정착되기까지 시간이 소요될 수 있습니다.`;
    },
    '규모': (score, max, region, seed) => {
      const totalUnits = 1500 + (seed % 2500);
      const parkingRatio = (1.3 + (seed % 6) / 10).toFixed(2);
      if (score >= max * 0.85) return `해당 구역 단지는 평균 ${totalUnits.toLocaleString()}세대 이상의 매머드급 대단지로 구성되어 있습니다. 자체 대형 커뮤니티(수영장, 조식 서비스 등) 운영 효율이 극대화되며, 세대당 주차대수도 ${parkingRatio}대로 매우 쾌적한 주거 여건을 제공합니다.`;
      if (score >= max * 0.6) return `해당 구역 단지는 평균 ${Math.floor(totalUnits / 2).toLocaleString()}세대 규모의 안정적인 중형 단지입니다. 기본 커뮤니티 시설이 적절히 운영되고 있으며, 세대당 주차대수 ${(parkingRatio - 0.2).toFixed(2)}대 수준으로 무난한 거주성을 지닙니다.`;
      return `해당 구역은 평균 ${Math.floor(totalUnits / 4).toLocaleString()}세대 미만의 소규모 단지 위주입니다. 대형 커뮤니티 시설 구축은 제한적이며, 관리비 단가가 다소 높을 수 있습니다. 세대당 주차 공간 확보(약 ${(parkingRatio - 0.4).toFixed(2)}대) 상태를 필히 확인해야 합니다.`;
    },
    '브랜드': (score, max, region, seed) => {
      const premiumRate = 7 + (seed % 8);
      if (score >= max * 0.85) return `1군 메이저 건설사의 시그니처 브랜드 타운이 형성된 곳입니다. 이로 인해 인근 비브랜드 단지 대비 약 ${premiumRate}% 수준의 확고한 시세 프리미엄이 유지되고 있으며, 상승기에는 탄력성이 높고 하락기에는 방어력이 우수합니다.`;
      if (score >= max * 0.6) return `인지도 있는 중견·대형 건설사 브랜드 위주로 시공되어 기본적인 시공 품질과 사후 관리에 대한 신뢰도가 확보된 구역입니다. 1군 하이엔드 대비 프리미엄은 약 ${Math.floor(premiumRate / 2)}% 내외로 형성되어 합리적입니다.`;
      return `해당 구역은 지역/중소 건설사 브랜드가 다수 섞여 있어 브랜드 자체의 프리미엄(Price Premium) 반영비율은 미미합니다. 시세는 철저히 실사용 가치와 주변 인프라, 입지 조건에 의존하여 움직이는 시장입니다.`;
    },
    '연식': (score, max, region, seed) => {
      const newYear = seed % 5;
      const midYear = 8 + (seed % 7);
      const oldYear = 20 + (seed % 10);
      if (score >= max * 0.85) return `평균 준공 ${newYear === 0 ? '1' : newYear}년 차 이내의 신축급 구역으로, 최신 4-Bay 판상형 구조와 첨단 스마트홈 IoT 시스템이 전면 도입되어 있습니다. 우수한 단열 및 층간소음 저감 설계로 입주민의 체감 주거 질이 지역 내 최상위권입니다.`;
      if (score >= max * 0.6) return `평균 준공 ${midYear}년 차 전후의 준신축 구역입니다. 내부 인테리어나 커뮤니티 시설이 비교적 최신 트렌드를 유지하고 있으며, 초기 하자 보수가 안정화되어 실거주 가성비(가심비)가 가장 높은 시기입니다.`;
      return `평균 준공 ${oldYear}년 차 이상의 구축 구역입니다. 기본 설비 노후화 및 지하주차장 연결 불편함이 있을 수 있으나, 용적률이 낮고 대지지분이 넓을 경우 재건축/리모델링 등 장기적인 정비사업 가치가 숨어있습니다.`;
    },
    '환경': (score, max, region, seed) => {
      const parkSize = 10 + (seed % 40);
      if (score >= max * 0.85) return `${region} 지역은 ${parkSize}만㎡ 규모의 대형 자연 근린공원 또는 수변 산책로가 단지와 직접 연결되는 '숲세권/수세권' 입지입니다. 도심 속에서도 탁월한 자연 조망권과 미세먼지 저감 효과를 누릴 수 있어 프리미엄 요인으로 강력히 작용합니다.`;
      if (score >= max * 0.6) return `${region} 지역은 도보권 내에 중소형 어린이공원 및 테마 녹지 공간이 다수 배치되어 있습니다. 큰 환경적 유해요소(소음, 분진 등)가 없어 전반적으로 무난하고 쾌적한 주거 환경을 제공합니다.`;
      return `${region} 지역은 상업지구 혹은 대로변에 밀접하여 자연 녹지 비율이 상대적으로 낮습니다. 거주동의 위치에 따라 도로 소음 및 야간 빛 공해의 영향을 받을 수 있으므로, 임장 시 방음 및 환기 상태 체크가 권장됩니다.`;
    },
    '호재': (score, max, region, seed) => {
      const years = 2 + (seed % 3);
      if (score >= max * 0.85) return `${region} 일대는 광역 철도망 신설 및 대규모 복합업무지구 조성이라는 'S급 대형 호재'를 보유하고 있습니다. 이 호재는 향후 ${years}년 내 가시화(착공/준공)될 확률이 80% 이상으로 평가되어, 선도적인 시세 견인의 핵심 동력으로 작동합니다.`;
      if (score >= max * 0.6) return `${region} 주변으로 중규모의 가로주택정비사업 및 기존 인프라(도로 연장, 지역 상권 리뉴얼) 개선 사업이 진행 중입니다. 단기 폭발적 상승보다는 향후 ${years + 2}년에 걸쳐 계단식 시세 방어 및 소폭 상승에 기여할 것으로 예상됩니다.`;
      return `${region} 지역에 현재 가시적으로 확정된 대형 개발 호재는 제한적입니다. 호재 기대감에 의한 가격 거품이 적어 실가치 위주의 보수적인 접근이 필요하며, 향후 지자체의 중장기 발전 계획을 지속적으로 트래킹해야 합니다.`;
    },
    '수급': (score, max, region, seed) => {
      const lackUnits = 500 + (seed % 1500);
      const overUnits = 8000 + (seed % 12000);
      if (score >= max * 0.85) return `${region} 지역은 향후 3년간 신규 입주물량이 연평균 ${lackUnits.toLocaleString()}세대 이하로 급감하여 심각한 공급 부족 국면에 진입합니다. 이는 전월세 매물 품귀 현상을 유발하여 전세가율을 강하게 밀어올리며, 매매가 하방 경직성을 극대화합니다.`;
      if (score >= max * 0.6) return `${region} 지역의 향후 2~3년간 연평균 입주물량은 약 ${(lackUnits + 3000).toLocaleString()}세대 수준으로, 지역 자체 소화 가능한 적정 수요와 거의 일치합니다. 수급 밸런스가 뛰어나 외부 거시경제 충격 외에는 급격한 시세 변동이 발생하기 어렵습니다.`;
      return `${region} 지역은 향후 2년 내 약 ${overUnits.toLocaleString()}세대에 달하는 대규모 입주물량이 쏟아질 예정입니다. 특히 입주 집중 시점(잔금 마련 시기)에 전세 매물이 급증하여 전세가 폭락 및 갭투자 물건의 급매물 출회에 따른 매매가 조정 우려가 매우 큽니다.`;
    },
    '규제': (score, max, region, seed) => {
      const ltvMax = 70 + (seed % 10); // 70~79
      if (score >= max * 0.85) return `${region} 지역은 현재 완벽한 비규제지역으로 분류되어 대출 문턱이 낮습니다. 주택담보대출 LTV 최대 ${ltvMax}%(생애최초 80%)까지 적용 가능하며, 다주택자 취득세 중과 배제 및 양도세 비과세 거주요건 면제 등 규제 프리미엄을 온전히 누릴 수 있습니다.`;
      if (score >= max * 0.6) return `${region} 지역은 일부 핀셋 규제가 적용되고 있으나 시장 억제력은 강하지 않습니다. 스트레스 DSR 적용 등에 따른 대출 한도 축소(약 10~15%) 영향은 있으나, 무주택 실수요자나 1주택 갈아타기 수요에게는 세금 및 대출 조건이 크게 불리하지 않습니다.`;
      return `${region} 지역은 투기과열지구 혹은 핵심 조정대상지역에 편입되어 있어 LTV/DTI 등 여신 규제가 매우 엄격하게 작동합니다. 자금조달계획서 제출이 의무화될 수 있으며, 취득·보유·양도 전 단계에 걸쳐 무거운 징벌적 세제가 적용될 리스크를 반드시 계산해야 합니다.`;
    }
  };

  const factors = baseFactors.map((f, i) => {
    const noise = ((seed * (i + 1)) % 5) - 2; // -2 to +2
    const finalScore = Math.max(0, Math.min(f.max, f.base + Math.floor(variation / 4) + noise));
    const reasonFn = reasonTemplates[f.label];
    const reason = reasonFn ? reasonFn(finalScore, f.max, region, seed) : `${f.label} 분석 완료.`;
    return { ...f, score: finalScore, reason };
  });


  
  const total = factors.reduce((sum, f) => sum + f.score, 0);
  return { factors, total };
};

export const mockAnalysisResult = (query, type) => {
  const seed = hashString(query || 'default');
  const location = calculateLocationScore(seed, query);
  const region = query ? query.split(' ')[0] : '해당 지역';
  
  // Dynamic fields
  const prospectScore = 75 + (seed % 20); // 75 to 94
  const aiPrediction = ((seed % 100) / 10) - 2; // -2.0% to +7.9%
  const temp = 40 + (seed % 45); // 40C to 84C
  const conf = 70 + (seed % 25); // 70% to 94%
  const targetGrade = location.total >= 90 ? 'S' : (location.total >= 80 ? 'A' : (location.total >= 70 ? 'B' : 'C'));
  const percentile = Math.max(1, 30 - Math.floor(location.total / 3));
  const verdictMap = {
    'S': '강력 추천',
    'A': '적극 검토',
    'B': '중립 (관망)',
    'C': '신중 접근'
  };
  const starsMap = {
    'S': 5,
    'A': 4.5,
    'B': 3.5,
    'C': 2.5
  };
  const basePrice = 5 + (seed % 15) + (seed % 10) / 10; // e.g. 12.3

  return {
    summary: `${query} 부동산 정밀 분석 리포트`,
    searchLog: [
      { query: `${query} 실거래가 2025 2026`, result: '최근 6개월 실거래 5건 확보' },
      { query: `${query} 입지 및 학군 분석`, result: '10대 입지 요소 데이터 수집 완료' },
      { query: `${query} 개발 호재 site:go.kr`, result: '주변 개발 정보 및 관보 팩트체크 완료' },
      { query: `${query} 입주물량 및 미분양`, result: '향후 3년 공급 현황 확인' },
      { query: `${query} 부동산 규제 및 세금`, result: '지역 맞춤형 세금 및 대출 규제 확인' }
    ],
    sourceLevels: {
      L1: '국토교통부 실거래가 시스템 (2026.05 기준)',
      L2: '해당 지자체 및 유관 기관 보도자료',
      L3: '한국부동산원 월간 통계 (2026.04 기준)'
    },
    score: location.total,
    grade: targetGrade,
    rank: {
      region: query.split(' ')[0] || '해당 권역',
      percentile: `상위 ${percentile}%`,
      position: `지역 내 상위 ${percentile}% 수준의 가치`
    },
    prospectScore: prospectScore,
    investmentVerdict: verdictMap[targetGrade],
    regulationMatrix: {
      region: '투기과열지구 (해제)',
      isSpeculative: '아니오 (2025.01 해제)',
      isAdjustment: '아니오',
      isPriceLimit: '적용 (강남3구/용산 제외 해제)',
      isPermitRequired: '아니오',
      ltvLimit: '70% (생애최초 80%)',
      dsrStatus: '40% 적용 중'
    },
    taxSimulation: {
      acquisition: '1,320만원 (1.1% 적용)',
      holding: '350만원 (재산세+종부세 합산)',
      capitalGains: '일시적 2주택 비과세 가능',
      taxBreakdown: {
        propertyTax: '220만원',
        wealthTax: '130만원',
        eduTax: '44만원'
      }
    },
    loanGuidance: {
      ltv: '최대 70%',
      dsr: '40% 적용 (연소득 비례)',
      maxLoan: '약 8.4억 (매매가 12억 기준)'
    },
    supplyDemand: {
      upcomingSupply: [
        { year: '2025', count: '12,450', status: '안전' },
        { year: '2026', count: '24,800', status: '과잉' },
        { year: '2027', count: '8,200', status: '부족' }
      ],
      unsold: '245세대 (전월 대비 -12%)',
      volume: '842건 (평균 대비 120% 수준)'
    },
    subscriptionGuide: {
      method: '가점제 40% / 추첨제 60%',
      qualification: '청약통장 12개월 이상, 지역별 예치금 충족',
      upcoming: [
        { name: '래미안 원펜타스', schedule: '2026.08 예정', price: '약 6,500만원/평' },
        { name: '메이플자이', schedule: '2026.11 예정', price: '약 6,200만원/평' }
      ]
    },
    macroIndicators: {
      baseRate: '3.50%',
      mortgageRate: '4.2% ~ 5.8%',
      sentiment: '중립 (98.5)',
      inflation: '2.8%',
      volumeAnalysis: {
        current: '125건',
        avg3Year: '180건',
        ratio: '69%',
        status: '거래 절벽 해소 중'
      },
      marketTemperature: {
        score: temp,
        status: temp >= 70 ? 'Hot' : (temp >= 50 ? 'Warm' : 'Cool'),
        trend: temp >= 60 ? 'Rising' : 'Stable'
      }
    },
    valuationMetrics: {
      pir: `12.${seed % 10} (지역 평균 14.2)`,
      pricePerPyung: '해당 단지 평균',
      regionalAvgPyung: '지역 평균 평당가',
      valuationStatus: aiPrediction > 2 ? '저평가 (매수 기회)' : (aiPrediction < 0 ? '고평가 (주의 구간)' : '적정 (가치 부합)'),
      bubbleIndex: aiPrediction < -1 ? '위험 (High)' : '안전 (Low)'
    },
    aiForecast: {
      confidence: `${conf}%`,
      prediction6m: `${aiPrediction >= 0 ? '+' : ''}${aiPrediction.toFixed(1)}%`,
      prediction12m: `${(aiPrediction * 1.5).toFixed(1)}%`,
      drivers: ['GTX-C 착공 가시화', '금리 인하 기조', '인근 정비사업 이주 수요'],
      riskFactors: ['대출 규제 강화 가능성', '서울 입주 물량 증가']
    },
    locationFactors: location.factors,
    data: {
      prices: Array.from({ length: 5 }).map((_, i) => ({
        date: `2025.${12 - i}.${15 + (seed % 10) - i}`,
        size: '84㎡', floor: `${5 + (seed % 15) + i}층`,
        price: `${(basePrice + ((i - 2) * 0.1) + ((seed % 3) * 0.05)).toFixed(1)}억`,
        source: '국토부 실거래가'
      })),
      rentals: Array.from({ length: 3 }).map((_, i) => ({
        date: `2025.${12 - i}.${(seed % 20) + 1}`,
        size: '84㎡', floor: `${3 + (seed % 10) + i}층`,
        price: `${(basePrice * 0.6 + ((i - 1) * 0.05)).toFixed(1)}억`,
        source: '국토부 실거래가'
      })),
      pros: [`${region} 우수 인프라`, '도보권 대중교통', '안정적 주거 선호도'],
      cons: ['연식에 따른 노후화 우려', '주차 공간 부족 가능성'],
      trends: {
        '1M': `${(aiPrediction * 0.1).toFixed(1)}%`,
        '3M': `${(aiPrediction * 0.3).toFixed(1)}%`,
        '6M': `${(aiPrediction).toFixed(1)}%`,
        '1Y': `${(aiPrediction * 1.8).toFixed(1)}%`,
        '3Y': `${(aiPrediction * 3.5 + 5).toFixed(1)}%`,
        '5Y': `${(aiPrediction * 4 + 15).toFixed(1)}%`
      },
      comparison: [
        { name: `${region} 푸르지오`, price: `${(basePrice + 0.5).toFixed(1)}억`, diff: '+0.5억', ratio: '+4.2%', rating: '상위', features: '신축급, 학원가 인접' },
        { name: `${region} 래미안`, price: `${(basePrice - 0.4).toFixed(1)}억`, diff: '-0.4억', ratio: '-3.5%', rating: '하위', features: '역세권 거리 열위' }
      ],
      valuation: {
        status: aiPrediction > 0 ? '저평가 (매수 기회)' : '적정 수준',
        reason: `지역 내 ${aiPrediction > 0 ? '저평가' : '평균적인'} 가치를 보이며, 전세가율 회복에 따른 하방 경직성 확보.`
      },
      factCheck: [
        { topic: `${region} 핵심 정비사업`, status: (seed % 2 === 0) ? 'CONFIRMED' : 'IN PROGRESS', level: 1, detail: '관보 및 지자체 고시문 확인 완료.', source: '지자체 공식 홈페이지' },
        { topic: `인근 학교 신설`, status: 'IN PROGRESS', level: 3, detail: '교육청 심사 대기 중.', source: '지역 교육청' },
        { topic: `교통망 연장(GTX 등)`, status: (seed % 3 === 0) ? 'UNDER REVIEW' : 'CONFIRMED', level: 4, detail: '타당성 조사 진행 중.', source: '기획재정부 재정사업평가' }
      ],
      riskMatrix: [
        { type: '시장 리스크', level: '중간', desc: '대출 규제 변동에 따른 매수 심리 위축 가능성', strategy: 'LTV 한도 사전 확인 및 고정금리 활용' },
        { type: '정책 리스크', level: '낮음', desc: '비규제지역 유지 가능성 높음', strategy: '정책 변화 모니터링' },
        { type: '공급 리스크', level: (seed % 2 === 0) ? '높음' : '낮음', desc: `향후 2년 내 ${region} 인근 입주물량 ${seed % 2 === 0 ? '과다' : '부족'}`, strategy: '전세가율 하락 대비 자금 확보' },
        { type: '유동성 리스크', level: '중간', desc: '거래량 회복 중이나 급매 위주 소진', strategy: '보수적 갭투자 접근' }
      ],
      swot: {
        strengths: [`${region} 핵심 입지`, '브랜드 인지도', '탄탄한 실수요'],
        weaknesses: ['주변 대비 높은 호가', '노후화 진행'],
        opportunities: ['주변 정비사업 이주 수요', '교통망 확충'],
        threats: ['금리 변동성', '인근 대규모 입주 (2026)']
      },
      decisionGuide: {
        verdict: verdictMap[targetGrade],
        stars: starsMap[targetGrade],
        targetPrice: `${(basePrice - 0.5).toFixed(1)}억 ~ ${basePrice.toFixed(1)}억`,
        fairPrice: `${(basePrice + 0.3).toFixed(1)}억`,
        ceilingPrice: `${(basePrice + 1.0).toFixed(1)}억`,
        stopLoss: `${(basePrice - 1.5).toFixed(1)}억`,
        horizon: '3년 이상 장기 보유',
        rationale: `인근 호재가 일부 미반영된 상태이며, 전세가율이 회복세에 있어 하방 경직성이 강함. ${basePrice.toFixed(1)}억 이하 진입 시 안전 마진 확보 가능.`
      },
      scenarioAnalysis: [
        { type: '낙관', condition: '금리 2.5% 이하 + 핵심 호재 조기 착공', impact: '+15%', price: `${(basePrice * 1.15).toFixed(1)}억` },
        { type: '중립', condition: '현 수준 유지 (금리 3.25%)', impact: '+3%', price: `${(basePrice * 1.03).toFixed(1)}억` },
        { type: '비관', condition: '금리 4% 이상 + 입주물량 폭탄', impact: '-10%', price: `${(basePrice * 0.9).toFixed(1)}억` }
      ],
      policies: [
        { area: '규제지역', status: '비규제지역', impact: '긍정적', detail: '투기과열지구 및 조정대상지역 해제' },
        { area: '대출규제', status: 'LTV 70%', impact: '보통', detail: '생애최초 80%, 일반 70% 적용' },
        { area: '세금정책', status: '취득세 완화', impact: '긍정적', detail: '다주택자 중과 완화 및 1주택자 혜택 확대' }
      ],
      villaRisk: [
        { label: '전세가율', value: `${70 + (seed % 15)}%`, status: (seed % 15 > 10) ? '주의' : '안전', desc: `지역 평균(${70 + (seed % 5)}%) 대비 수준`, level: 'L1' },
        { label: '공시지가 비율', value: `${130 + (seed % 20)}%`, status: '안전', desc: 'HUG 보증보험 가입 가능 범위', level: 'L1' },
        { label: '권리관계', value: '깨끗함', status: '안전', desc: '근저당권 및 압류 이력 없음', level: 'L2' },
        { label: '신축 프리미엄', value: (seed % 2 === 0) ? '과다' : '적정', status: (seed % 2 === 0) ? '위험' : '안전', desc: `주변 시세 대비 분양가 ${10 + (seed % 20)}% 차이`, level: 'L3' },
      ],
      villaValuation: {
        estimatedPrice: `${(basePrice * 0.3).toFixed(1)}억`,
        officialPrice: `${(basePrice * 0.2).toFixed(1)}억`,
        priceRatio: `${140 + (seed % 20)}% (적정 150%)`,
        liquidityScore: (seed % 2 === 0) ? '보통 (거래 회전 45일)' : '우수 (거래 회전 20일)'
      },
      villaYield: {
        monthlyRent: `${100 + (seed % 50)}만원`,
        deposit: `${3000 + (seed % 2000)}만원`,
        annualYield: `${(4.5 + (seed % 3) * 0.1).toFixed(1)}%`,
        gapInvestment: `${(basePrice * 0.3 * 0.25).toFixed(1)}억`
      }
    }
  };
};

// V2.0: Real AI Analysis Fetcher
export const fetchRealAiAnalysis = async (query, type) => {
  try {
    const response = await fetch('http://localhost:3001/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, type })
    });
    
    if (!response.ok) {
      throw new Error('API server returned ' + response.status);
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('[AI Analyst] Backend API request failed. Falling back to mock engine.', err);
    throw err;
  }
};
