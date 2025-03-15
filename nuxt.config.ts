// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  // TypeScript 지원 활성화
  typescript: {
    strict: true,
    typeCheck: true
  },
  
  // 앱 메타데이터
  app: {
    head: {
      title: '온라인 테스트 답안지 체크 프로그램',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '온라인 테스트 답안지 자동 채점 시스템' }
      ]
    }
  },

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  
  // 로컬 JSON 데이터베이스 저장 위치 설정
  runtimeConfig: {
    // 서버 사이드에서만 접근 가능한 환경 변수
    adminPassword: process.env.ADMIN_PASSWORD || '1234', // 기본 비밀번호 설정
    public: {
      dataPath: './data'
    }
  },
  // SSR 설정 (서버 사이드 렌더링)
  ssr: true,
  
  // 개발 서버 설정
  devServer: {
    port: 3000
  }
  
})