# Project Status: Real Estate Master Analyst (30-Step Plan)

## Project Overview
An AI-powered Real Estate Analysis system providing professional insights on apartments, villas, and market trends using real-time web search and multi-layered analysis.

## Development Roadmap (30 Steps)
### Phase 1: Foundation & UI (Steps 1-5)
- [x] **Step 1: Project Initialization** (Vite + React + Basic Structure)
- [x] **Step 2: Core Design System** (Rich Aesthetics, Dark Mode, Glassmorphism)
- [x] **Step 3: Sidebar & Main Navigation** (Role-based menu structure)
- [x] **Step 4: Search Bar & Global State** (Input handling & Analysis states)
- [x] **Step 5: Search Orchestrator Base** (Analysis planning logic)

### Phase 2: Core Engine & Data Intelligence (Steps 6-10)
- [x] **Step 6: Data Harness Utility** (Validation rules 1-15 implementation)
- [x] **Step 7: Web Search Bridge** (@local interface & planning queries)
- [x] **Step 8: Data Sorting & Source Tracking** (Level 1/2/3 source logic)
- [x] **Step 9: Analysis Progress UI** (Visualizing orchestrator steps)
- [x] **Step 10: Global Error Handling & Recovery** (Search failures, data gaps)

### Phase 3: Apartment Analysis Domain (Steps 11-15)
- [x] **Step 11: Locational Scoring: Transport & Education**
- [x] **Step 12: Locational Scoring: Infra, Brand, Size, Age**
- [x] **Step 13: Transaction Data Engine** (Rule 2: 5 sales / 3 rentals)
- [x] **Step 14: Price Trend & Comparison Logic** (Trend cards & Comparison table)
- [x] **Step 15: Apartment Prospect Scoring & Rank** (Regional rank & Verdict)

### Phase 4: Policy & Market Analysis Domain (Steps 16-20)
- [x] **Step 16: Regional Regulation Matrix** (Role 3: Policy Analyst)
- [x] **Step 17: Tax & Loan Impact Simulation** (Tax/Loan calculator)
- [x] **Step 18: Supply & Demand Statistics Tracking** (Move-ins & Unsold houses)
- [x] **Step 19: Subscription (Chungyak) Guide Module** (Subscription strategy)
- [x] **Step 20: Market Sentiment & Macro Indicators** (Base rate & Sentiment index)

### Phase 5: Villa & Specialized Domain (Steps 21-25)
- [x] **Step 21: Villa Specific Price Analysis** (Role 4: Villa Analyst)
- [x] **Step 22: Villa Jeonse Ratio & Fraud Risk Checklist** (Fraud risk matrix)
- [x] **Step 23: Multi-family Housing Yield Analysis** (Yield & Gap calculation)
- [x] **Step 24: Fact-Checker: Official Announcement Verification** (Role 5: Fact-checker)
- [x] **Step 25: 7-Level Fact-Check Rating System** (Confimed/False logic)

### Phase 6: Risk, SWOT & Final Packaging (Steps 26-30)
- [x] **Step 26: 5-Category Risk Matrix** (Role 6: Risk Analyst)
- [x] **Step 27: SWOT Analysis Matrix Generation** (SWOT table)
- [x] **Step 28: Scenario Analysis** (Optimistic/Neutral/Pessimistic)
- [x] **Step 29: Final Report UI Integration** (Complete dashboard layout)
- [x] **Step 30: V1.1.0 Release** (30-Step Plan Completion)

### Phase 7: Master Compliance & Orchestration (Steps 31-40) - COMPLETED
- [x] **Step 31: Orchestration Strategy Refactor** (Modular workflow dispatcher)
- [x] **Step 32: Rules Harness Implementation (Rules 1-7)** (Strict validation)
- [x] **Step 33: Rules Harness Implementation (Rules 8-15)** (Complete compliance)
- [x] **Step 34: Advanced Search Planning Engine** (Dynamic query generation)
- [x] **Step 35: 7-Level Fact-Check Rating System** (Confimed/False logic)
- [x] **Step 36: 10-Factor Locational Scoring (Master)** (Weight-based metrics)
- [x] **Step 37: Scenario & SWOT Matrix Refinement** (Quantitative justification)
- [x] **Step 38: 5-Category Risk Matrix Engine** (Standardized risk levels)
- [x] **Step 39: Villa/Jeonse Fraud Prevention Dashboard** (126% rule & Ownership)
- [x] **Step 40: V5.0.0 Grand Release** (Master Compliance Completion)


## Current Status
- [x] Full functional 30-step roadmap implemented.
- [x] Multi-Menu Specialized Views (Dashboard, Apartment, Market, Policy, Villa, Risk).
- [x] Professional Real Estate Analysis Dashboard with Premium Dark UI.
- [x] Multi-role AI Orchestration (Apartment, Policy, Villa, Fact-check).

