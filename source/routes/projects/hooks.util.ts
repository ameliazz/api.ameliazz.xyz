import { Project } from '@prisma/client'
import { client as RedisClient } from '@/services/redis/index.serv'

import { auth } from '@/utils/timingSafeEqual.util'
import { Context } from 'hono'
import { useSession } from '@/utils/session.util'

export const useNormalizeProject = (body: Project) => {
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
	const session = await useSession(ctx),
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

	return [projects, session, utils] as [
		Project[],
		typeof session,
		typeof utils
	]
}
