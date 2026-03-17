# 🎮 Interactive Motion Lab

React 기반 인터랙티브 웹 포트폴리오 프로젝트입니다.  
한 페이지 안에서 다양한 인터랙션을 실험하고 구현하는 “Motion Playground” 컨셉으로 제작되었습니다.

---

## 🔥 프로젝트 목표

- 정적인 포트폴리오가 아닌 **움직이는 경험 중심 UI 구현**
- 마우스 / 스크롤 / 클릭 기반 인터랙션 설계
- Canvas, SVG, Animation 라이브러리를 활용한 고급 UI 구현
- 퍼포먼스 고려한 애니메이션 구조 설계

---

## 🛠 Tech Stack

- React (Vite)
- Tailwind CSS
- Framer Motion
- HTML5 Canvas
- Git & GitHub

---

## 📂 브랜치 전략

| 브랜치 | 설명 |
|--------|------|
| main | 배포 가능한 안정 버전 |
| develop | 개발 통합 브랜치 |
| feature/* | 기능 단위 작업 브랜치 |

### 작업 흐름

feature → develop → main

---

## ✨ 주요 기능 (예정 포함)

## 4 카드별 로직 요약

### Magnetic Balls
- 다수의 공 객체를 만들어 애니메이션 루프에서 갱신합니다.
- 벽 충돌 반사 + 마우스 접근 시 반발력 적용 + 감쇠를 통해 움직임을 만듭니다.

### Bubble Pop
- 누르고 있는 동안 일정 간격으로 버블을 연속 생성합니다.
- 버블 수명이 끝나거나 화면 밖으로 나가면 파티클로 분해(pop)되고, 파티클도 수명 기반으로 소멸됩니다.

### Elastic Blob
- 원형에 가까운 다수 포인트를 스프링 물리로 연결한 soft-body 형태입니다.
- 포인터 드래그 시 특정 포인트 주변에 가중치를 퍼뜨려 자연스럽게 늘어나는 젤리 효과를 만듭니다.

### Tetris Drop
- 격자 보드 + 활성 블록을 관리하는 상태 머신 구조입니다.
- 충돌 검사, 고정(lock), 라인 클리어, 점수 계산, 다음 블록 생성, 게임오버를 처리합니다.

### Gooey Liquid
- 여러 원(버블)을 SVG 필터(blur + color matrix)로 렌더링해 서로 붙는 점성(gooey) 느낌을 만듭니다.

### Gravity Sandbox
- 떨어지는 덩어리(clump)가 충돌 시 미세한 모래 셀(grid)로 분해됩니다.
- 이후 셀룰러 오토마타처럼 아래/대각 이동 규칙으로 모래가 쌓입니다.


---

## 🚀 실행 방법

```bash
# 1. 저장소 클론
git clone https://github.com/YOUR_ID/interactive-motion-lab.git

# 2. 폴더 이동
cd interactive-motion-lab

# 3. 패키지 설치
npm install

# 4. 개발 서버 실행
npm run dev
