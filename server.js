import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT || 3001);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MOLIT_API_KEY = process.env.MOLIT_API_KEY || process.env.DATA_GO_KR_SERVICE_KEY || process.env.PUBLIC_DATA_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const MOLIT_ENDPOINTS = {
  apartment: {
    trade: 'http://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev',
    rent: 'http://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent'
  },
  villa: {
    trade: 'http://apis.data.go.kr/1613000/RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade',
    rent: 'http://apis.data.go.kr/1613000/RTMSDataSvcRHRent/getRTMSDataSvcRHRent'
  }
};

const LAWD_CODES = [
  ['종로구', '11110'], ['중구', '11140'], ['용산구', '11170'], ['성동구', '11200'], ['광진구', '11215'],
  ['동대문구', '11230'], ['중랑구', '11260'], ['성북구', '11290'], ['강북구', '11305'], ['도봉구', '11320'],
  ['노원구', '11350'], ['은평구', '11380'], ['서대문구', '11410'], ['마포구', '11440'], ['양천구', '11470'],
  ['강서구', '11500'], ['구로구', '11530'], ['금천구', '11545'], ['영등포구', '11560'], ['동작구', '11590'],
  ['관악구', '11620'], ['서초구', '11650'], ['강남구', '11680'], ['송파구', '11710'], ['강동구', '11740'],
  ['수원시', '41110'], ['성남시', '41130'], ['의정부시', '41150'], ['안양시', '41170'], ['부천시', '41190'],
  ['광명시', '41210'], ['평택시', '41220'], ['동두천시', '41250'], ['안산시', '41270'], ['고양시', '41280'],
  ['과천시', '41290'], ['구리시', '41310'], ['남양주시', '41360'], ['오산시', '41370'], ['시흥시', '41390'],
  ['군포시', '41410'], ['의왕시', '41430'], ['하남시', '41450'], ['용인시', '41460'], ['파주시', '41480'],
  ['이천시', '41500'], ['안성시', '41550'], ['김포시', '41570'], ['화성시', '41590'], ['광주시', '41610'],
  ['양주시', '41630'], ['포천시', '41650'], ['여주시', '41670'],
  ['해운대구', '26350'], ['수영구', '26500'], ['부산진구', '26230'], ['동래구', '26260'], ['남구', '26290'],
  ['대구수성구', '27260'], ['수성구', '27260'], ['연수구', '28185'], ['남동구', '28200'], ['서구', '28260'],
  ['광주서구', '29140'], ['유성구', '30200'], ['세종시', '36110']
];

const COMPLEX_HINTS = [
  ['반포자이', '11650'], ['아크로리버파크', '11650'], ['래미안원베일리', '11650'], ['원베일리', '11650'],
  ['은마', '11680'], ['압구정현대', '11680'], ['도곡렉슬', '11680'], ['타워팰리스', '11680'],
  ['잠실엘스', '11710'], ['리센츠', '11710'], ['파크리오', '11710'], ['헬리오시티', '11710'],
  ['마래푸', '11440'], ['마포래미안푸르지오', '11440'], ['목동신시가지', '11470'],
  ['트리마제', '11200'], ['서울숲리버뷰자이', '11200'], ['한남더힐', '11170'], ['나인원한남', '11170'],
  ['광교중흥', '41110'], ['판교푸르지오', '41130'], ['분당파크뷰', '41130']
];

const decodeXml = (value = '') => String(value)
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .trim();

const stripCommaNumber = (value = '') => Number(String(value).replace(/[^\d.-]/g, '')) || 0;

const normalizeText = (value = '') => String(value).replace(/\s+/g, '').toLowerCase();

const getRecentMonths = (count = 12) => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
};

const extractXmlItems = (xml) => {
  const blocks = String(xml || '').match(/<item>[\s\S]*?<\/item>/g) || [];
  return blocks.map((block) => {
    const row = {};
    const tagRegex = /<([^!?/][^>\s/]*)>([\s\S]*?)<\/\1>/g;
    let match;
    while ((match = tagRegex.exec(block))) {
      row[match[1]] = decodeXml(match[2]);
    }
    return row;
  });
};

const pick = (row, names) => {
  for (const name of names) {
    if (row[name] !== undefined && row[name] !== '') return row[name];
  }
  return '';
};

