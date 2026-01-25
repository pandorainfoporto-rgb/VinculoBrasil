// ============================================
// VINCULO BRASIL - PM2 ECOSYSTEM CONFIG
// Para rodar nativo (sem Docker)
// ============================================

module.exports = {
  apps: [
    {
      name: 'vinculo-api',
      script: './server/dist/index.js',
      instances: 'max', // Usar todos os cores
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // Logs
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,
      // Health check
      min_uptime: '10s',
      max_restarts: 10,
    },
  ],

  deploy: {
    production: {
      user: 'vinculo',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'git@github.com:your-org/vinculo-brasil.git',
      path: '/var/www/vinculo',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
};
