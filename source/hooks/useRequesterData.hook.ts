import { Project } from '@prisma/client'
import { client as RedisClient } from '@services/redis/index.serv'

import { Context } from 'hono'
import useSession from './useSession.hook'

const useRequesterData = async (ctx: Context) => {
	const session = await useSession(ctx),
		projects: Project[] = JSON.parse(
			String(await RedisClient.get('projects')) || '[]'
		)

	const utils = {
		getProject(key: string) {
			return projects.find((item) => item.name == key)
		},
		getPermission: session.getPermission,
	}

	return [projects, session, utils] as [
		Project[],
		typeof session,
		typeof utils
	]
}

export default useRequesterData