const resolveLawdCode = (query = '') => {
  const compact = normalizeText(query);
  const explicit = String(query).match(/\b\d{5}\b/);
  if (explicit) return { code: explicit[0], label: explicit[0], confidence: 'explicit' };

  const complexHint = COMPLEX_HINTS.find(([name]) => compact.includes(normalizeText(name)));
  if (complexHint) return { code: complexHint[1], label: complexHint[0], confidence: 'complex-hint' };

  const direct = LAWD_CODES.find(([name]) => compact.includes(normalizeText(name)));
  if (direct) return { code: direct[1], label: direct[0], confidence: 'district' };

  return { code: '11680', label: '강남구', confidence: 'default' };
};

const itemMatchesQuery = (row, query, type) => {
  const compactQuery = normalizeText(query);
  const name = normalizeText(pick(row, type === 'villa' ? ['houseName', '연립다세대', '단지', '건물명'] : ['aptNm', '아파트', '단지명']));
  if (!name || name.length < 2) return true;
  return compactQuery.includes(name) || name.includes(compactQuery.replace(/(서울|경기|부산|아파트|빌라|실거래|시세|분석)/g, ''));
};

const formatTradeItem = (row, assetType) => {
  const year = pick(row, ['dealYear', '년']);
  const month = String(pick(row, ['dealMonth', '월'])).padStart(2, '0');
  const day = String(pick(row, ['dealDay', '일'])).padStart(2, '0');
  const amount = stripCommaNumber(pick(row, ['dealAmount', '거래금액']));
  const area = pick(row, ['excluUseAr', '전용면적']);
  const floor = pick(row, ['floor', '층']);
  const name = pick(row, assetType === 'villa' ? ['houseName', '연립다세대', '단지', '건물명'] : ['aptNm', '아파트', '단지명']);
  return {
    date: `${year}.${month}.${day}`,
    name,
    size: area ? `${Number(area).toFixed(2)}㎡` : '-',
    floor: floor ? `${floor}층` : '-',
    price: amount ? `${(amount / 10000).toFixed(2)}억` : '-',
    rawAmount: amount,
    source: '국토교통부 실거래가 API'
  };
};

const formatRentItem = (row, assetType) => {
  const year = pick(row, ['dealYear', '년']);
  const month = String(pick(row, ['dealMonth', '월'])).padStart(2, '0');
  const day = String(pick(row, ['dealDay', '일'])).padStart(2, '0');
  const deposit = stripCommaNumber(pick(row, ['deposit', '보증금액']));
  const monthly = stripCommaNumber(pick(row, ['monthlyRent', '월세금액']));
  const area = pick(row, ['excluUseAr', '전용면적']);
  const floor = pick(row, ['floor', '층']);
  const name = pick(row, assetType === 'villa' ? ['houseName', '연립다세대', '단지', '건물명'] : ['aptNm', '아파트', '단지명']);
  return {
    date: `${year}.${month}.${day}`,
    name,
    size: area ? `${Number(area).toFixed(2)}㎡` : '-',
    floor: floor ? `${floor}층` : '-',
    price: monthly > 0 ? `보증금 ${(deposit / 10000).toFixed(2)}억 / 월세 ${monthly}만` : `${(deposit / 10000).toFixed(2)}억`,
    rawDeposit: deposit,
    rawMonthlyRent: monthly,
    source: '국토교통부 실거래가 API'
  };
};

const buildMolitUrl = (endpoint, params) => {
  const key = MOLIT_API_KEY.includes('%') ? MOLIT_API_KEY : encodeURIComponent(MOLIT_API_KEY);
  const query = new URLSearchParams({ ...params, pageNo: '1', numOfRows: '100' });
  return `${endpoint}?serviceKey=${key}&${query.toString()}`;
};

