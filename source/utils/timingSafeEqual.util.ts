import type { Session } from '@prisma/client'
import { client } from '@services/redis/index.serv'
import { timingSafeEqual } from 'node:crypto'

export default function safeEqual(
	input: string | undefined,
	secret: string
): boolean {
	try {
		return timingSafeEqual(Buffer.from(String(input)), Buffer.from(secret))
	} catch {
		return false
	}
}

export const auth = async (
	input: string
): Promise<{
	authenticated: boolean
	secret: string
	flags: string[]
}> => {
	const session: Session = JSON.parse(
		String(await client.get('sessions')) || '[]'
	).find((item: Session) => {
		return safeEqual(item.secret, input)
	})

	if (session) {
		return {
			authenticated: true,
			...session,
		}
	}

	return {
		authenticated: false,
		secret: input,
		flags: [],
	}
}
