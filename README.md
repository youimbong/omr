# OMR 온라인 테스트 답안지 체크 시스템

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## 개요

OMR 온라인 테스트 답안지 체크 시스템은 교육 기관, 학원, 학교에서 객관식 시험을 온라인으로 쉽게 관리하고 채점할 수 있는 웹 애플리케이션입니다. 이 시스템은 Nuxt.js 3 프레임워크를 기반으로 개발되었으며, 직관적인 UI와 실시간 채점 기능을 제공합니다.

## 주요 기능

- **관리자 기능**
  - 시험 정답지 생성 및 관리
  - OMR 카드 스타일의 직관적인 정답 입력 인터페이스
  - 문항별 배점 설정 기능
  - 시험 결과 통계 확인

- **학생 기능**
  - 직관적인 OMR 카드 형식의 답안 제출 인터페이스
  - 실시간 시험 시간 관리
  - 즉각적인 채점 결과 확인
  - 오답 문항 표시 및 정답 확인

- **시스템 기능**
  - 반응형 디자인 (모바일, 태블릿, 데스크톱 지원)
  - 보안 관리자 인증 시스템
  - JSON 기반 로컬 데이터 저장
  - 서버 사이드 렌더링 지원

## 기술 스택

- **프론트엔드**
  - Vue.js 3
  - Nuxt.js 3
  - Tailwind CSS
  - Pinia (상태 관리)

- **백엔드**
  - Node.js
  - Nuxt Server API Routes
  - LowDB (JSON 파일 기반 데이터베이스)

- **개발 도구**
  - TypeScript
  - ESLint
  - PM2 (프로덕션 배포)

## 설치 방법

### 요구 사항

- Node.js 16.x 이상
- npm, yarn 또는 pnpm

### 설치 단계

1. 저장소 클론
   ```bash
   git clone https://github.com/yourusername/omr.git
   cd omr
   ```

2. 의존성 설치
   ```bash
   # npm 사용
   npm install
   
   # 또는 yarn 사용
   yarn install
   
   # 또는 pnpm 사용
   pnpm install
   ```

3. 개발 서버 실행
   ```bash
   npm run dev
   ```

4. 웹 브라우저에서 http://localhost:3000 접속

## 프로덕션 배포

### 빌드

```bash
# 애플리케이션 빌드
npm run build
```

### PM2를 사용한 배포

```bash
# PM2 전역 설치
npm install -g pm2

# PM2로 애플리케이션 실행
npm run pm2:start
```

자세한 배포 옵션은 [배포 문서](docs/deployment.md)를 참조하세요.

## 환경 설정

`.env` 파일을 프로젝트 루트에 생성하여 다음과 같이 환경 변수를 설정할 수 있습니다:

# 서버 포트 설정
PORT=3000

# 노드 환경 설정
NODE_ENV=production

# 관리자 비밀번호 설정
ADMIN_PASSWORD=your_secure_password

# 데이터 저장 경로 (선택 사항)
DATA_PATH=./data

## 사용 방법

### 관리자 페이지

1. `/admin` 경로로 접속
2. 관리자 비밀번호 입력
3. 정답지 생성 또는 기존 정답지 관리
4. 각 문항의 정답과 배점 설정

### 학생 시험 페이지

1. 메인 페이지에서 시험 선택
2. OMR 카드 형식으로 답안 입력
3. 제출 버튼 클릭
4. 즉시 채점 결과 확인

## 프로젝트 구조

```
omr/
├── components/        # Vue 컴포넌트
│   ├── admin/         # 관리자 관련 컴포넌트
│   └── exam/          # 시험 관련 컴포넌트
├── pages/             # 애플리케이션 페이지
├── server/            # 서버 API 라우트
│   └── api/           # API 엔드포인트
├── stores/            # Pinia 상태 관리
├── types/             # TypeScript 타입 정의
├── public/            # 정적 파일
├── data/              # 데이터 저장 디렉토리 (Git에서 제외됨)
├── nuxt.config.ts     # Nuxt 설정
└── ecosystem.config.js # PM2 설정
```

## 기여 방법

1. 이 저장소를 포크합니다.
2. 새 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`).
3. 변경 사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`).
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`).
5. Pull Request를 생성합니다.

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 연락처

프로젝트 관리자 - [이메일 주소](mailto:your.email@example.com)

프로젝트 링크: [https://github.com/yourusername/omr](https://github.com/yourusername/omr)

## 감사의 말

- [Nuxt.js](https://nuxt.com/)
- [Vue.js](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [LowDB](https://github.com/typicode/lowdb)

---

이 README는 프로젝트의 기본 정보를 제공합니다. 더 자세한 문서는 [docs](docs/) 디렉토리를 참조하세요.