const fetchMolitEndpoint = async (endpoint, lawdCode, dealYmd) => {
  const response = await fetch(buildMolitUrl(endpoint, { LAWD_CD: lawdCode, DEAL_YMD: dealYmd }), {
    headers: { Accept: 'application/xml,text/xml,*/*' }
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`MOLIT ${response.status}: ${text.slice(0, 120)}`);
  if (text.includes('SERVICE_KEY_IS_NOT_REGISTERED_ERROR') || text.includes('INVALID_REQUEST_PARAMETER_ERROR')) {
    throw new Error(`MOLIT 인증/요청 오류: ${text.slice(0, 180)}`);
  }
  return extractXmlItems(text);
};

const collectMolitTransactions = async (query, type) => {
  if (!MOLIT_API_KEY) {
    return { enabled: false, prices: [], rentals: [], lawd: resolveLawdCode(query), months: [], warnings: ['MOLIT_API_KEY 또는 DATA_GO_KR_SERVICE_KEY가 없습니다.'] };
  }

  const assetType = type === 'VILLA_ANALYSIS' ? 'villa' : 'apartment';
  const lawd = resolveLawdCode(query);
  const months = getRecentMonths(12);
  const endpoints = MOLIT_ENDPOINTS[assetType];
  const warnings = [];
  const tradeRows = [];
  const rentRows = [];

  for (const dealYmd of months) {
    if (tradeRows.length < 15) {
      try {
        tradeRows.push(...await fetchMolitEndpoint(endpoints.trade, lawd.code, dealYmd));
      } catch (error) {
        warnings.push(`${dealYmd} 매매 조회 실패: ${error.message}`);
      }
    }
    if (rentRows.length < 10) {
      try {
        rentRows.push(...await fetchMolitEndpoint(endpoints.rent, lawd.code, dealYmd));
      } catch (error) {
        warnings.push(`${dealYmd} 전월세 조회 실패: ${error.message}`);
      }
    }
    if (tradeRows.length >= 15 && rentRows.length >= 10) break;
  }

  const filteredTrades = tradeRows.filter((row) => itemMatchesQuery(row, query, assetType));
  const filteredRents = rentRows.filter((row) => itemMatchesQuery(row, query, assetType));
  const prices = (filteredTrades.length ? filteredTrades : tradeRows).slice(0, 5).map((row) => formatTradeItem(row, assetType));
  const rentals = (filteredRents.length ? filteredRents : rentRows).slice(0, 3).map((row) => formatRentItem(row, assetType));

  return {
    enabled: true,
    lawd,
    months,
    prices,
    rentals,
    rawCounts: { trade: tradeRows.length, rent: rentRows.length, filteredTrade: filteredTrades.length, filteredRent: filteredRents.length },
    warnings: warnings.slice(0, 4)
  };
};

const extractJson = (text = '') => {
  try {
    return JSON.parse(text);
  } catch (_) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Gemini 응답에서 JSON 객체를 찾지 못했습니다.');
    return JSON.parse(match[0]);
  }
};

const callGeminiGrounded = async (prompt) => {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY가 .env 파일에 설정되지 않았습니다.');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: {
      'x-goog-api-key': GEMINI_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.25
      }
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Gemini ${response.status}`);
  }

  const candidate = payload.candidates?.[0] || {};
  const text = candidate.content?.parts?.map((part) => part.text || '').join('\n') || '';
  return {
    data: extractJson(text),
    grounding: candidate.groundingMetadata || {}
  };
};

const getGroundingSources = (grounding = {}) => {
  const chunks = grounding.groundingChunks || [];
  return chunks
    .map((chunk) => chunk.web)
    .filter(Boolean)
    .map((web) => ({ title: web.title || web.uri, url: web.uri }))
    .slice(0, 8);
};

const buildPrompt = ({ query, type, molitData }) => `
당신은 대한민국 부동산 전문 분석 AI "RE Master Analyst"입니다.
반드시 최신 웹 검색과 아래 국토교통부 실거래가 API 원자료만 근거로 삼아 JSON만 반환하세요.

사용자 검색어: ${query}
분석 타입: ${type}
국토교통부 조회 법정동 코드: ${molitData.lawd.code} (${molitData.lawd.label}, ${molitData.lawd.confidence})
조회 월: ${molitData.months.join(', ')}
실제 매매 실거래가 5건:
${JSON.stringify(molitData.prices, null, 2)}
실제 전월세 실거래가 3건:
${JSON.stringify(molitData.rentals, null, 2)}

