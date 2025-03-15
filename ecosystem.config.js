module.exports = {
  apps: [
    {
      name: 'omr-app',
      exec_mode: 'cluster',
      instances: 'max', // 또는 원하는 인스턴스 수
      script: '.output/server/index.mjs',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '1234' // 환경 변수에서 관리자 비밀번호 가져오기
      },
      watch: false,
      max_memory_restart: '1G',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      time: true
    }
  ]
}; 