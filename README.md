# Vestori

> 삶의 흔적이 이야기가 되는 공간

일상의 순간들을 기록하는 감성 저널 앱.

## 기술 스택

- **React 18** + **TypeScript**
- **Tailwind CSS**
- **Vite**
- `date-fns` — 날짜 포맷
- `uuid` — 고유 ID 생성
- `localStorage` — 브라우저 로컬 저장

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 프로젝트 구조

```
src/
├── components/
│   ├── Header.tsx      # 로고 + 날짜
│   ├── Composer.tsx    # 입력 영역
│   ├── Feed.tsx        # 기록 목록 + 날짜 구분
│   └── EntryCard.tsx   # 개별 기록 카드
├── hooks/
│   └── useEntries.ts   # 기록 상태 + localStorage
├── types/
│   └── index.ts        # Entry, Mood 타입
├── utils/
│   └── date.ts         # 날짜 포맷 유틸
├── App.tsx
├── main.tsx
└── index.css
```

## 주요 기능

- 기분 마커와 함께 순간 기록 (✦ ♡ ◎ ☁ ✿)
- 날짜별 자동 그룹화
- 마음에 담기 / 기록 삭제
- `localStorage`로 새로고침 후에도 유지
- `Cmd/Ctrl + Enter`로 빠른 입력

## 로드맵

- [ ] 태그 기능
- [ ] 검색
- [ ] 달력 뷰
- [ ] 이미지 첨부
- [ ] AI 돌아보기 (Claude API)
