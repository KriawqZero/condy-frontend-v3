module.exports = {
  apps: [
    {
      name: 'frontend-v3-dev',
      exec_mode: 'fork',
      script: 'node_modules/.bin/next',
      args: ['dev', '--port', '4500'],
      env: {
        NODE_ENV: 'development',
        PORT: 4500
      }
    },
    {
      name: 'frontend-v3-prod',
      exec_mode: 'cluster',
      instances: 'max',
      script: 'node_modules/next/dist/bin/next',
      args: ['start'],
      env_prod: {
        NODE_ENV: 'production',
        PORT: 4500
      }
    }
  ]
}
