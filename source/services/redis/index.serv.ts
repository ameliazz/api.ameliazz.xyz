import Redis from 'ioredis'
import { log } from '@/modules/logging/index.module'

export const client = new Redis(String(process.env['REDIS_URL']))

client.on('connect', () => {
	log(`Redis conectado`, [' IORedis '.bgRed])
})
