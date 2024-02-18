import RawConfig from '../app.config.json'
import dotenv from 'dotenv'

dotenv.config({
	path:
		RawConfig['@app:env'] == 'devlopment'
			? `${process.cwd()}/.env.local`
			: `${process.cwd()}/.env`,
})

const Config: {
	'@app:version': string
	'@app:R2BucketName': string
	'@app:resources': {
		[resource: PropertyKey]: string | number | null
	}
	'@server:host': string
	'@server:port': number
} = Object(RawConfig)[`@app:env=${process.env['ENV'] || RawConfig['@app:env']}`]

import Fastify, { FastifyInstance } from 'fastify'
import Middie from '@fastify/middie'
import Cors from '@fastify/cors'

import { PrismaClient } from '@prisma/client'
import * as R2 from '@/database/r2'

import Logger from '@/modules/logger'
import * as Transports from '@/modules/logger/transports/All'

import Cache from '@/modules/cache'
import Resend from '@/modules/resend'

import { readRoutes } from '@/utils/readRoutes'

class Application {
	modules: {
		logger: Logger
		caches: {
			[name: PropertyKey]: Cache
		}
		R2: typeof R2
		prisma: PrismaClient
		resend?: typeof Resend
	} = {
		logger: new Logger([new Transports.Console.default()]),
		caches: {},
		R2,
		prisma: new PrismaClient(),
	}
	server: {
		fastify: FastifyInstance
		port: number
		address: string
	} = {
		fastify: Fastify(),
		port:
			Config['@server:port'] == 0
				? Number(process.env['PORT'])
				: Config['@server:port'],
		address: Config['@server:host'],
	}

	constructor() {
		this.setup().then(() => {
			this.listen()
		})
	}

	async setup() {
		await this.server.fastify.register(Middie)
		await this.server.fastify.register(Cors, {
			origin: '*',
		})

		if (RawConfig['@app:env'] == 'devlopment') {
			this.modules.logger.log(
				`aviso: a aplicação está sendo executada em ambiente de desenvolvimento.`
					.gray,
				{
					level: 'warn',
					tags: ['Environment'],
				}
			)
		}

		for (const resource in Config['@app:resources']) {
			switch (resource) {
				case '@logger:transports':
					const LoggerTransports: string | string[] = Object(
						Config['@app:resources']
					)?.[resource]

					const enabledTransports = Array.isArray(LoggerTransports)
						? LoggerTransports?.map(
								(transportName: string) =>
									Object(Transports)[transportName].default
						  )
						: LoggerTransports == 'all'
						? Object.values(Transports).flatMap(
								(item) => item.default
						  )
						: [Transports.Console.default]

					this.modules.logger = new Logger(
						enabledTransports.map((transport) => new transport())
					)

					this.modules.logger.log(
						`Módulo de logs carregado com ${
							String(this.modules.logger.transports.length).cyan
						} transporte(s)`,
						{
							tags: ['Logger'.yellow, 'Transports'.green],
						}
					)

					break

				case '@resend:emails':
					const ResendConfigObject: {
						enabled: boolean
						domain?: string
					} = Object(Config['@app:resources'])?.[resource]

					if (ResendConfigObject.enabled) {
						this.modules.resend = Resend

						this.modules.logger.log(
							`Módulo ${'Resend'.cyan} carregado. ${
								`(Domínio: ${
									String(ResendConfigObject.domain).magenta
								})`.gray
							}`,
							{
								tags: ['Logger'.yellow, 'Transports'.green],
							}
						)
					}

					break
			}
		}

		const routes = await readRoutes()
		routes.forEach((route) => {
			if (route.cache) {
				const dataType = route.cache.cacheDataType
				this.modules.caches[route.cache.name] = new Cache<
					typeof dataType
				>(route.cache.revalidate)

				this.modules.logger.log(
					`Cache ${
						String(route.cache.name).cyan
					} gerado para a rota ${String(route.path).cyan}`,
					{
						tags: ['Router'.green],
					}
				)
			}

			this.server.fastify.register(route.default, {
				prefix: route.path,
			})
		})

		this.modules.logger.log(
			`${String(routes.length).cyan} rota(s) registradas`,
			{
				tags: ['Router'.green],
			}
		)

		return true
	}

	listen() {
		this.server.fastify
			.listen({
				host: this.server.address,
				port: this.server.port,
			})
			.then(() => {
				this.modules.logger.log(
					`API servindo a porta ${String(this.server.port).cyan}`,
					{
						tags: ['Server'.green],
					}
				)
			})
	}
}

export { Config as ApplicationEnvConfig }
export default new Application()