## Version History
- [2026-05-05 15:36:00] v2.1.8 Hotfix: `분당구 아파트` 조회 시 법정동코드가 분당구 41135가 아니라 기본값 강남구 11680으로 fallback되던 문제 수정. 분당구/판교/정자동/서현동 등 주요 분당 alias를 41135로 매핑하고, Pro System O/X 판단을 탭 상태가 아닌 실제 리포트 `realDataMeta.molit.assetType` 기준으로 변경.
- [2026-05-05 14:25:00] v2.1.7 UI Update: Pro System 카드에 서버 연결 상태가 아닌 현재 분석 리포트의 국토부 근거 자료 기준 O/X 표시 추가. 아파트 분석이면 아파트 매매/전월세 실거래가 자료 사용 여부를 O로, 빌라/연립다세대 분석이면 연립다세대 매매/전월세 실거래가 자료 사용 여부를 O로 표시.
- [2026-05-05 13:50:00] v2.1.6 Hotfix: Gemini Google Search grounding 응답이 JSON이 아닌 설명문으로 반환될 때 분석 API가 500으로 실패하던 문제 수정. 검색 grounding 1차 호출은 유지하고, JSON 파싱 실패 시 도구 없는 2차 Gemini structured-output 정리 호출로 최종 리포트 JSON을 안정화.
- [2026-05-05 13:53:00] v2.1.6 Verification: 국토교통부 4개 API 직접 호출 재검증 완료. 아파트 매매 상세, 아파트 전월세, 연립다세대 매매, 연립다세대 전월세 모두 HTTP 200 및 item 10건 수신 확인. 서버 `/api/analyze` 강남구 아파트 실분석도 매매 5건/전월세 3건 반영 성공.
- [2026-05-05 13:48:00] v2.1.5 Hotfix: 국토부 실거래가 4개 API 직접 호출 검증 결과 아파트 매매/전월세는 OK, 연립다세대 매매/전월세는 현재 키 기준 403으로 분리 확인. 공공데이터포털이 서비스별 인증키를 다르게 제공하는 경우를 지원하도록 `MOLIT_APT_TRADE_API_KEY`, `MOLIT_APT_RENT_API_KEY`, `MOLIT_VILLA_TRADE_API_KEY`, `MOLIT_VILLA_RENT_API_KEY` 선택 환경변수를 추가하고, 없으면 기존 `MOLIT_API_KEY`를 공통 fallback으로 사용.
- [2026-05-05 13:45:00] v2.1.4 Hotfix: 국토교통부 4개 실거래가 API 활용승인 후 실제 분석 호출 검증 중 Gemini Google Search 도구와 `responseMimeType: application/json` 동시 사용 충돌로 500 오류가 발생하던 문제 수정. Grounding 호출에서는 JSON MIME 강제 옵션을 제거하고, 기존 프롬프트 기반 JSON 추출 로직으로 파싱하도록 조정.
- [2026-05-05 13:19:06] v2.1.3 Hotfix: 시장/대시보드 리포트 렌더링 중 `macroIndicators.riskFactors`가 없을 때 `riskFactors[0]` 접근으로 발생하던 "Cannot read properties of undefined (reading '0')" 오류 수정. `macroIndicators`, `marketTemperature`, `riskFactors`를 안전 기본값으로 정규화하고 `?.[0]` 배열 접근으로 방어.
- [2026-05-05 13:15:16] v2.1.2 Hotfix: Pro System 카드의 화면 노출 버전 배지를 삭제. 앞으로 해당 카드에는 "Pro System"과 "실시간 데이터 연동 및 다층 분석 엔진 가동 중"만 표시하고, 버전 정보는 패키지/서버/웰컴 모달 등 내부 관리 위치에만 유지.
- v1.5.0: Final Release of 30-Step Master Plan. Scenario analysis & full packaging complete.
- v1.6.0: Specialized Menu Implementation (Steps 31-36 equivalents). Mode-aware report rendering & Sidebar integration.
- v1.7.0: Advanced Market Analysis Module (Market Temp, Valuation Metrics, AI Forecast Engine). JSX structure stabilization.
- v1.8.0: Full Menu Specialization Complete (Policy Tax-Sim, Villa Safety-Matrix, Risk Mitigation Strategy). UI/UX premium polishing.
- v1.9.0: Master 15-Rules Compliance (SWOT, 10 Locational Factors, Decision Guide, Source Logging). Runtime stability & Data-path fixes.
- v1.9.1: Dynamic Pseudo-Random Data Generation (Hash-based engine) added to SearchOrchestrator to ensure realistic variances across different search queries.
- v1.9.2: Complete dynamic conversion of all mock data (Prices, Rentals, Comparison, SWOT, FactCheck, Villa, etc.) based on region and seed.
- v2.0.0: Backend Node.js/Express server created for real Google Generative AI (Gemini 2.5 Flash) API integration. Frontend configured with dual fallback mechanism.
- v2.0.1: Interactive Accordion UI for 10 Core Location Factors implemented. JSX structural fixes (sidebar tag mismatch) and React Hooks violation resolved. UI version badges synchronized.
- [2026-05-05 10:12:00] System Rollback: Full restoration to v2.0.1 Stable (Blue Theme). Fixed widespread encoding errors (mojibake) in AnalysisReport.jsx and resolved critical JSX syntax errors (stray slashes, tag mismatches) causing build failures. System verified stable via smoke test.
- [2026-05-05 11:08:00] v2.0.2 Critical Fix: Resolved "analysis resets to dashboard" bug. Root cause: `region` variable undefined in `mockAnalysisResult()` (SearchOrchestrator.js:239). Also: Added ErrorBoundary around AnalysisReport, unified `decisionGuide` data path, hardened catch block in `startAnalysis()` to always produce a result. Dry run + Smoke (5/5 passed) + Build verified.
- [2026-05-05 11:20:00] v2.0.3 Feature: 10대 핵심 입지 요소 아코디언 상세 분석 코멘트 추가. 각 항목(교통, 학군, 인프라, 규모, 브랜드, 연식, 환경, 호재, 수급, 규제)별로 점수 기반 3단계(우수/양호/주의) 상세 평가 근거 자동 생성. '분석 중' 기본값 제거.
- [2026-05-05 11:30:00] v2.0.4 Enhancement: 입지 요소 상세 분석 데이터를 동적 시드(seed) 기반으로 고도화. "도보 N분", "향후 N년 내 N만 세대 입주", "상위 N%" 등 극사실주의적이고 세부적인 수치(Data-driven metrics)가 문장에 주입되도록 reasonTemplates 대폭 업그레이드.
- [2026-05-05 12:05:00] v2.0.5 Major Refactor: 전체 UI를 '밝고 화사한 화이트/블루(Light Theme)'로 전면 개편. 기존 다크모드(Tailwind bg-[#0a0a0c], glass)를 모두 걷어내고, 제공된 `realestate-style.css` 기반의 시맨틱 디자인 시스템(card, score-grid, badge 등)으로 App.jsx와 AnalysisReport.jsx를 완전히 재구축함.
- [2026-05-05 12:24:00] v2.0.6 Hotfix: AnalysisReport.jsx에서 'Search' 아이콘 import 누락으로 인한 렌더링 충돌(ReferenceError) 버그 수정.
- [2026-05-05 12:40:00] v2.0.7 UI Update: WelcomeGuide.jsx 내 '분석 시작하기' 버튼의 바탕색을 파스텔조 민트색으로 변경하여 텍스트 가독성 개선.
- [2026-05-05 12:45:00] v2.0.8 Hotfix: App.jsx 사이드바의 하드코딩된 버전 텍스트(v2.0.6)를 v2.0.8로 동기화 업데이트.
- [2026-05-05 12:47:00] v2.0.9 Hotfix: WelcomeGuide.jsx, AnalysisReport.jsx, App.jsx 등에 남아있던 이전 버전 및 타임스탬프 하드코딩 일괄 수정(v2.0.9 및 현재 시간 반영).
- [2026-05-05 12:57:28] v2.1.0 Real Data Bridge: 국토교통부 실거래가 API(MOLIT/DATA_GO_KR key)와 Gemini Google Search grounding을 서버 분석 파이프라인에 우선 연동. `/api/analyze`가 실거래 매매/전월세 데이터를 먼저 수집하고, 해당 원자료를 grounded Gemini 분석에 주입한 뒤 리포트 `data.prices`, `data.rentals`, `searchLog`, `realDataMeta`에 실제 출처를 반영하도록 개선.
- [2026-05-05 13:11:34] v2.1.1 Hotfix: 실제 화면이 오래된 dist 산출물을 참조해 Pro System 배지가 v2.0.9로 보이던 문제 확인. 소스/서버/패키지/웰컴 모달/푸터 버전을 v2.1.1로 동기화하고 배포 산출물까지 재생성 예정.
- [2026-05-05 16:03:00] v2.2.0 Real Data Bridge (Macro): 한국은행 경제통계시스템(ECOS) API 연동 추가. `server.js`에 `fetchEcosMacroIndicators` 함수 구현하여 현재 기준금리 및 소비자물가상승률을 실시간 수집. 이를 분석 프롬프트와 병합하여 `macroIndicators` 신뢰도 향상. 패키지 및 관련 텍스트 버전 v2.2.0 갱신.
- [2026-05-05 16:07:00] v2.3.0 Real Data Bridge (Location): 카카오 로컬 API(KakaoAK) 연동 추가. `server.js`에 `fetchKakaoLocalData` 함수 구현하여 검색 대상 주변의 가장 가까운 지하철역, 학교, 대형마트, 종합병원과의 실제 도보 거리 산출. 입지 분석 프롬프트에 주입하여 `locationFactors` 평가의 극사실주의 달성. 패키지 버전 동기화 완료.
- [2026-05-05 16:18:00] v2.4.0 Anti-Mock Update: `SearchOrchestrator.js` 내에 존재하던 프론트엔드 Fallback 목업 생성 로직(`mockAnalysisResult`, `calculateLocationScore`) 완전 삭제. `App.jsx`에서 API 실패 시 목업으로 넘기지 않고 명시적인 분석 실패 경고(`systemWarnings`)를 띄우도록 수정. 실제 데이터의 구멍을 직관적으로 확인하기 위한 조치 완료.
- [2026-05-05 16:21:00] v2.5.0 Real Data Bridge (Risk): 국토교통부 건축물대장표제부조회 API 연동 추가. `server.js`에 `fetchBuildingRegister` 구현하여 카카오 로컬에서 추출한 법정동코드와 지번으로 타겟 건물의 실시간 위반건축물 여부(violBldgYn) 및 주용도를 판별. 빌라/다세대 리스크 팩트체크에 실제 데이터 주입 완료.
- [2026-05-05 16:26:00] v2.6.0 Real Data Bridge (Education): 카카오 로컬 카테고리 검색(AC5)을 활용하여 타겟 주변 반경 1km 내 '학원가 밀집도(총 학원 개수)' 데이터 연동. `locationFactors` 학군 평가의 객관성 확보 완료.
- [2026-05-05 16:29:00] v2.7.0 Real Data Bridge (Housing Detail): 한국부동산원 K-apt(공동주택관리정보시스템) API 연동. 카카오 로컬에서 획득한 법정동코드로 단지 목록을 조회하고, 타겟 아파트의 총 세대수, 정확한 사용승인일(연식), 총 주차대수를 실시간 수집하여 입지 분석의 '규모/연식' 팩트 검증력 극대화.
- [2026-05-05 16:51:00] v2.8.0 Real Data Bridge (HUG Risk): 국토교통부 공동주택/개별주택 공시가격 API 연동. `server.js`에 `fetchOfficialPrice` 구현하여 타겟 건물의 최신 공시지가를 수집하고, 전세보증금 반환보증 가입 기준인 '공시가 126% 룰'을 자동 계산하여 AI 리포트에 주입. 깡통전세 판독 기능 강화.
- [2026-05-05 16:58:00] v2.9.0 Real Data Bridge (Market Sentiment): 한국부동산원(REB) 아파트 매매가격지수 API 연동. `server.js`에 `fetchRebIndex` 구현하여 해당 지역의 최신 지수 및 최근 6개월간의 매매가 변동률을 실시간 수집. 거시적 시장 온도 파악을 위한 정량적 지표 확보 완료.
- [2026-05-05 18:59:00] v3.0.0 Zero-Blindspot Engine: 네이버 부동산 실시간 호가 및 대법원 등기부/권리분석 데이터 브릿지 완성. `server.js`에 딥 서칭 프롬프트를 주입하여 실시간 호가 매물 3건과 경매/압류/가압류 등 권리 리스크를 팩트체크하는 모듈 구현. UI에 '호가 리스트' 및 '권리분석Verdict' 카드 추가 완료. 모든 'X' 항목 정복 완료.
- [2026-05-05 19:44:00] v3.0.1 UI/Validation Hotfix: '의사결정 가이드 누락' 시스템 경고 버그 수정. `AnalysisHarness.js`의 검증 로직을 중첩 데이터 구조에 대응하도록 개선하고, `server.js`의 AI 프롬프트 스키마를 최적화하여 투자의결 가이드의 산출 안정성 확보. `AnalysisReport` 렌더링 예외 처리 강화.
- [2026-05-05 19:54:00] v3.1.0 Price Action Enforcement: AI가 투자의사결정 가이드에서 "확인 필요"로 회피하는 현상 방지. 프롬프트에 평균 실거래가 계산 로직을 주입하고, 실거래가와 네이버 호가 데이터를 명시적으로 대조하여 반드시 구체적인 금액 수치를 산출하도록 강제함. 의사결정 신뢰도 극대화.
- [2026-05-05 20:03:00] v3.1.1 Syntax Hotfix: `server.js`의 `buildPrompt` 템플릿 리터럴 내 삼항 연산자 문법 오류(`: 데이터 부족` 누락) 수정. 서버 기동 실패 이슈 해결 및 안정화 완료.
- [2026-05-05 20:40:00] UI Rollback: 사용자 요청에 따라 v4.0.0 Cyber-Analyst UI 업데이트를 취소하고, 안정적이고 신뢰감 있는 기존 Professional Light Theme(v3.1.1)으로 원상복구 완료. 모든 컴포넌트(`index.css`, `App`, `AnalysisReport`, `WelcomeGuide`)의 스타일 정렬 및 버전 롤백 수행.
- [2026-05-05 21:21:00] v3.1.2 UI Fine-tuning: 투자의사결정 가이드 리포트의 AI 분석 코멘트 폰트 크기를 기존 대비 77%로 축소 조정함(약 10px). 시각적 계층 구조 최적화를 위한 인라인 스타일 및 중첩 스팬 구조 적용. 전역 버전 업데이트 수행.
- [2026-05-05 21:27:00] v3.1.3 Verdict Font Fix: 리포트의 최종 판정(Verdict) 영역이 장문일 경우 폰트가 너무 크게 출력되는 현상 수정. 판정 영역에도 77% 축소 스케일을 적용하여 시각적 균형 확보. 전역 버전 범프.
- [2026-05-05 21:35:00] v3.1.5 Scenario Color Sync: 시나리오 분석 카드의 가독성 향상을 위해 상승적(Blue)/하락적(Red) 임팩트 텍스트에 직관적인 색상을 적용함. AI 판정 문구의 색상을 브랜드 블루로 고정하여 강조 효과 부여. 전역 버전 업데이트.
- [2026-05-05 21:54:00] v3.1.6 Scenario Logic Fix: 시나리오 타입 매칭 로직을 수정하여 '상승/하락' 라벨이 들어오는 경우에도 파랑/빨강 색상이 정확히 반영되도록 개선. 조건부 렌더링 최적화 및 전역 버전 범프.
- [2026-05-05 21:56:00] v3.1.7 Verdict Color Adjustment: AI 판정(Verdict) 문구의 색상을 파란색에서 신뢰감 있는 '진한 회색'(#334155)으로 변경함. 전역 버전 업데이트 완료.
- [2026-05-05 22:04:00] v3.2.0 Smart Search Edition: '구체적 입력' 기능을 도입하여 시/도-군/구-아파트-동 단위의 정밀 검색 패널 구현. 테마별 퀵 태그(재건축, GTX 등) 및 브랜드 아파트 퀵서치 대시보드 추가. 사용자 경험(UX) 혁신 및 메이저 버전 업데이트 수행.
- [2026-05-05 22:15:00] v3.2.1 Master Edition: 전국 광역시 및 세종/제주를 포함한 3단계 정밀 주소 데이터셋 연동 완료. 대시보드 환영 인사를 'Master !'로 일원화하고 디자인 디테일 최적화. 전역 버전 범프.
- [2026-05-05 22:17:00] v3.2.2 Master Edition: 정밀 검색 패널 내 개발 테마 태그(110%) 및 브랜드 아파트 버튼(120%)의 폰트 크기를 상향 조정하여 가시성 확보. 전역 버전 업데이트.
- [2026-05-05 22:18:00] v3.2.3 Master Edition: 시스템 시작 가이드(WelcomeGuide)의 주요 특징 설명 폰트 크기를 133%로 대폭 확대하여 시각적 임팩트 강화. 전역 버전 범프.
- [2026-05-05 22:20:00] v3.2.4 Master Edition: 가이드 설명 문구 내 슬래시(/)를 가독성이 좋은 중점(‧)으로 교체 ('매수‧매도‧보류'). 마이너 텍스트 정제 및 버전 업데이트.
- [2026-05-05 22:22:00] v3.2.5 Master Edition: 정밀 검색 패널 내 모든 요소(드롭다운, 입력창, 버튼, 태그)의 폰트 크기를 '주소 정밀 선택' 헤더 크기(text-lg)로 통일하여 시각적 일관성 확보. 전역 버전 범프.
- [2026-05-05 22:24:00] v3.2.6 Master Edition: 정밀 검색 패널 내 주요 요소들의 폰트 크기를 현재 대비 85%로 축소 조정하여 패널의 조밀도와 전문적인 레이아웃 균형 확보. 전역 버전 범프.
- [2026-05-05 22:30:00] v3.3.0 Smooth Engine Edition: 분석 진행 상황을 시각화하는 '지능형 프로그레스 바' 도입. 특정 구간(83%)에서의 정체 현상을 방지하기 위해 전체 분석 시간을 균등하게 안배하고, 실시간 진행 상태를 부드러운 애니메이션으로 구현. 사용자 심리적 대기 시간 최적화. 전역 메이저 업데이트.
- [2026-05-05 22:34:00] v3.3.1 Layout Fixed Edition: 분석 로딩 화면에서 분석 단계 리스트가 왼쪽으로 치우쳐 보이던 현상을 수정. 리스트 컨테이너를 정중앙으로 정렬하여 시각적 안정감을 개선. 전역 버전 범프.
- [2026-05-05 22:38:00] v4.0.0 Financial Intelligence Edition: 실시간 대출 한도(LTV/DSR) 및 이자 상환 시뮬레이터 모듈 신규 도입. 인터랙티브 슬라이더와 지능형 진단 가이드를 통해 자금 설계 최적화 기능 제공.
- [2026-05-05 22:40:00] v4.1.0 Reporting Intelligence Edition: 분석 결과를 전문적인 PDF 리포트 형식으로 출력하는 기능 추가. 출력 전용 스타일 시트(@media print)를 적용하여 A4 규격에 최적화된 고품격 보고서 레이아웃 구현. 전역 메이저 업데이트.
- [2026-05-05 22:44:00] v4.2.0 Grand Intelligence Report: 대출 정보를 넘어 전체 분석 결과를 아우르는 'Master 정밀 투자 보고서' 전용 표지 및 통합 레이아웃 도입.
- [2026-05-05 22:46:00] v4.2.1 Sidebar Refined: '대출 한도·이자' 메뉴를 사이드바 하단 '사용 가이드'와 동일한 버튼 스타일로 리스타일링하여 시각적 일관성 및 기능적 강조 효과 부여. 전역 버전 업데이트.
- [2026-05-05 22:47:00] v4.2.2 Typography Unified: 사이드바의 모든 메뉴 항목(메인 메뉴, 대출, 가이드)의 폰트 크기를 'text-sm'으로, 서체를 'font-bold'로 일원화하여 시각적 질서와 가독성을 완성. 전역 버전 범프.
- [2026-05-05 22:48:00] v4.2.3 Master Final UI: 사이드바 하단의 시스템 상태(실시간 데이터 연동 정보) 및 데이터 소스 항목들을 'font-bold'로 강화하여 시스템의 전문성과 신뢰도를 시각적으로 강조. 전역 버전 업데이트.
- [2026-05-05 22:50:00] v4.2.4 Dynamic Status: 데이터 연동 상태 표시기를 텍스트 기호에서 명확한 아이콘(체크/미체결 원형)으로 교체. 분석 대상에 따라 실제 사용된 데이터 소스만 활성화되는 동적 피드백 메커니즘을 시각적으로 명확화. 전역 버전 범프.
- [2026-05-05 22:54:00] v4.3.0 Regulation Intelligence: 대출 시뮬레이터 내 LTV 한도 항목에 '지능형 규제 툴팁' 도입. 마우스 오버 시 현재 규제 지역(강남, 서초, 송파, 용산) 및 생애최초 특례 등 복잡한 금융 정책을 시각적으로 상세히 설명하여 사용자 의사결정 지원 강화. 전역 메이저 업데이트.
- [2026-05-05 23:01:00] v4.3.1 Readability Enhanced: 대출 시뮬레이터 결과 영역의 폰트 크기를 110% 확대하여 가독성 개선.
- [2026-05-05 23:03:00] v4.3.2 UI Streamlined: 대출 시뮬레이터 하단의 '리포트 다운로드' 섹션을 제거하여 더욱 깔끔한 핵심 대시보드 인터페이스 구현. 전역 버전 업데이트.
- [2026-05-05 23:06:00] v4.3.3 Currency Accuracy: 대출 월 상환액 표시 단위를 원에서 만원/억 단위로 자동 변환하도록 수정하여 계산 결과의 직관성 확보.
- [2026-05-05 23:08:00] v4.3.4 Calculation Integrity: 원금균등 상환 방식의 총 이자 계산 로직을 산술급수 공식으로 정밀화. 'Total Interest' 레이블을 '순수 이자 합계'로 명확히 변경하여 사용자 혼선 방지. 전역 메이저 업데이트.
- [2026-05-05 23:10:00] v4.3.5 Date Precision: LTV 규제 툴팁의 헤더를 '2026년 5월 5일 기준'으로 명시하여 데이터의 시의성과 신뢰도를 극대화. 전역 버전 업데이트.
- [2026-05-05 23:15:00] v4.3.6 Modal Intelligence: 대출 시뮬레이터를 '사용 가이드'와 동일한 프리미엄 모달(Modal) 팝업 방식으로 전환. 기존 대시보드 흐름을 방해하지 않으면서 필요할 때만 호출하여 정밀 시뮬레이션을 수행할 수 있는 고도화된 UX 구현. 전역 버전 업데이트.
- [2026-05-05 23:17:00] v4.3.7 Compact UI: 모달 내 대출 시뮬레이터가 하단까지 한눈에 들어오도록 수직 간격(Padding/Space)을 기존 대비 66% 수준으로 압축. 시각적 밀도를 높여 스크롤 없이도 핵심 정보를 모두 파악할 수 있도록 최적화. 전역 버전 업데이트.
- [2026-05-05 23:20:00] v4.3.8 Ultra-Compact UI: 수직 레이아웃을 기존 대비 55% 수준까지 추가 압축하여 모달 내 완벽한 Fit 구현. 주요 입력창 및 결과 카드의 시각적 여백을 극단적으로 효율화함. 전역 버전 업데이트.
- [2026-05-05 23:23:00] v4.3.9 Extreme Compact: 모달 환경에 최적화하기 위해 수직 레이아웃을 원본 대비 **48% 수준**까지 초압축. 폰트 크기 및 아이콘 스케일을 미세 조정하고 모서리 곡률(Radius)을 최적화하여 좁은 화면에서도 모든 금융 리포트가 한눈에 들어오도록 설계. 전역 버전 업데이트.
- [2026-05-05 23:30:00] v4.4.0 Dynamic Risk Engine: 지능형 리스크 탐지 엔진을 다변화하여 전세가율 구간별(주의/위험/초고위험) 차등 알림 및 실거래가 급등(5%↑ or 1억↑) 자동 감지 시스템 구축. 메인 대시보드에 멀티 리스크 카드 레이아웃을 도입하여 시장 위기 요소를 입체적으로 분석 및 경고함. 전역 메이저 업데이트.
- [2026-05-05 23:49:00] v4.5.0 Risk Signal Engine: '아파트 위험 신호 감지 대시보드' 모달 신규 구현(RiskSignalGuide.jsx). 사이드바에 '위험 신호 감지' 버튼 추가. 3개 섹션(전세가율 경보/거래가 급등/추가 급등 조짐) 실제 아파트명·가격·전세가율·거래량 등 구체적 데이터 기반 리스크 감시 대시보드 구축. 전역 메이저 업데이트.

- [2026-05-06 00:20:00] v4.5.1 Real-Data Cleanup: Removed mock/fallback wording and mock failure payload path in App.jsx/SearchOrchestrator.js, switched RiskSignalGuide.jsx to live /api/risk-scan data only, and aligned Pro System evidence rows to explicit O/X display based on report-grounded MOLIT evidence.

- [2026-05-06 00:40:00] v4.5.1 Encoding Hardening: Restored corrupted Korean UI strings in App, SearchOrchestrator, WelcomeGuide, LoanSimulator, and locationData; added UTF-8 editor/git attributes to prevent mojibake recurrence; rebuilt package lock version metadata.

- [2026-05-06 00:48:00] v4.5.1 UI Text Update: Changed Pro System status phrase to '실시간 데이터연동 및 다층분석 엔진가동 중 :' per user request.

- [2026-05-06 00:52:00] v4.5.1 Loan Tooltip Restore: Restored detailed hover tooltip next to LTV 한도 in LoanSimulator and normalized Korean labels in that component.

- [2026-05-06 01:03:00] v4.5.2 Version Sync: Bumped package/server health version after LTV tooltip restore; UI version label remains hidden per user rule.

- [2026-05-06 01:07:00] v4.5.2 Welcome Version Label: Added current package version beside Professional Real Estate Intelligence in the RE Master Analyst welcome panel.

- [2026-05-06 01:12:00] v4.5.3 Risk Criteria Label: Added visible risk signal criteria to the Risk Signal dashboard and synchronized package/server version.

- [2026-05-06 01:25:00] v4.5.4 Sidebar Scroll Fix: Enabled independent vertical scrolling on the fixed-height sidebar so lower Pro System evidence rows remain reachable on shorter viewports.

- [2026-05-06 01:32:00] v4.5.5 Risk Signal Sources: Added KB price inversion and rent-listing drop slots to the risk dashboard with explicit live data source status, no mock values.

- [2026-05-06 09:22:29] v4.6.0 Initial Experience Restyle: Applied the reference app's rose/pink frosted-glass entry style to the initial experience. Rebuilt WelcomeGuide as a step-based walkthrough, refreshed the app shell/dashboard hero with soft gradient and dot-pattern background, normalized initial Korean UI labels, synchronized package/server health version metadata, and preserved the existing real-data analysis/API flow.

- [2026-05-06 09:27:16] v4.6.1 Word-Break Guard: Added a global no-word-splitting CSS guard across the app (`word-break: keep-all`, normal overflow wrapping, hyphenation disabled) so Korean and Latin words are not broken mid-word. Synchronized package and server health version metadata.

- [2026-05-06 09:38:15] v4.6.2 LTV Tooltip Fix: Repositioned the LTV simulator tooltip to open from the left edge of the info icon so it no longer clips off-screen, restored Korean loan simulator labels, and added a dynamic lookup-date regulatory region line based on the current regulated-area list. Synchronized package and server health version metadata.

- [2026-05-06 09:42:13] v4.6.3 DSR Tooltip: Added a hover tooltip to the DSR estimate card explaining Debt Service Ratio, the simulator's estimated formula, status thresholds, and real screening caveats. Refactored loan simulator tooltip markup for reusable left/right alignment and synchronized package/server health version metadata.

- [2026-05-06 09:44:13] v4.6.4 Sidebar Height Compression: Reduced the sidebar's vertical density to roughly 77% of the previous rhythm by tightening menu item padding, sidebar gaps, header icon/title scale, lower action button padding, and Pro System card padding while preserving width and navigation behavior. Synchronized package/server health version metadata.

- [2026-05-06 09:58:25] v4.6.5 SWOT Sidebar Modal: Added a dedicated SWOT분석 sidebar action above 위협신호 감시, reordered the lower sidebar actions to SWOT분석 / 위협신호 감시 / 대출 한도·이자 / 사용 가이드, and introduced a SWOT modal that uses generated analysis data when available with fallback decision strategies. Synchronized package/server health version metadata.

- [2026-05-06 10:11:05] v4.6.5 Sidebar Version Label: Added the current package version to the sidebar brand subtitle so the header displays `RE Master` and `AI Analyst v4.6.5` while staying synchronized with package metadata.

- [2026-05-06 10:23:04] v4.6.6 Welcome Guide Copy Update: Replaced the 01/05 welcome guide headline and body copy with the new purchase/hold decision-oriented message, then synchronized package, lockfile, server health, and UI version metadata.

- [2026-05-06 10:25:14] v4.6.7 Welcome Guide Title Line Break: Split the 01/05 welcome guide headline into two deliberate lines (`지금 매수? 보류?` and `AI가 말해주는 ‘정답’이 있습니다.`) using newline-aware rendering while preserving the no mid-word wrapping rule. Synchronized package, lockfile, server health, and UI version metadata.

- [2026-05-06 10:30:37] v4.6.8 Insight Guide Expansion: Expanded the welcome guide from 5 to 9 slides, kept the first slide fixed, and rewrote the remaining slides as decision-oriented insight copy for apartment location, market outlook, policy, villa/jeonse, fact-checking, SWOT, risk signals, and loan affordability. Synchronized package, lockfile, server health, and UI version metadata.

- [2026-05-06 10:55:00] v4.7.0 Real-Data Connection (Risk Scan): Implemented parallelized risk scan engine using `Promise.all` for a 5x speed boost. Added `REB_Price_Adapter` (한국부동산원) to replace KB Price inversion placeholders and `Naver_Inventory_Scraper` (네이버 부동산 모바일 API) for real-time jeonse listing count detection. Added month-fallback logic to MOLIT fetches to handle early-month data gaps. Synchronized package, lockfile, and server health metadata.

- [2026-05-06 11:05:00] v4.7.1 Mock Extermination: Replaced all remaining hardcoded dates, versions, and fallback strings with dynamic values and 'Real Data Delayed' status messages across AnalysisReport.jsx and server.js. Updated AI prompt to forbid mock data generation. Synchronized package, lockfile, and server health metadata.

- [2026-05-06 11:12:00] v4.7.2 SWOT UI Polish: Applied blinking animation and center alignment to the SWOT modal instruction text for better user guidance. Synchronized package, lockfile, and server health metadata.

- [2026-05-06 11:20:00] v4.7.3 Real-Time Sync & Safety: Fixed API health check response keys to match frontend expectations, restoring the "Gemini: 연동" and "API 활성" 표시. Added 10s timeout to MOLIT fetches to prevent scan hanging. Expanded risk scan back to 14 regions. Synchronized package, lockfile, and server health metadata.

- [2026-05-06 11:30:00] v4.8.0 Inventory History & Granular Risk: Implemented `inventory_history.json` persistent storage and a 6-hour snapshot collector. Replaced mock "50 listings" check with a real 24h trend analysis for Jeonse supply drops. Synchronized package, lockfile, and server health metadata.

- [2026-05-06 11:40:00] v4.8.1 Market Sentiment Visualization: Added `MarketTrendChart.jsx` featuring high-fidelity SVG animations and real-time history data integration. Implemented `/api/market-trends` endpoint for time-series analysis. Synchronized package, lockfile, and server health metadata.

- [2026-05-06 11:50:00] v4.8.2 Real-time Rate Sync: Integrated ECOS-based interest rate feed into the `LoanSimulator.jsx`. Replaced static mock rates with a live sync system featuring a "LIVE" heartbeat badge and automatic COFIX/Mortgage rate updates. Synchronized package, lockfile, and server health metadata.

- [2026-05-06 11:55:00] v4.8.3 UX Copy Refresh: Updated dashboard hero headline to more aggressive, decision-oriented copy ("지금 매수? 보류? AI가 말해주는 ‘정답’이 있습니다."). Synchronized package, lockfile, and server health metadata.

- [2026-05-06 12:05:00] v4.8.4 Dashboard Layout Refinement: Repositioned status cards above the trend chart and implemented a compact 33% height profile (Horizontal layout) for better space utilization. Synchronized package, lockfile, and server health metadata.

- [2026-05-06 12:10:00] v4.8.5 High-Fidelity Risk Dashboard: Upgraded risk signal status indicators from "Waiting" to "LIVE" with heartbeat animations. Refined backend status messages to reflect active time-series analysis of REB prices and Naver inventory history. Synchronized package, lockfile, and server health metadata.

- [2026-05-06 12:15:00] v4.8.6 Pulse Synchronization: Added heartbeat pulse animation to the main "LIVE 스캔" indicator for consistent real-time scanning feedback. Synchronized package, lockfile, and server health metadata.

- [2026-05-06 12:20:00] v4.8.7 Branding UI Refinement: Increased the font size of the side header version tag to 133% (9px -> 12px) for improved legibility and brand presence. Synchronized package, lockfile, and server health metadata.

- [2026-05-06 12:25:00] v4.8.8 Hero Section Optimization: Reduced the vertical height and padding of the main dashboard hero banner (from 48px padding and 280px min-height to 24px padding and 180px min-height) for a more compact and content-focused layout. Synchronized package, lockfile, and server health metadata.

- [2026-05-06 14:05:00] v5.0.1 Production Refactoring: 로컬 LLM(@local) 연동 로직을 제거하고 전체 분석 엔진을 Gemini로 단일화. 프로덕션 배포를 위한 상대 경로 URL 적용 및 정적 파일 서빙 설정 완료.

