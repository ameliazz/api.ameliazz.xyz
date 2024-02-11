import Transport from '@/structures/Transport'
import 'colors'

class Console extends Transport {
	constructor() {
		super({
			name: 'ConsoleTransport',
			type: 'console',
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

export default Console
