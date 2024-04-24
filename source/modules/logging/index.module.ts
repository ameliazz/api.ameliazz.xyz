import 'colors'

export default function $log(
	message: string,
	data: {
		level?: 'info' | 'warn' | 'error' | 'shadow'
		tags?: string[]
	} = {
		level: 'info',
	}
) {
	const level = data.level || 'info'
	const tags = data.tags || []

	switch (level) {
		case 'info':
			console.log(
				`${new Date().toUTCString().gray} ${
					` ${level.toUpperCase()} `.bgBlue
				}${tags.length >= 1 ? ` ${tags.join(', '.gray)}` : ''} ${
					'~'.gray
				} ${message}`
			)
			break

		case 'shadow':
			console.log(
				`${new Date().toUTCString().gray} ${'~'.gray} ${message.gray}`
			)
			break

		case 'warn':
			console.warn(
				`${new Date().toUTCString().gray} ${
					` ${level.toUpperCase()} `.bgYellow
				}${tags.length >= 1 ? ` ${tags.join(', '.gray)}` : ''} ${
					'~'.gray
				} ${message}`
			)

			break

		case 'error':
			console.error(
				`${new Date().toUTCString().gray} ${
					` ${level.toUpperCase()} `.bgRed
				}${tags.length >= 1 ? ` ${tags.join(', '.gray)}` : ''} ${
					'~'.gray
				} ${message}`
			)

			break
	}

	return true
}

export const log = (message: string, tags?: string[]) => {
	return $log(message, {
		level: 'info',
		tags,
	})
}

export const warn = (message: string, tags?: string[]) => {
	return $log(message, {
		level: 'warn',
		tags,
	})
}

export const error = (message: string, tags?: string[]) => {
	return $log(message, {
		level: 'error',
		tags,
	})
}
