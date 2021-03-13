const ClickhouseDriver = require('@cubejs-backend/clickhouse-driver')

module.exports = {
  dbType: 'clickhouse',
  driverFactory: () => new ClickhouseDriver({
    readOnly: true,
    database: 'brawltime',
    cacheAndQueueDriver: 'memory', // TODO set up redis in production
  }),
  apiSecret: process.env.CUBEJS_API_SECRET || 'secret',
  telemetry: false,
  checkAuth: (req, auth) => {},
  // TODO: set up datadog monitoring
  http: {
    cors: {
      origin: '*',
    },
  },
};