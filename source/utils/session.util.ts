import { Context } from 'hono'
import { auth } from './timingSafeEqual.util'

export const useSession = async (ctx: Context) => {
	return await auth(
		String(ctx.req.header('authorization') || ctx.req.query('session'))
	)
}
