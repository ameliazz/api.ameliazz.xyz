import { Context } from 'hono'
import { auth } from '@utils/timingSafeEqual.util'
import { PermissionFlags } from '@/types/Flags.enum'

const useSession = async (ctx: Context | string) => {
	const session = await auth(
		String(
			typeof ctx == 'string'
				? ctx
				: ctx.req.header('authorization') ||
						ctx.req.query('authorization')
		)
	)

	const sessionObject = {
		...session,
		getPermission: (flag: PermissionFlags) => {
			return (
				session.authenticated &&
				(session.flags.includes(PermissionFlags.bypass) ||
					session.flags.includes(flag))
			)
		},
	}

	return sessionObject
}

export default useSession
