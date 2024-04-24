import { Hono } from 'hono'

import App from '@/main'
import { auth } from '@/utils/timingSafeEqual.util'

import { Project } from '@prisma/client'
import normalizeBodyUtil from './normalizeBody.util'

export default new Hono()
	.get('/', async (ctx) => {
		const projects: Project[] = JSON.parse(
			String(await App.redis.get('projects')) || '[]'
		)

		return ctx.json(projects, 200)
	})
	.get('/:project', async (ctx) => {
		const projects: Project[] = JSON.parse(
				String(await App.redis.get('projects')) || '[]'
			),
			project: Project | undefined = projects.find(
				(item) => item.name == ctx.req.param('project')
			)

		return ctx.json(project || {}, project ? 200 : 404)
	})
	.post('/', async (ctx) => {
		const projects: Project[] = JSON.parse(
				String(await App.redis.get('projects')) || '[]'
			),
			body = await ctx.req.json<Project>(),
			session = await auth(String(ctx.req.header('authorization')))

		if (
			!session.authenticated ||
			!session.checkPermission('create_project')
		) {
			return ctx.text('unauthorized', 401)
		}

		await App.database.project.create({
			data: body,
		})

		projects.push(normalizeBodyUtil(body))
		App.redis.set('projects', JSON.stringify(projects))

		return ctx.json(body, 200)
	})
	.delete('/:project', async (ctx) => {
		const projects: Project[] = JSON.parse(
				String(await App.redis.get('projects')) || '[]'
			),
			projectName = ctx.req.param('project'),
			session = await auth(String(ctx.req.header('authorization')))

		if (
			!session.authenticated ||
			!session.checkPermission('delete_project')
		) {
			return ctx.text('unauthorized', 401)
		}

		await App.database.project.delete({
			where: {
				name: projectName,
			},
		})

		App.redis.set(
			'projects',
			JSON.stringify(projects.filter((item) => item.name != projectName))
		)

		return ctx.json(
			projects.find((item) => item.name == projectName),
			200
		)
	})
