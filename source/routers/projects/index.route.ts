import { Hono } from 'hono'

import App from '@/main'
import useRequesterData from '@hooks/useRequesterData.hook'

import { normalizeProject } from '@utils/normalize.util'
import type { Project } from '@prisma/client'
import { PermissionFlags } from '@/types/Flags.enum'

export default new Hono()
	.get('/', async (ctx) => {
		const [projects] = await useRequesterData(ctx)
		return ctx.json(projects, 200)
	})
	.get('/:project', async (ctx) => {
		const [projects, session, utils] = await useRequesterData(ctx),
			project = utils.getProject(String(ctx.req.param('project')))

		return ctx.json(project || {}, project ? 200 : 404)
	})
	.post('/:project', async (ctx) => {
		const [projects, session, utils] = await useRequesterData(ctx),
			body = await ctx.req.json<Project>()

		if (!utils.getPermission(PermissionFlags.CreateProjects)) {
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
		const [projects, session, utils] = await useRequesterData(ctx),
			body = await ctx.req.json<Project>(),
			projectName = ctx.req.param('project')

		if (!utils.getPermission(PermissionFlags.UpdateProjects)) {
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
		const [projects, session, utils] = await useRequesterData(ctx),
			projectName: string = ctx.req.param('project')

		if (!utils.getPermission(PermissionFlags.DeleteProjects)) {
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
