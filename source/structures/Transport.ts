import { ArrayCollection } from './Collections'

type HistoryDataSchema = {
	data: object
	timestamp: string
}

class Transport {
	name: string
	type: 'console' | 'fetchHook' | 'another'
	history: ArrayCollection<HistoryDataSchema> = new ArrayCollection()
	excludeDefaultInteractions: boolean = false

	constructor(options: {
		name: string
		type: 'console' | 'fetchHook' | 'another'
		excludeDefaultInteractions?: boolean
	}) {
		this.name = options.name || 'UnknownTransport'
		this.type = options.type || 'console'
		this.excludeDefaultInteractions =
			options.excludeDefaultInteractions || false
	}

	log(
		message: string,
		level: 'warn' | 'error' | 'info' = 'info',
		tags?: string[]
	): boolean {
		switch (level) {
			case 'info':
				console.log(message)
				break

			case 'warn':
				console.warn(message)
				break

			case 'error':
				console.error(message)
				break
		}

		this.saveInHistory({
			data: { message, level },
			timestamp: new Date().toISOString(),
		})

		return true
	}

	saveInHistory(data: HistoryDataSchema): boolean {
		this.history.push(data)
		return true
	}
}

export default Transport
