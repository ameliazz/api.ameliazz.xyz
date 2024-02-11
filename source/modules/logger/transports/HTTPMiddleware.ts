import Transport from '@/structures/Transport'
import App from '@/main'
import 'colors'

class HTTPMiddleware extends Transport {
	constructor() {
		super({
			name: 'HTTPMiddlewareTransport',
			type: 'another',
			excludeDefaultInteractions: true,
		})

		App.server.fastify.use((req, res, next) => {
			this.log(
				`Requisição feita para a rota ${String(req.url).cyan} de ${
					String(req.ip).cyan
				}`,
				'info',
				['HTTP', `${String(req.method).toUpperCase()}`.blue]
			)

			next()
		})
	}

	log(message: string, level: 'info' | 'warn' | 'error', tags?: string[]) {
		switch (level) {
			case 'info':
				console.log(
					`${new Date().toUTCString().gray} ${
						` ${level.toUpperCase()} `.bgBlue
					}${tags ? ` ${tags.join(' | '.gray)}` : ''} » ${message}`
				)
				break

			case 'warn':
				console.warn(
					`${new Date().toUTCString().gray} ${
						` ${level.toUpperCase()} `.bgYellow
					}${tags ? ` ${tags.join(' | '.gray)}` : ''} » ${message}`
				)

				break

			case 'error':
				console.error(
					`${new Date().toUTCString().gray} ${
						` ${level.toUpperCase()} `.bgRed
					}${tags ? ` ${tags.join(' | '.gray)}` : ''} » ${message}`
				)

				break
		}

		return true
	}
}

export default HTTPMiddleware
