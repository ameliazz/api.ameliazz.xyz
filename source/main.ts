import { Enhancer, loadRoutes } from '@/Loader.app'
import { Hono } from 'hono'

import { serve, HttpBindings } from '@hono/node-server'
import { prettyJSON } from 'hono/pretty-json'

import { log, warn, error } from '@/modules/logging/index.module'
import { client as RedisClient } from '@/services/redis/index.serv'
import { prisma as PrismaClient } from '@/services/database/index.serv'

export class Application {
	enhancer = Enhancer
	database = PrismaClient
	redis = RedisClient
	server = new Hono<{
		Bindings: HttpBindings
	}>({
		strict: false,
	})

	routes: {
		name: string
		routes: Array<{
			path: string
			app: Hono
		}>
	}[]
	config: {
		port: number
		hostname: string
		prettyJSON: boolean
		apiSecret: string
	} = Object(Enhancer.env)

	constructor() {
		this.run()
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

	async run() {
		log(`Ambiente: ${` ${this.enhancer.env.NAME} `.bgMagenta}`)

		if (this.config.prettyJSON) {
			this.server.use(prettyJSON({ space: 4 }))
		}

		const routes = await loadRoutes()
		if (routes) {
			this.routes = routes

			for (const route of routes) {
				route.routes.forEach((route) => {
					this.server.route(route.path, route.app)
				})
			}

			log(
				`${String(routes.length).cyan} rota${'(s)'.gray} registrada${
					'(s)'.gray
				}`,
				[' Route Handler '.bgGreen]
			)
		}

		this.$hydrateRedisData()

		serve(
			{
				fetch: this.server.fetch,
				port: this.config.port,
				hostname: this.config.hostname,
			},
			() => {
				log(`API servindo a porta ${String(this.config.port).cyan}`, [
					' Hono Server '.bgRed,
				])
			}
		)
	}
}

export default new Application()
