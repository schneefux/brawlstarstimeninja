import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import CubejsServerCore from '@cubejs-backend/server-core'
// untyped
const ClickhouseDriver: any = require('@cubejs-backend/clickhouse-driver')

import ClickerService from './services/Clicker';
import { Player, BattleLog } from '~/model/Brawlstars';
import { Order } from './services/cubes/Cube';

const service = new ClickerService();

const app = express()
app.use(cors({ origin: '*' })) // TODO for development only
app.use(bodyParser.json({ limit: '50mb' }))

// error helper
const asyncMiddleware = (fn: (req: Request, res: Response, next: any) => Promise<void>) => (req: Request, res: Response, next: any) => Promise.resolve(fn(req, res, next)).catch(next)

app.get('/clicker/status', (req, res) => {
  res.json({ 'status': 'ok' })
})

app.post('/clicker/track', asyncMiddleware(async (req, res) => {
  await service.store(<{ player: Player, battleLog: BattleLog }> req.body)
  res.json({})
}))

app.get('/clicker/top/:metric', asyncMiddleware(async (req, res) => {
  res.header('Cache-Control', 'public, max-age=60')
  res.json(await service.getTopByMetric(req.params.metric, parseInt(req.query.limit as string) || 100))
}))

app.get('/clicker/top/:metric/brawler/:brawlerId', asyncMiddleware(async (req, res) => {
  res.header('Cache-Control', 'public, max-age=60')
  res.json(await service.getTopBrawlerByMetric(req.params.brawlerId, req.params.metric, parseInt(req.query.limit as string) || 100))
}))

app.get('/clicker/meta/map', async (req, res) => {
  res.header('Cache-Control', 'public, max-age=60')
  res.json(await service.getMapMeta(req.query.trophyrangeLower as string || '0', req.query.trophyrangeHigher as string || '9999'))
})

app.get('/clicker/cube/:cube/metadata', asyncMiddleware(async (req, res) => {
  res.header('Cache-Control', 'public, max-age=3600')
  res.json(service.getCubeMetadata(req.params.cube))
}))

app.options('/clicker/cube/:cube/query/:dimensions?', cors({
  origin: '*', // TODO for development only
  allowedHeaders: ['x-brawltime-cache', 'x-brawltime-tag'],
  maxAge: 86400, // 24h max, capped by Firefox
}))

app.get('/clicker/cube/:cube/query/:dimensions?', asyncMiddleware(async (req, res) => {
  const split = (n: string) => n.split(',').filter(p => p.length > 0)

  const cubeName = req.params.cube
  const dimensions = split(req.params.dimensions || '')
  const query = (req.query || {}) as Record<string, string>
  const measures = split(query['include'] || '')
  // koa: keeps `slice[name]` = value
  // express: automatically parses bracket syntax, creates `slice` = { [name]: value }
  const slices = Object.entries((query.slice || {}) as Record<string, string>)
    .reduce((slices, [name, value]) => ({ ...slices, [name]: value.split(',') }), {} as Record<string, string[]>)
  const order = split(query['sort'] || '')
    .filter((name) => name.length > 0)
    .reduce((order, name) => ({
      ...order,
      ...((name.startsWith('-') ? ({ [name.slice(1)]: 'desc' }) : ({ [name]: 'asc' })) as Record<string, Order>),
    }), {} as Record<string, Order>)
  const limit = parseInt(query['limit']) || 1000
  const cache = parseInt(query['cache'] || req.header('x-brawltime-cache') || '60')
  const name = query['name'] || req.header('x-brawltime-tag')
  const format = query['format']

  res.header('Cache-Control', `public, stale-while-revalidate=${cache/10}, stale-if-error=${cache}`)
  res.header('Last-Modified', new Date().toUTCString())
  res.header('Expires', new Date(Date.now() + cache * 1000).toUTCString())
  try {
    const data = await service.queryCube(cubeName, measures, dimensions, slices, order, limit, name, format)
    if (typeof data == 'string') {
      res.header('Content-Type', 'text/csv')
      res.header('Content-Disposition', `attachment; filename=${name}.csv`)
      res.send(data)
    } else {
      res.json(data)
    }
  } catch (error) {
    res.status(400)
    console.error('error executing query', error)
    if (error instanceof Error) {
      res.json({ message: error.message })
    } else {
      res.json(error)
    }
  }
}))

const core = CubejsServerCore.create({
  dbType: 'clickhouse',
  // TODO: careful - driver uses shared session
  driverFactory: () => new ClickhouseDriver({
    host: process.env.CLICKHOUSE_HOST,
    database: 'brawltime',
    cacheAndQueueDriver: 'memory',
  }),
  apiSecret: 'secret', // TODO
  telemetry: false,
})
core.initApp(app)

const port = parseInt(process.env.PORT || '') || 3004
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
