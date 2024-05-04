import { Hono } from 'hono'

import App from '@/main'
import { auth } from '@/utils/timingSafeEqual.util'

import { Project } from '@prisma/client'
import { normalizeProject, useFetchData } from './validators.util'

export default new Hono()
	.get('/', async (ctx) => {
		const [projects] = await useFetchData(ctx)
		return ctx.json(projects, 200)
	})
	.get('/:project', async (ctx) => {
		const [projects, session, utils] = await useFetchData(ctx)
		const project = utils.getProject(String(ctx.req.param('project')))

		return ctx.json(project || {}, project ? 200 : 404)
	})
	.post('/:project', async (ctx) => {
		const [projects, session, utils] = await useFetchData(ctx),
			body = await ctx.req.json<Project>()

		if (!utils.getAccess('create_project')) {
			return ctx.text('unauthorized', 401)
		}

		await App.database.project.create({
			data: body,
		})

		projects.push(normalizeProject(body))
		App.redis.set('projects', JSON.stringify(projects))

		return ctx.json(body, 200)
	})
	.patch('/:project', async (ctx) => {
		const [projects, session, utils] = await useFetchData(ctx),
			body = await ctx.req.json<Project>(),
			projectName = ctx.req.param('project')

		if (!utils.getAccess('edit_project')) {
			return ctx.text('unauthorized', 401)
		}

		await App.database.project.update({
			where: {
				name: projectName,
			},
			data: body,
		})

		const index = projects.indexOf(Object(utils.getProject(projectName)))
		projects.splice(
			index,
			0,
			normalizeProject(
				Object.assign(Object(utils.getProject(projectName)), body)
			)
		)
		App.redis.set('projects', JSON.stringify(projects))

		return ctx.json(body, 200)
	})
	.delete('/:project', async (ctx) => {
		const [projects, session, utils] = await useFetchData(ctx),
			projectName: string = ctx.req.param('project')

		if (!utils.getAccess('delete_project')) {
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

		return ctx.json(utils.getProject(projectName), 200)
	})
