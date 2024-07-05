import { Hono } from 'hono'

import App from '@/main'
import useSession from '@/hooks/useSession.hook'

import { PermissionFlags } from '@/types/Flags.enum'
import type { Session } from '@prisma/client'

export default new Hono()
	.get('/', async (ctx) => {
		const session = await useSession(ctx)
		const showSecrets = ctx.req.query('secrets')

		if (!session.getPermission(PermissionFlags.ReadSessions)) {
			return ctx.text('unauthorized', 401)
		}

		const sessions: Session[] = JSON.parse(
			String(await App.redis.get('sessions')) || '[]'
		).map((session: Session) => {
			return {
				...session,
				secret: typeof showSecrets == 'string' ? session.secret : null,
			}
		})

		return ctx.json(sessions, 200)
	})
	.post('/:secret', async (ctx) => {
		const session = await useSession(ctx)

		if (!session.getPermission(PermissionFlags.DeleteSessions)) {
			return ctx.text('unauthorized', 401)
		}

		await App.database.session.create({
			data: {
				secret: ctx.req.param('secret'),
				flags: await ctx.req.json<string[]>(),
			},
		})

		App.$hydrateRedisData()

		return ctx.text('OK', 200)
	})
	.delete('/:secret', async (ctx) => {
		const session = await useSession(ctx)

		if (!session.getPermission(PermissionFlags.DeleteSessions)) {
			return ctx.text('unauthorized', 401)
		}

		const targetSession = await useSession(ctx.req.param('secret'))

		if (targetSession.authenticated) {
			try {
				await App.database.session.delete({
					where: {
						secret: targetSession.secret,
					},
				})

				await App.$hydrateRedisData()
				return ctx.text('OK', 200)
			} catch {
				return ctx.text('Not found', 404)
			}
		}
	})
