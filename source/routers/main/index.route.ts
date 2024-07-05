import { Hono } from 'hono'

import App from '@/main'
import useSession from '@hooks/useSession.hook'
import { PermissionFlags } from '@/types/Flags.enum'

export default new Hono()
	.get('/', (ctx) => {
		return ctx.text('OK', 200)
	})
	.get('/hydrate', async (ctx) => {
		const session = await useSession(ctx)

		if (session.getPermission(PermissionFlags.RefreshCache)) {
			try {
				await App.$hydrateRedisData()
				return ctx.text('OK', 200)
			} catch {
				return ctx.status(500)
			}
		} else {
			return ctx.text('unauthorized', 401)
		}
	})
