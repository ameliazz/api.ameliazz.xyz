import { Project } from '@prisma/client'
import { client as RedisClient } from '@/services/redis/index.serv'

import { auth } from '@/utils/timingSafeEqual.util'
import { Context } from 'hono'

export const normalizeProject = (body: Project) => {
	return Object.assign(
		{
			name: null,
			public: null,
			description: null,
			short_description: null,
			url: null,
			repository_url: null,
			logo_url: null,
			social_preview_url: null,
		},
		body
	)
}

export const useFetchData = async (ctx: Context) => {
	const session = await auth(String(ctx.req.header('authorization'))),
		projects: Project[] = JSON.parse(
			String(await RedisClient.get('projects')) || '[]'
		)

	const utils = {
		getProject(key: string) {
			return projects.find((item) => item.name == key)
		},
		getAccess(flag: string) {
			return session.authenticated && session.flags.includes(flag)
		},
	}

	const response: [Project[], typeof session, typeof utils] = [
		projects,
		session,
		utils,
	]
	return response
}
