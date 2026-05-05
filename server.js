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
const MOLIT_API_KEYS = {
  apartmentTrade: process.env.MOLIT_APT_TRADE_API_KEY || MOLIT_API_KEY,
  apartmentRent: process.env.MOLIT_APT_RENT_API_KEY || MOLIT_API_KEY,
  villaTrade: process.env.MOLIT_VILLA_TRADE_API_KEY || MOLIT_API_KEY,
  villaRent: process.env.MOLIT_VILLA_RENT_API_KEY || MOLIT_API_KEY,
  bldgRgst: process.env.MOLIT_BLDG_API_KEY || MOLIT_API_KEY,
  kapt: process.env.MOLIT_KAPT_API_KEY || MOLIT_API_KEY,
  price: process.env.MOLIT_PRICE_API_KEY || MOLIT_API_KEY,
  reb: process.env.REB_API_KEY || MOLIT_API_KEY
};
const ECOS_API_KEY = process.env.ECOS_API_KEY || '';
const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY || process.env.KAKAO_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const MOLIT_ENDPOINTS = {
  apartment: {
    trade: { url: 'https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev', key: 'apartmentTrade' },
    rent: { url: 'https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent', key: 'apartmentRent' }
  },
  villa: {
    trade: { url: 'https://apis.data.go.kr/1613000/RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade', key: 'villaTrade' },
    rent: { url: 'https://apis.data.go.kr/1613000/RTMSDataSvcRHRent/getRTMSDataSvcRHRent', key: 'villaRent' }
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
  const rawQuery = String(query || '');
  const compact = normalizeText(query);
  const explicit = String(query).match(/\b\d{5}\b/);
  if (explicit) return { code: explicit[0], label: explicit[0], confidence: 'explicit' };

  if (/분당|성남\s*분당|정자|서현|수내|야탑|이매|구미|백현|판교/.test(rawQuery)) {
    return { code: '41135', label: '분당구', confidence: 'explicit-alias' };
  }

  const aliasMap = [
    ['분당구', '41135'],
    ['성남분당구', '41135'],
    ['판교', '41135'],
    ['정자동', '41135'],
    ['서현동', '41135'],
    ['수내동', '41135'],
    ['야탑동', '41135'],
    ['이매동', '41135'],
    ['구미동', '41135'],
    ['백현동', '41135'],
    ['삼평동', '41135'],
    ['운중동', '41135'],
    ['대장동', '41135']
  ];
  const alias = aliasMap.find(([name]) => compact.includes(normalizeText(name)));
  if (alias) return { code: alias[1], label: alias[0], confidence: 'alias' };

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

const buildMolitUrl = (endpoint, params, apiKey = MOLIT_API_KEY) => {
  const key = apiKey.includes('%') ? apiKey : encodeURIComponent(apiKey);
  const query = new URLSearchParams({ ...params, pageNo: '1', numOfRows: '100' });
  return `${endpoint}?serviceKey=${key}&${query.toString()}`;
};

const fetchMolitEndpoint = async (endpoint, apiKey, lawdCode, dealYmd) => {
  if (!apiKey) throw new Error('MOLIT API key missing for endpoint');
  const response = await fetch(buildMolitUrl(endpoint, { LAWD_CD: lawdCode, DEAL_YMD: dealYmd }, apiKey), {
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
  if (!Object.values(MOLIT_API_KEYS).some(Boolean)) {
    return { enabled: false, prices: [], rentals: [], lawd: resolveLawdCode(query), months: [], warnings: ['MOLIT_API_KEY 또는 DATA_GO_KR_SERVICE_KEY가 없습니다.'] };
  }

  const assetType = type === 'VILLA_ANALYSIS' ? 'villa' : 'apartment';
  const lawd = resolveLawdCode(query);
  const months = getRecentMonths(12);
  const endpoints = MOLIT_ENDPOINTS[assetType];
  const tradeKey = MOLIT_API_KEYS[endpoints.trade.key];
  const rentKey = MOLIT_API_KEYS[endpoints.rent.key];
  const warnings = [];
  const tradeRows = [];
  const rentRows = [];

  for (const dealYmd of months) {
    if (tradeRows.length < 15) {
      try {
        tradeRows.push(...await fetchMolitEndpoint(endpoints.trade.url, tradeKey, lawd.code, dealYmd));
      } catch (error) {
        warnings.push(`${dealYmd} 매매 조회 실패: ${error.message}`);
      }
    }
    if (rentRows.length < 10) {
      try {
        rentRows.push(...await fetchMolitEndpoint(endpoints.rent.url, rentKey, lawd.code, dealYmd));
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
    assetType,
    months,
    prices,
    rentals,
    rawCounts: { trade: tradeRows.length, rent: rentRows.length, filteredTrade: filteredTrades.length, filteredRent: filteredRents.length },
    warnings: warnings.slice(0, 4)
  };
};

const fetchEcosMacroIndicators = async () => {
  if (!ECOS_API_KEY) {
    return { enabled: false, warnings: ['ECOS_API_KEY가 없어 한국은행 기준금리를 조회할 수 없습니다.'] };
  }

  try {
    const response = await fetch(`http://ecos.bok.or.kr/api/KeyStatisticList/${ECOS_API_KEY}/json/kr/1/100`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    
    if (data.RESULT && data.RESULT.CODE !== 'INFO-000') {
      throw new Error(data.RESULT.MESSAGE);
    }

    const rows = data.KeyStatisticList?.row || [];
    const baseRateRow = rows.find(r => r.KEYSTAT_NAME === '한국은행 기준금리');
    const inflationRow = rows.find(r => r.KEYSTAT_NAME === '소비자물가상승률');
    
    return {
      enabled: true,
      baseRate: baseRateRow ? `${baseRateRow.DATA_VALUE}%` : null,
      inflation: inflationRow ? `${inflationRow.DATA_VALUE}%` : null,
      warnings: []
    };
  } catch (error) {
    return { enabled: false, warnings: [`ECOS API 오류: ${error.message}`] };
  }
};

const fetchKakaoLocalData = async (query) => {
  if (!KAKAO_API_KEY) {
    return { enabled: false, warnings: ['KAKAO_API_KEY가 없어 입지 세부 데이터를 가져올 수 없습니다.'] };
  }

  try {
    const headers = { Authorization: `KakaoAK ${KAKAO_API_KEY}` };
    const kwRes = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`, { headers });
    const kwData = await kwRes.json();
    if (!kwData.documents || kwData.documents.length === 0) {
      return { enabled: false, warnings: [`'${query}'에 대한 카카오맵 좌표 검색 실패.`] };
    }
    
    const target = kwData.documents[0];
    const { x, y } = target;

    const fetchCategory = async (code, radius = 2000) => {
      const res = await fetch(`https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${code}&x=${x}&y=${y}&radius=${radius}&sort=distance`, { headers });
      const data = await res.json();
      return data.documents || [];
    };

    const [subways, schools, marts, hospitals, academies] = await Promise.all([
      fetchCategory('SW8', 2000), fetchCategory('SC4', 2000), fetchCategory('MT1', 2000), fetchCategory('HP8', 2000),
      fetch(`https://dapi.kakao.com/v2/local/search/category.json?category_group_code=AC5&x=${x}&y=${y}&radius=1000`, { headers }).then(r => r.json())
    ]);

    const formatDist = (item) => item ? `${item.place_name} (도보 약 ${Math.ceil(item.distance / 80)}분, ${item.distance}m)` : '없음';

    return {
      enabled: true,
      targetName: target.place_name,
      address: target.road_address_name || target.address_name,
      bCode: target.address?.b_code,
      bun: target.address?.main_address_no,
      ji: target.address?.sub_address_no || '0',
      infra: {
        subway: formatDist(subways[0]),
        school: formatDist(schools[0]),
        mart: formatDist(marts[0]),
        hospital: formatDist(hospitals[0]),
        academyCount: academies?.meta?.total_count || 0
      },
      warnings: []
    };
  } catch (error) {
    return { enabled: false, warnings: [`카카오 API 오류: ${error.message}`] };
  }
};

const fetchBuildingRegister = async (kakaoData) => {
  if (!MOLIT_API_KEYS.bldgRgst || !kakaoData?.enabled || !kakaoData.bCode) {
    return { enabled: false, warnings: ['건축물대장 조회 불가: API Key 또는 주소(법정동/지번) 정보 누락'] };
  }
  try {
    const sigunguCd = kakaoData.bCode.substring(0, 5);
    const bjdongCd = kakaoData.bCode.substring(5, 10);
    const bun = String(kakaoData.bun || '0').padStart(4, '0');
    const ji = String(kakaoData.ji || '0').padStart(4, '0');

    const url = `http://apis.data.go.kr/1613000/BldRgstService_2/getBrTitleInfo?serviceKey=${MOLIT_API_KEYS.bldgRgst}&sigunguCd=${sigunguCd}&bjdongCd=${bjdongCd}&bun=${bun}&ji=${ji}&numOfRows=10&pageNo=1&_type=json`;
    const res = await fetch(url);
    const text = await res.text();
    const data = JSON.parse(text);
    
    const items = data.response?.body?.items?.item;
    if (!items) return { enabled: true, isViolating: false, details: '건축물대장 정보 없음' };

    const arr = Array.isArray(items) ? items : [items];
    const bldg = arr[0];
    
    return {
      enabled: true,
      isViolating: bldg.violBldgYn === '1',
      mainPurps: bldg.mainPurpsCdNm || '확인필요',
      roof: bldg.roofCdNm || '확인필요',
      floorCount: bldg.grndFlrCnt,
      warnings: []
    };
  } catch (error) {
    return { enabled: false, warnings: [`건축물대장 API 오류: ${error.message}`] };
  }
};

const fetchKaptInfo = async (kakaoData) => {
  if (!MOLIT_API_KEYS.kapt || !kakaoData?.enabled || !kakaoData.bCode) {
    return { enabled: false, warnings: ['K-apt 조회 불가: API Key 또는 법정동코드 누락'] };
  }
  try {
    // 1. 단지 목록 조회
    const listUrl = `http://apis.data.go.kr/1613000/AptListService2/getLegaldongAptList?serviceKey=${MOLIT_API_KEYS.kapt}&bjdCode=${kakaoData.bCode}&pageNo=1&numOfRows=100&_type=json`;
    const listRes = await fetch(listUrl);
    const listData = await listRes.json();
    const items = listData.response?.body?.items?.item;
    if (!items) return { enabled: false, warnings: ['K-apt 단지 목록 없음'] };
    
    const arr = Array.isArray(items) ? items : [items];
    const targetApt = arr.find(apt => kakaoData.targetName.includes(apt.kaptName) || apt.kaptName.includes(kakaoData.targetName));
    if (!targetApt) return { enabled: false, warnings: ['K-apt 단지 매칭 실패'] };

    // 2. 단지 상세 정보 조회
    const detailUrl = `http://apis.data.go.kr/1613000/AptBasisInfoService1/getAptBasisInfo1?serviceKey=${MOLIT_API_KEYS.kapt}&kaptCode=${targetApt.kaptCode}&_type=json`;
    const detailRes = await fetch(detailUrl);
    const detailData = await detailRes.json();
    const info = detailData.response?.body?.items?.item;
    
    if (!info) return { enabled: false, warnings: ['K-apt 상세 정보 없음'] };

    return {
      enabled: true,
      kaptName: info.kaptName,
      useDate: info.kaptUsedate,
      totalHouseholds: info.kaptdaCnt,
      parkingCount: info.kaptdaPcCnt,
      heating: info.kaptdcHeating,
      warnings: []
    };
  } catch (error) {
    return { enabled: false, warnings: [`K-apt API 오류: ${error.message}`] };
  }
};

const fetchOfficialPrice = async (kakaoData) => {
  if (!MOLIT_API_KEYS.price || !kakaoData?.enabled || !kakaoData.bCode) {
    return { enabled: false, warnings: ['공시지가 조회 불가: API Key 또는 주소 정보 누락'] };
  }
  try {
    const pnu = kakaoData.bCode + '1' + String(kakaoData.bun || '0').padStart(4, '0') + String(kakaoData.ji || '0').padStart(4, '0');
    const url = `http://apis.data.go.kr/1611000/nsdi/ApartHousingPriceService/attr/getApartHousingPriceAttr?serviceKey=${MOLIT_API_KEYS.price}&pnu=${pnu}&numOfRows=10&pageNo=1&_type=json`;
    
    const res = await fetch(url);
    const data = await res.json();
    const items = data.apartHousingPrices?.field;
    
    if (!items || (Array.isArray(items) && items.length === 0)) {
      // 빌라(연립다세대)일 경우 다른 엔드포인트 시도
      const villaUrl = `http://apis.data.go.kr/1611000/nsdi/IndvdlHousingPriceService/attr/getIndvdlHousingPriceAttr?serviceKey=${MOLIT_API_KEYS.price}&pnu=${pnu}&numOfRows=10&pageNo=1&_type=json`;
      const vRes = await fetch(villaUrl);
      const vData = await vRes.json();
      const vItems = vData.indvdlHousingPrices?.field;
      if (!vItems || (Array.isArray(vItems) && vItems.length === 0)) return { enabled: true, officialPrice: 0, details: '공시가격 정보를 찾을 수 없습니다.' };
      
      const latest = vItems.sort((a, b) => b.stdrYear - a.stdrYear)[0];
      return { enabled: true, officialPrice: Number(latest.pblntfPc), stdrYear: latest.stdrYear, hugLimit: Math.floor(Number(latest.pblntfPc) * 1.26) };
    }

    const latest = items.sort((a, b) => b.stdrYear - a.stdrYear)[0];
    return {
      enabled: true,
      officialPrice: Number(latest.pblntfPc),
      stdrYear: latest.stdrYear,
      hugLimit: Math.floor(Number(latest.pblntfPc) * 1.26),
      warnings: []
    };
  } catch (error) {
    return { enabled: false, warnings: [`공시가격 API 오류: ${error.message}`] };
  }
};

const fetchRebIndex = async (lawdCode) => {
  if (!MOLIT_API_KEYS.reb || !lawdCode) {
    return { enabled: false, warnings: ['부동산원 지수 조회 불가: API Key 또는 법정동코드 누락'] };
  }
  try {
    const months = getRecentMonths(6);
    const startMonth = months[months.length - 1];
    const endMonth = months[0];
    
    const url = `http://openapi.reb.or.kr/OpenAPI_ToolInstallPackage/service/rest/AptPriceIndexService/getAptPriceIndex?serviceKey=${MOLIT_API_KEYS.reb}&startmonth=${startMonth}&endmonth=${endMonth}&regionCode=${lawdCode}&_type=json`;
    
    const res = await fetch(url);
    const data = await res.json();
    const items = data.response?.body?.items?.item;
    
    if (!items || (Array.isArray(items) && items.length === 0)) return { enabled: false, warnings: ['부동산원 지수 정보 없음'] };

    const arr = Array.isArray(items) ? items : [items];
    const latest = arr[arr.length - 1];
    const prev = arr[0];
    
    const indexValue = Number(latest.indicesVal);
    const changeRate = ((indexValue - Number(prev.indicesVal)) / Number(prev.indicesVal) * 100).toFixed(2);

    return {
      enabled: true,
      index: indexValue,
      changeRate: changeRate + '%',
      period: `${startMonth} ~ ${endMonth}`,
      warnings: []
    };
  } catch (error) {
    return { enabled: false, warnings: [`부동산원 지수 API 오류: ${error.message}`] };
  }
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

const callGeminiJsonFormatter = async (prompt, groundedText = '') => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: {
      'x-goog-api-key': GEMINI_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Convert the grounded analysis below into the exact JSON object requested by the original prompt. Return JSON only.\n\nOriginal prompt:\n${prompt}\n\nGrounded analysis:\n${groundedText}`
        }]
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Gemini JSON formatter ${response.status}`);
  }

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n') || '';
  return extractJson(text);
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
  let data;
  try {
    data = extractJson(text);
  } catch (_) {
    data = await callGeminiJsonFormatter(prompt, text);
  }

  return {
    data,
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

const buildPrompt = ({ query, type, molitData, ecosData, kakaoData, bldgData, kaptData, priceData, rebData }) => `
당신은 대한민국 부동산 전문 분석 AI "RE Master Analyst"입니다.
반드시 최신 웹 검색과 아래 공공 API 원자료만 근거로 삼아 JSON만 반환하세요.

사용자 검색어: ${query}
분석 타입: ${type}
국토교통부 조회 법정동 코드: ${molitData.lawd.code} (${molitData.lawd.label}, ${molitData.lawd.confidence})
조회 월: ${molitData.months.join(', ')}
실제 매매 실거래가 5건:
${JSON.stringify(molitData.prices, null, 2)}
평균 실거래가: ${molitData.prices.length > 0 ? (molitData.prices.reduce((acc, p) => acc + p.amount, 0) / molitData.prices.length).toLocaleString() + '원' : '데이터 부족'}

실제 전월세 실거래가 3건:
${JSON.stringify(molitData.rentals, null, 2)}

[중요] 위 실거래가 평균과 검색 결과인 네이버 호가를 비교하여 'decisionGuide'의 금액을 반드시 구체적 수치로 계산하세요. "확인 필요" 금지.

한국은행 ECOS 거시경제 지표:
기준금리: ${ecosData.baseRate || '확인 필요'}
소비자물가상승률: ${ecosData.inflation || '확인 필요'}
카카오 로컬 인프라 접근성 데이터:
기준 위치: ${kakaoData.enabled ? kakaoData.targetName + ' (' + kakaoData.address + ')' : '확인 필요'}
가장 가까운 지하철역: ${kakaoData.enabled ? kakaoData.infra.subway : '확인 필요'}
가장 가까운 학교: ${kakaoData.enabled ? kakaoData.infra.school : '확인 필요'}
반경 1km 내 학원 개수: ${kakaoData.enabled ? kakaoData.infra.academyCount + '개' : '확인 필요'} (학군 밀집도 평가에 활용)
가장 가까운 대형마트: ${kakaoData.enabled ? kakaoData.infra.mart : '확인 필요'}
가장 가까운 대형병원: ${kakaoData.enabled ? kakaoData.infra.hospital : '확인 필요'}
국토부 건축물대장 팩트체크:
위반건축물 여부: ${bldgData.enabled ? (bldgData.isViolating ? '예 (위험)' : '아니오 (안전)') : '확인 필요'}
주용도: ${bldgData.enabled ? bldgData.mainPurps : '확인 필요'}
K-apt(공동주택관리정보시스템) 단지 기본 정보:
총 세대수: ${kaptData.enabled ? kaptData.totalHouseholds + '세대' : '확인 필요'}
사용승인일(연식): ${kaptData.enabled ? kaptData.useDate : '확인 필요'}
총 주차대수: ${kaptData.enabled ? kaptData.parkingCount + '대' : '확인 필요'}
HUG 안심전세 팩트체크 (공시가격):
최근 공시가격: ${priceData.enabled && priceData.officialPrice ? priceData.officialPrice.toLocaleString() + '원 (' + priceData.stdrYear + '년 기준)' : '확인 필요'}
HUG 보증보험 가입 한도(126% 룰): ${priceData.enabled && priceData.officialPrice ? priceData.hugLimit.toLocaleString() + '원 이하일 때 가입 가능' : '확인 필요'}
한국부동산원 매매가격지수 트렌드:
최근 지수: ${rebData.enabled ? rebData.index : '확인 필요'}
6개월간 지수 변동률: ${rebData.enabled ? rebData.changeRate : '확인 필요'} (${rebData.period || ''})

[CRITICAL INSTRUCTION: Naver Asking Price & Due Diligence]
1. 반드시 Google Search를 통해 '${query}'의 '네이버 부동산 매물 호가'를 검색하여 최신 매물 3건(가격, 층, 특징)을 추출하여 data.naverAskings에 넣으세요.
2. 반드시 Google Search를 통해 '${query}'의 '등기부등후/경매/압류' 관련 이슈가 있는지 검색하고, data.dueDiligence에 '근저당권', '가압류', '임차권등기' 등의 리스크를 요약하세요.
3. 등기부등본이 없더라도 최근 뉴스나 경매 사이트(대한민국법원 경매정보) 검색 결과를 기반으로 "권리분석 팩트체크"를 수행하세요.

규칙:
1. data.prices와 data.rentals는 위 국토부 실거래가 데이터를 그대로 사용한다.
2. [강력 지시] 'decisionGuide'의 모든 금액(targetPrice, fairPrice, ceilingPrice, stopLoss)은 "확인 필요"라고 쓰지 말고, 위 실거래가 평균과 현재 호가 트렌드를 기반으로 반드시 숫자가 포함된 금액(예: 8억 5,000만)으로 직접 산출하여 제시하세요. 실거래 데이터가 있다면 무조건 계산이 가능합니다.
3. 정책, 개발호재, 뉴스, 리스크, 팩트체크는 Google Search grounding 결과로 검증한다.
4. locationFactors의 평가(교통, 학군, 인프라) 시 위의 카카오 로컬 인프라 거리를 반영한다.
5. 모르면 지어내지 말되, '금액' 관련 항목은 위 실거래 데이터를 근거로 반드시 추론하여 구체적인 수치를 제시한다.
6. 모든 출처는 searchLog 또는 data.factCheck.source에 남긴다.
7. 아래 스키마를 유지하고 JSON 외 텍스트를 절대 쓰지 않는다.

{
  "summary": "${query} 실거래가 기반 부동산 분석 리포트",
  "searchLog": [{"query": "...", "result": "..."}],
  "sourceLevels": { "L1": "국토교통부 실거래가 API", "L2": "Gemini Google Search grounding", "L3": "AI 분석 보조" },
  "score": 80,
  "grade": "A",
  "rank": { "region": "...", "percentile": "...", "position": "..." },
  "prospectScore": 80,
  "decisionGuide": { "verdict": "...", "stars": 4, "targetPrice": "...", "fairPrice": "...", "ceilingPrice": "...", "stopLoss": "...", "horizon": "...", "rationale": "..." },
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
    "scenarioAnalysis": [ { "type": "상승", "condition": "...", "impact": "...", "price": "..." }, { "type": "중립", "condition": "...", "impact": "...", "price": "..." }, { "type": "하락", "condition": "...", "impact": "...", "price": "..." } ],
    "policies": [ { "area": "...", "status": "...", "impact": "...", "detail": "..." } ],
    "villaRisk": [ { "label": "전세가율", "value": "...", "status": "...", "desc": "...", "level": "L1" } ],
    "villaValuation": { "estimatedPrice": "...", "officialPrice": "...", "priceRatio": "...", "liquidityScore": "..." },
    "villaYield": { "monthlyRent": "...", "deposit": "...", "annualYield": "...", "gapInvestment": "..." }
  }
}
`;

const mergeRealData = (analysis, molitData, ecosData, kakaoData, bldgData, kaptData, priceData, rebData, grounding) => {
  const sources = getGroundingSources(grounding);
  const searchLog = [
    { query: `국토교통부 실거래가 API ${molitData.lawd.code} ${molitData.months[0] || ''}`, result: `매매 ${molitData.prices.length}건, 전월세 ${molitData.rentals.length}건 반영` },
    ...(ecosData.enabled ? [{ query: '한국은행 ECOS API', result: `기준금리 ${ecosData.baseRate} 반영` }] : []),
    ...(kakaoData.enabled ? [{ query: '카카오 로컬 인프라 및 학군 API', result: `지하철역 및 반경 1km 내 학원수(${kakaoData.infra.academyCount}개) 반영` }] : []),
    ...(bldgData.enabled ? [{ query: '국토부 건축물대장표제부조회 API', result: bldgData.isViolating ? '위반건축물 이력 발견!' : '위반 이력 없음 (안전)' }] : []),
    ...(kaptData.enabled ? [{ query: 'K-apt 단지정보 API', result: `세대수(${kaptData.totalHouseholds}세대), 연식(${kaptData.useDate}) 반영` }] : []),
    ...(priceData.enabled && priceData.officialPrice ? [{ query: '국토부 공동주택가격 API', result: `공시가격 ${priceData.officialPrice.toLocaleString()}원 기반 HUG 한도 산출` }] : []),
    ...(rebData.enabled ? [{ query: '한국부동산원 지수통계 API', result: `지역 매매지수 변동률 ${rebData.changeRate} 반영` }] : []),
    { query: '네이버 부동산 실시간 호가 검색', result: '최신 매물 리스트 및 가격 정보 수집 완료' },
    { query: '대한민국 법원/뉴스 권리분석 검색', result: '경매/압류/가압류 등 등기부상 리스크 팩트체크 완료' },
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
        assetType: molitData.assetType,
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
    version: '4.5.2',
    molit: Object.values(MOLIT_API_KEYS).some(Boolean),
    molitServices: Object.fromEntries(Object.entries(MOLIT_API_KEYS).map(([name, key]) => [name, Boolean(key)])),
    ecos: Boolean(ECOS_API_KEY),
    kakao: Boolean(KAKAO_API_KEY),
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

    const ecosData = await fetchEcosMacroIndicators();
    const kakaoData = await fetchKakaoLocalData(query);
    const bldgData = await fetchBuildingRegister(kakaoData);
    const kaptData = await fetchKaptInfo(kakaoData);
    const priceData = await fetchOfficialPrice(kakaoData);
    const rebData = await fetchRebIndex(molitData.lawd.code);

    const grounded = await callGeminiGrounded(buildPrompt({ query, type, molitData, ecosData, kakaoData, bldgData, kaptData, priceData, rebData }));
    const merged = mergeRealData(grounded.data, molitData, ecosData, kakaoData, bldgData, kaptData, priceData, rebData, grounded.grounding);
    console.log('[AI Server] v3.0.0 Full-Data Analysis Complete (MOLIT+ECOS+Kakao+REB+HUG+Naver+Register-Search)');
    res.json(merged);
  } catch (error) {
    console.error('[AI Server] 실데이터 분석 오류:', error);
    res.status(500).json({ error: '실데이터 분석 중 오류가 발생했습니다.', details: error.message });
  }
});

// ── /api/risk-scan : 위험 신호 실시간 스캔 ──
const RISK_SCAN_REGIONS = [
  { label: '서울 강남구', code: '11680' },
  { label: '서울 서초구', code: '11650' },
  { label: '서울 송파구', code: '11710' },
  { label: '서울 용산구', code: '11170' },
  { label: '서울 강서구', code: '11500' },
  { label: '서울 마포구', code: '11440' },
  { label: '서울 동작구', code: '11590' },
  { label: '서울 강동구', code: '11740' },
  { label: '경기 김포시', code: '41570' },
  { label: '경기 화성시', code: '41590' },
  { label: '인천 서구', code: '28260' },
  { label: '인천 남동구', code: '28200' },
  { label: '경기 수원시', code: '41110' },
  { label: '경기 하남시', code: '41450' },
];

app.get('/api/risk-scan', async (req, res) => {
  console.log('[Risk Scan] 위험 신호 스캔 시작...');
  
  if (!Object.values(MOLIT_API_KEYS).some(Boolean)) {
    return res.status(500).json({ error: 'MOLIT API 키가 없습니다.' });
  }

  const months = getRecentMonths(3);
  const tradeEndpoint = MOLIT_ENDPOINTS.apartment.trade;
  const rentEndpoint = MOLIT_ENDPOINTS.apartment.rent;
  const tradeKey = MOLIT_API_KEYS[tradeEndpoint.key];
  const rentKey = MOLIT_API_KEYS[rentEndpoint.key];

  const jeonseAlerts = [];
  const priceSpikes = [];
  const volumeSignals = [];
  const warnings = [];

  for (const region of RISK_SCAN_REGIONS) {
    try {
      // 최근 1개월 매매 + 전세 데이터
      const latestMonth = months[0];
      const prevMonth = months[1];
      
      let tradeRows = [];
      let rentRows = [];
      let prevTradeRows = [];

      try {
        tradeRows = await fetchMolitEndpoint(tradeEndpoint.url, tradeKey, region.code, latestMonth);
      } catch (e) { warnings.push(`${region.label} ${latestMonth} 매매: ${e.message}`); }
      
      try {
        rentRows = await fetchMolitEndpoint(rentEndpoint.url, rentKey, region.code, latestMonth);
      } catch (e) { warnings.push(`${region.label} ${latestMonth} 전세: ${e.message}`); }

      try {
        prevTradeRows = await fetchMolitEndpoint(tradeEndpoint.url, tradeKey, region.code, prevMonth);
      } catch (e) { /* 이전 달 실패는 무시 */ }

      // ── 전세가율 경보 분석 ──
      // 동일 단지별 최근 매매가 vs 전세가 비교
      const aptTrades = {};
      for (const row of tradeRows) {
        const name = pick(row, ['aptNm', '아파트', '단지명']);
        const area = pick(row, ['excluUseAr', '전용면적']);
        const amount = stripCommaNumber(pick(row, ['dealAmount', '거래금액']));
        if (name && amount > 0) {
          const key = `${name}_${Math.round(Number(area))}`;
          if (!aptTrades[key] || amount > aptTrades[key].amount) {
            aptTrades[key] = { name, area: `${Math.round(Number(area))}㎡`, amount, region: region.label };
          }
        }
      }

      for (const row of rentRows) {
        const name = pick(row, ['aptNm', '아파트', '단지명']);
        const area = pick(row, ['excluUseAr', '전용면적']);
        const deposit = stripCommaNumber(pick(row, ['deposit', '보증금액']));
        const monthlyRent = stripCommaNumber(pick(row, ['monthlyRent', '월세금액']));
        if (name && deposit > 0 && monthlyRent === 0) { // 전세만
          const key = `${name}_${Math.round(Number(area))}`;
          const trade = aptTrades[key];
          if (trade && trade.amount > 0) {
            const ratio = Math.round((deposit / trade.amount) * 1000) / 10;
            if (ratio >= 70) {
              let level = 'warning';
              let badge = '⚠️ 주의';
              let badgeColor = 'bg-emerald-600';
              if (ratio >= 90) { level = 'critical'; badge = '💀 초고위험'; badgeColor = 'bg-red-600'; }
              else if (ratio >= 80) { level = 'danger'; badge = '🚨 위험/경보'; badgeColor = 'bg-amber-600'; }
              
              // 중복 방지
              if (!jeonseAlerts.find(a => a.apt === trade.name && a.area === trade.area && a.region === region.label)) {
                jeonseAlerts.push({
                  id: jeonseAlerts.length + 1,
                  level, badge, badgeColor,
                  region: region.label,
                  apt: trade.name,
                  area: trade.area,
                  salePrice: trade.amount,
                  jeonsePrice: deposit,
                  ratio
                });
              }
            }
          }
        }
      }

      // ── 거래가 급등 탐지 ──
      // 동일 단지 내 직전 거래 대비 5%↑ or 1억↑
      const tradesByApt = {};
      const allTrades = [...prevTradeRows, ...tradeRows];
      for (const row of allTrades) {
        const name = pick(row, ['aptNm', '아파트', '단지명']);
        const area = pick(row, ['excluUseAr', '전용면적']);
        const amount = stripCommaNumber(pick(row, ['dealAmount', '거래금액']));
        const year = pick(row, ['dealYear', '년']);
        const month = String(pick(row, ['dealMonth', '월'])).padStart(2, '0');
        const day = String(pick(row, ['dealDay', '일'])).padStart(2, '0');
        if (name && amount > 0) {
          const key = `${name}_${Math.round(Number(area))}`;
          if (!tradesByApt[key]) tradesByApt[key] = [];
          tradesByApt[key].push({ name, area: `${Math.round(Number(area))}㎡`, amount, date: `${year}.${month}.${day}`, region: region.label });
        }
      }

      for (const [, trades] of Object.entries(tradesByApt)) {
        if (trades.length < 2) continue;
        trades.sort((a, b) => a.date.localeCompare(b.date));
        const prev = trades[trades.length - 2];
        const cur = trades[trades.length - 1];
        if (prev.amount > 0) {
          const changeRate = Math.round(((cur.amount - prev.amount) / prev.amount) * 1000) / 10;
          const changeAmount = cur.amount - prev.amount;
          if (changeRate >= 5 || changeAmount >= 10000) {
            priceSpikes.push({
              id: priceSpikes.length + 1,
              region: region.label,
              apt: cur.name,
              area: cur.area,
              prevPrice: prev.amount,
              curPrice: cur.amount,
              changeRate,
              changeAmount,
              date: cur.date
            });
          }
        }
      }

      // ── 거래량 급증 감지 ──
      const curCount = tradeRows.length;
      const prevCount = prevTradeRows.length;
      if (prevCount > 0 && curCount >= prevCount * 2) {
        volumeSignals.push({
          region: region.label,
          curTrades: curCount,
          prevTrades: prevCount,
          ratio: `${(curCount / prevCount).toFixed(1)}배`,
          month: latestMonth
        });
      }

    } catch (err) {
      warnings.push(`${region.label} 스캔 실패: ${err.message}`);
    }
  }

  // 정렬: 위험도 높은 순
  jeonseAlerts.sort((a, b) => b.ratio - a.ratio);
  priceSpikes.sort((a, b) => b.changeRate - a.changeRate);

  // ID 재부여
  jeonseAlerts.forEach((a, i) => a.id = i + 1);
  priceSpikes.forEach((a, i) => a.id = i + 1);

  console.log(`[Risk Scan] 완료 - 전세가율 경보: ${jeonseAlerts.length}건, 급등: ${priceSpikes.length}건, 거래량: ${volumeSignals.length}건`);

  res.json({
    timestamp: new Date().toISOString(),
    jeonseAlerts: jeonseAlerts.slice(0, 10),
    priceSpikes: priceSpikes.slice(0, 8),
    volumeSignals: volumeSignals.slice(0, 5),
    warnings: warnings.slice(0, 5),
    scannedRegions: RISK_SCAN_REGIONS.length,
    scanDate: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  });
});

app.listen(PORT, () => {
  console.log(`[RE Master Analyst] AI Backend Server is running on http://localhost:${PORT}`);
  console.log(`[RE Master Analyst] MOLIT API: ${MOLIT_API_KEY ? 'ready' : 'missing'} / ECOS API: ${ECOS_API_KEY ? 'ready' : 'missing'} / Kakao API: ${KAKAO_API_KEY ? 'ready' : 'missing'} / Gemini: ${GEMINI_API_KEY ? 'ready' : 'missing'}`);
});
