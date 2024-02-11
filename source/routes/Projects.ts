import App from '@/main'
import { FastifyInstance } from 'fastify'

import timingSafeEqual from '@/utils/timingSafeEqual'

export const path = '/projects'
export const cache = {
	name: 'projects',
	revalidate: async () => {
		const projects = await App.modules.prisma.project.findMany()
		return projects.map((project) => [project.id, project])
	},
}

export default (fastify: FastifyInstance, _: any, done: () => any) => {
	const cache = App.modules.caches['projects']

	fastify.get<{
		Reply: {
			200: {
				[projectId: string]: {
					id: string
					name: string
					description?: string
					url?: string
					previewImageUrl?: string
				}
			}
		}
	}>('/', (req, reply) => {
		const data = cache.collection.toObject()
		reply.status(200).send(data)
	})

	fastify.get<{
		Reply: {
			200: {
				id: string
				name: string
				description?: string
				url?: string
				previewImageUrl?: string
			}
			404: {
				message: string
			}
		}
		Params: {
			id: string
		}
	}>('/:id', (req, reply) => {
		const data = cache.collection.get(req.params.id)

		if (!data) {
			reply.status(404).send({
				message: 'Not found',
			})
			return
		}

		reply.status(200).send(data)
	})

	fastify.post<{
		Reply: {
			200: {
				message: string
				data: {
					id: string
					name: string
					description: string | null
					url: string | null
					previewImageUrl: string | null
				}
			}
			400: {
				message: string
			}
			401: {
				message: string
			}
		}
		Params: {
			name: string
		}
		Body: {
			description?: string
			url?: string
			previewImageUrl?: string
		}
	}>('/create/:name', async (req, reply) => {
		const name = req.params.name
		const data = req.body
		const auth = req.headers.authorization

		if (!timingSafeEqual(auth)) {
			reply.status(401).send({
				message: 'Unauthorized',
			})

			return
		}

		if (!data) {
			reply.status(400).send({
				message: 'Bad Request. Missing properties',
			})

			return
		}

		const op = await App.modules.prisma.project.create({
			data: {
				name,
				...data,
			},
		})

		cache.collection.set(op.id, op)

		reply.status(200).send({
			message: 'OK',
			data: op,
		})
	})

	fastify.delete<{
		Reply: {
			200: {
				message: string
				data: {
					id: string
					name: string
					description: string | null
					url: string | null
					previewImageUrl: string | null
				}
			}
			400: {
				message: string
			}
			401: {
				message: string
			}
		}
		Params: {
			id: string
		}
	}>('/delete/:id', async (req, reply) => {
		const id = req.params.id
		const auth = req.headers.authorization

		if (!timingSafeEqual(auth)) {
			reply.status(401).send({
				message: 'Unauthorized',
			})

			return
		}

		const op = await App.modules.prisma.project.delete({
			where: {
				id,
			},
		})

		cache.collection.delete(id)

		reply.status(200).send({
			message: 'OK',
			data: op,
		})
	})

	done()
}
