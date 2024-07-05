import { Enhancer, loadRouters } from '@/Loader.app'
import { Hono } from 'hono'

import { serve, HttpBindings } from '@hono/node-server'
import { rateLimiter } from 'hono-rate-limiter'
import { prettyJSON } from 'hono/pretty-json'

import { log } from '@modules/logging/index.module'
import { client as RedisClient } from '@services/redis/index.serv'
import { prisma as PrismaClient } from '@services/database/index.serv'

export class Application {
	enhancer = Enhancer
	database = PrismaClient
	redis = RedisClient
	server = new Hono<{
		Bindings: HttpBindings
	}>({
		strict: false,
	})

	routers: {
		name: string
		routes: Array<{
			path: string
			app: Hono
		}>
	}[] = []

	config = Enhancer.env

	constructor() {
		this.start()
	}

	async $hydrateRedisData() {
		const projects = await this.database.project.findMany()
		const sessions = await this.database.session.findMany()

		this.redis.set('projects', JSON.stringify(projects)).then(() => {
			log(`Cache ${'projetos'.magenta} revalidado.`, [
				' App '.bgMagenta,
				' IORedis '.bgRed,
			])
		})

		this.redis.set('sessions', JSON.stringify(sessions)).then(() => {
			log(`Cache ${'sessões'.magenta} revalidado.`, [
				' App '.bgMagenta,
				' IORedis '.bgRed,
			])
		})

		return false
	}

	async start() {
		log(`Ambiente: ${` ${this.enhancer.env.NAME} `.bgMagenta}`)

		this.server.use(
			rateLimiter({
				windowMs: 15 * 60 * 1000,
				limit: 100,
				standardHeaders: 'draft-6',
				keyGenerator: (c) =>
					c.req.header('x-forwarded-for') ||
					c.req.header('x-real-ip') ||
					'anon',
			})
		)

		if (this.config.prettyJSON) {
			this.server.use(prettyJSON({ space: 4 }))
		}

		const routers = await loadRouters()
		if (routers) {
			this.routers = routers

			for (const router of routers) {
				router.routes.forEach((route) => {
					this.server.route(route.path, route.app)
				})
			}

			log(
				`${String(routers.length).cyan} roteador${
					'(es)'.gray
				} registrado${'(s)'.gray}`,
				[' Router Handler '.bgGreen]
			)
		}

		await this.$hydrateRedisData()

		serve(
			{
				fetch: this.server.fetch,
				port: this.config.port,
				hostname: this.config.hostname || undefined,
			},
			() => {
				log(`API servindo a porta ${String(this.config.port).cyan}`, [
					' Server '.bgRed,
				])
			}
		)
	}
}

export default new Application()