규칙:
1. data.prices와 data.rentals는 위 국토부 실거래가 데이터를 그대로 사용한다.
2. 정책, 개발호재, 뉴스, 리스크, 팩트체크는 Google Search grounding 결과로 검증한다.
3. 모르면 지어내지 말고 "확인 필요"라고 쓴다.
4. 모든 출처는 searchLog 또는 data.factCheck.source에 남긴다.
5. 아래 스키마를 유지하고 JSON 외 텍스트를 절대 쓰지 않는다.

{
  "summary": "${query} 실거래가 기반 부동산 분석 리포트",
  "searchLog": [{"query": "...", "result": "..."}],
  "sourceLevels": { "L1": "국토교통부 실거래가 API", "L2": "Gemini Google Search grounding", "L3": "AI 분석 보조" },
  "score": 80,
  "grade": "A",
  "rank": { "region": "...", "percentile": "...", "position": "..." },
  "prospectScore": 80,
  "investmentVerdict": "...",
  "regulationMatrix": { "region": "...", "isSpeculative": "...", "isAdjustment": "...", "isPriceLimit": "...", "isPermitRequired": "...", "ltvLimit": "...", "dsrStatus": "..." },
  "taxSimulation": { "acquisition": "...", "holding": "...", "capitalGains": "...", "taxBreakdown": { "propertyTax": "...", "wealthTax": "...", "eduTax": "..." } },
  "loanGuidance": { "ltv": "...", "dsr": "...", "maxLoan": "..." },
  "supplyDemand": { "upcomingSupply": [ { "year": "2026", "count": "...", "status": "..." } ], "unsold": "...", "volume": "..." },
  "subscriptionGuide": { "method": "...", "qualification": "...", "upcoming": [ { "name": "...", "schedule": "...", "price": "..." } ] },
  "macroIndicators": { "baseRate": "...", "mortgageRate": "...", "sentiment": "...", "inflation": "...", "volumeAnalysis": { "current": "...", "avg3Year": "...", "ratio": "...", "status": "..." }, "marketTemperature": { "score": 60, "status": "Warm", "trend": "Stable" }, "riskFactors": ["...", "..."] },
  "valuationMetrics": { "pir": "...", "pricePerPyung": "...", "regionalAvgPyung": "...", "valuationStatus": "...", "bubbleIndex": "..." },
  "aiForecast": { "confidence": "70%", "prediction6m": "...", "prediction12m": "...", "drivers": ["..."], "riskFactors": ["..."] },
  "locationFactors": [ { "label": "교통", "base": 15, "max": 20, "desc": "...", "score": 15, "reason": "..." }, { "label": "학군", "base": 12, "max": 15, "desc": "...", "score": 12, "reason": "..." }, { "label": "인프라", "base": 10, "max": 12, "desc": "...", "score": 10, "reason": "..." }, { "label": "규모", "base": 8, "max": 10, "desc": "...", "score": 8, "reason": "..." }, { "label": "브랜드", "base": 7, "max": 8, "desc": "...", "score": 7, "reason": "..." }, { "label": "연식", "base": 6, "max": 8, "desc": "...", "score": 6, "reason": "..." }, { "label": "환경", "base": 6, "max": 8, "desc": "...", "score": 6, "reason": "..." }, { "label": "호재", "base": 7, "max": 10, "desc": "...", "score": 7, "reason": "..." }, { "label": "수급", "base": 3, "max": 5, "desc": "...", "score": 3, "reason": "..." }, { "label": "규제", "base": 3, "max": 4, "desc": "...", "score": 3, "reason": "..." } ],
  "data": {
    "prices": [],
    "rentals": [],
    "pros": ["..."], "cons": ["..."],
    "trends": { "1M": "...", "3M": "...", "6M": "...", "1Y": "...", "3Y": "...", "5Y": "..." },
    "comparison": [ { "name": "...", "price": "...", "diff": "...", "ratio": "...", "rating": "...", "features": "..." } ],
    "valuation": { "status": "...", "reason": "..." },
    "factCheck": [ { "topic": "...", "status": "CONFIRMED", "level": 1, "detail": "...", "source": "..." } ],
    "riskMatrix": [ { "type": "시장 리스크", "level": "중간", "desc": "...", "strategy": "..." }, { "type": "정책 리스크", "level": "중간", "desc": "...", "strategy": "..." }, { "type": "공급 리스크", "level": "중간", "desc": "...", "strategy": "..." }, { "type": "유동성 리스크", "level": "중간", "desc": "...", "strategy": "..." } ],
    "swot": { "strengths": ["..."], "weaknesses": ["..."], "opportunities": ["..."], "threats": ["..."] },
    "decisionGuide": { "verdict": "...", "stars": 4, "targetPrice": "...", "fairPrice": "...", "ceilingPrice": "...", "stopLoss": "...", "horizon": "...", "rationale": "..." },
    "scenarioAnalysis": [ { "type": "상승", "condition": "...", "impact": "...", "price": "..." }, { "type": "중립", "condition": "...", "impact": "...", "price": "..." }, { "type": "하락", "condition": "...", "impact": "...", "price": "..." } ],
    "policies": [ { "area": "...", "status": "...", "impact": "...", "detail": "..." } ],
    "villaRisk": [ { "label": "전세가율", "value": "...", "status": "...", "desc": "...", "level": "L1" } ],
    "villaValuation": { "estimatedPrice": "...", "officialPrice": "...", "priceRatio": "...", "liquidityScore": "..." },
    "villaYield": { "monthlyRent": "...", "deposit": "...", "annualYield": "...", "gapInvestment": "..." }
  }
}
`;

const mergeRealData = (analysis, molitData, grounding) => {
  const sources = getGroundingSources(grounding);
  const searchLog = [
    { query: `국토교통부 실거래가 API ${molitData.lawd.code} ${molitData.months[0] || ''}`, result: `매매 ${molitData.prices.length}건, 전월세 ${molitData.rentals.length}건 반영` },
    ...(grounding.webSearchQueries || []).map((query) => ({ query, result: 'Gemini Google Search grounding 확인' })),
    ...sources.map((source) => ({ query: source.title, result: source.url }))
  ];

  return {
    ...analysis,
    sourceLevels: {
      L1: '국토교통부 실거래가 API',
      L2: 'Gemini Google Search grounding',
      L3: 'AI 분석 보조'
    },
    searchLog: [...searchLog, ...(analysis.searchLog || [])].slice(0, 12),
    data: {
      ...(analysis.data || {}),
      prices: molitData.prices,
      rentals: molitData.rentals
    },
    realDataMeta: {
      molit: {
        lawd: molitData.lawd,
        months: molitData.months,
        rawCounts: molitData.rawCounts,
        warnings: molitData.warnings
      },
      groundingSources: sources
    }
  };
};

app.get('/api/health', (_, res) => {
  res.json({
    ok: true,
    version: '2.1.2',
    molit: Boolean(MOLIT_API_KEY),
    geminiGrounding: Boolean(GEMINI_API_KEY),
    model: GEMINI_MODEL
  });
});

app.post('/api/analyze', async (req, res) => {
  const { query, type } = req.body;

  if (!query || !String(query).trim()) {
    return res.status(400).json({ error: '검색어가 필요합니다.' });
  }

  console.log(`[AI Server] 분석 요청: ${query} (Type: ${type})`);

  try {
    const molitData = await collectMolitTransactions(query, type);
    if (!molitData.enabled) {
      return res.status(503).json({ error: '국토교통부 실거래가 API 키가 필요합니다.', details: molitData.warnings });
    }
    if (molitData.prices.length === 0 && molitData.rentals.length === 0) {
      return res.status(404).json({ error: '국토교통부 실거래가 조회 결과가 없습니다.', details: molitData });
    }

    const grounded = await callGeminiGrounded(buildPrompt({ query, type, molitData }));
    const merged = mergeRealData(grounded.data, molitData, grounded.grounding);
    console.log('[AI Server] 실거래가 + Google Search grounding 분석 완료');
    res.json(merged);
  } catch (error) {
    console.error('[AI Server] 실데이터 분석 오류:', error);
    res.status(500).json({ error: '실데이터 분석 중 오류가 발생했습니다.', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[RE Master Analyst] AI Backend Server is running on http://localhost:${PORT}`);
  console.log(`[RE Master Analyst] MOLIT API: ${MOLIT_API_KEY ? 'ready' : 'missing'} / Gemini Grounding: ${GEMINI_API_KEY ? 'ready' : 'missing'}`);
});
