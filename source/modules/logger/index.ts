import { ArrayCollection } from '@/structures/Collections'
import Transport from '@/structures/Transport'

class Logger {
	pid: number = process.pid
	transports: ArrayCollection<Transport> = new ArrayCollection()

	constructor(transports: Transport[]) {
		this.transports.push(...transports)
	}

	log(
		message: string,
		LogOptions?: {
			level?: 'info' | 'warn' | 'error'
			tags?: string[]
			transport?: string
		}
	): boolean {
		const transports = LogOptions?.transport
			? [this.transports.findByProperty(`name:${LogOptions.transport}`)]
			: this.transports.filter(
					(transport) => transport.excludeDefaultInteractions != true
			  )

		transports.forEach((transport) => {
			transport?.log(
				message,
				LogOptions?.level || 'info',
				LogOptions?.tags
			)
		})

		return true
	}
}

export default Logger
