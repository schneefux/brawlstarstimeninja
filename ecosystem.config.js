const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  apps: [{
    name: 'api',
    port: 9990,
    script: './functions/dist/server.js',
    watch: false,
    exec_mode: 'cluster',
    instances: 'max',
    env: {
      'NODE_ENV': 'production',
      'CACHE_PATH': 'cache/',
      'BRAWLSTARS_TOKEN': process.env.BRAWLSTARS_TOKEN,
    },
  }, {
    name: 'web',
    port: 9991,
    script: './node_modules/nuxt/bin/nuxt.js',
    args: 'start',
    cwd: './',
    watch: 'false',
    exec_mode: 'cluster',
    instances: 'max',
    env: {
      'NODE_ENV': 'production',
      'API_PORT': 9990, /* server to server calls */
      'API_URL_BROWSER': 'https://api01.brawlstarstime.ninja',
    },
  }]
}
