export default {
  apps: [{
    name: 'events-api',
    script: 'dist/index.js',
    cwd: '/home/ubuntu/events-api',
    instances: 1,
    exec_mode: 'fork',
    node_args: '--experimental-vm-modules',
    env: {
      NODE_ENV: 'production',
      PORT: 3015,
    },
    log_file: '/var/log/bbworlds/events-api-combined.log',
    error_file: '/var/log/bbworlds/events-api-error.log',
    out_file: '/var/log/bbworlds/events-api-out.log',
    max_memory_restart: '200M',
    watch: false,
    autorestart: true,
    max_restarts: 3,
    restart_delay: 5000,
  }],
};
