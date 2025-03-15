# 온라인 테스트 답안지 체크 프로그램

사용자가 정답을 입력하고 시험을 관리할 수 있는 웹 기반 테스트 시스템입니다.

## 주요 기능

- **관리자 기능**:
  - 시험 문제 생성 및 관리
  - 선택지 및 정답 설정
  - 문제별 배점 관리
  
- **시험 기능**:
  - 객관식 문제 응시
  - 자동 채점
  - 결과 즉시 확인

## 설치 방법

### 사전 요구사항

- Node.js (16.x 이상)
- npm 또는 yarn

### 설치 단계

1. 저장소 클론

```bash
git clone https://github.com/yourusername/omr-checker.git
cd omr-checker
```

2. 의존성 설치

```bash
npm install
# 또는 
yarn install
```

3. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

4. 웹 브라우저에서 http://localhost:3000 접속

## PM2를 사용한 프로덕션 배포

### 설치

PM2를 전역으로 설치합니다:

```bash
npm install -g pm2
# 또는
yarn global add pm2
# 또는
pnpm add -g pm2
```

### 빌드

애플리케이션을 빌드합니다:

```bash
npm run build
# 또는
yarn build
# 또는
pnpm build
```

### PM2로 실행

PM2를 사용하여 애플리케이션을 실행합니다:

```bash
npm run pm2:start
# 또는
yarn pm2:start
# 또는
pnpm pm2:start
```

### 기타 PM2 명령어

```bash
# 애플리케이션 중지
npm run pm2:stop

# 애플리케이션 재시작
npm run pm2:restart

# 무중단 재시작 (코드 변경 시)
npm run pm2:reload

# 애플리케이션 삭제
npm run pm2:delete

# 로그 확인
npm run pm2:logs

# 모니터링
npm run pm2:monit
```

### 환경 변수 설정

관리자 비밀번호와 같은 환경 변수를 설정하려면 다음과 같이 실행합니다:

```bash
ADMIN_PASSWORD=your_secure_password pm2 start ecosystem.config.js
```

또는 `.env` 파일을 생성하여 환경 변수를 관리할 수 있습니다.

## 사용 방법

### 1. 관리자 페이지 (/admin)

1. 테스트 기본 정보 입력 (제목, 설명, 총 배점)
2. "문제 추가" 버튼을 클릭하여 문제 생성
3. 각 문제에 대해:
   - 문제 내용 입력
   - 배점 설정
   - 선택지 추가 및 내용 입력
   - 정답 선택 (라디오 버튼)
4. "저장하기" 버튼을 클릭하여 테스트 데이터 저장

### 2. 테스트 페이지 (/)

1. 문제를 읽고 선택지 중에서 답을 선택
2. 모든 문제에 답변 후 "시험 제출" 버튼 클릭
3. 결과 페이지에서 채점 결과 확인

## 기술 스택

- **프론트엔드**: Nuxt.js 3, Vue.js, TailwindCSS
- **데이터 저장**: 브라우저 로컬 스토리지

## 주의사항

- 현재 이 애플리케이션은 로컬 스토리지를 사용하므로 브라우저 데이터가 지워지면 설정한 테스트 데이터도 함께 삭제됩니다.
- 실제 서비스를 위해서는 서버 측 데이터 저장 및 사용자 인증 등의 기능을 추가할 필요가 있습니다.