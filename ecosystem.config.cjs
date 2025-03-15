require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'omr-app',
      exec_mode: 'cluster',
      instances: 1,
      script: './.output/server/index.mjs',
      env: {
        PORT: process.env.PORT || 3001,
        NODE_ENV: process.env.NODE_ENV || 'production',
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '1234',
        DATA_PATH: process.env.DATA_PATH || './data'
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