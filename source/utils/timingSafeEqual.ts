import { timingSafeEqual } from 'node:crypto'

export default (
	secret: string | undefined,
	serverSecret: string = String(process.env['API_SECRET'])
): boolean => {
	try {
		return timingSafeEqual(
			Buffer.from(String(secret)),
			Buffer.from(serverSecret)
		)
	} catch {
		return false
	}
}
