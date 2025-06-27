module.exports = {
  apps: [
    {
      name: 'frontend-v3',
      exec_mode: 'cluster',
      instances: 'max',
      script: 'node_modules/next/dist/bin/next',
      args: ['start'],
      env_local: {
        NODE_ENV: 'development',
        PORT: 4500
      },
      env_dev: {
        NODE_ENV: 'development',
        PORT: 4500
      },
      env_prod: {
        NODE_ENV: 'production',
        PORT: 4500
      }
    }
  ]
}
