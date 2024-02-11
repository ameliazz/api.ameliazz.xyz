import App from '@/main'
import { FastifyInstance } from 'fastify'

import { lookup } from 'mrmime'

import timingSafeEqual from '@/utils/timingSafeEqual'

export const path = '/images'
export const cache = {
	name: 'images',
	revalidate: async () => {
		const files = (await App.modules.R2.listFiles()) || []
		let response: Array<[PropertyKey, unknown]> = []

		for (const file of files) {
			const fileData = await App.modules.R2.findFile(String(file.Key))
			if (fileData) response.push([fileData.name, fileData])
		}

		return response
	},
}

export default (fastify: FastifyInstance, _: any, done: () => any) => {
	const cache = App.modules.caches.images

	fastify.get<{
		Reply: {
			200: {
				filename: string
				contentType: string
				url: string
			}[]
		}
	}>('/', (req, reply) => {
		const images = cache.collection.toArray()

		reply.status(200).send(
			images.map((item) => {
				return {
					filename: item[0],
					contentType: item[1].contentType,
					url: `${req.protocol}://${req.hostname}/images/${item[0]}`,
				}
			})
		)
	})

	fastify.get<{
		Reply: {
			200: Buffer | string
			404: {
				message: string
				status: number
			}
		}
		Params: {
			file: string
		}
	}>('/:file', async (req, reply) => {
		const image = await App.modules.caches.images.collection.get(
			req.params.file
		)

		if (image) {
			reply.status(200).type(image.contentType).send(image.buffer)
		} else {
			reply.status(404).send({
				message: 'Not found',
				status: 404,
			})
		}
	})

	fastify.post<{
		Reply: {
			200: {
				message: string
				data: {
					name: string
					contentType: string
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
			filename: string
		}
		Body: string
	}>('/upload/:filename', async (req, reply) => {
		const auth = req.headers.authorization
		const filename = req.params.filename
		const mediaType = lookup(filename)

		if (!timingSafeEqual(auth)) {
			reply.status(401).send({
				message: 'Unauthorized',
			})

			return
		}

		if (!mediaType) {
			reply.status(400).send({
				message: 'Bad Request',
			})
			return
		}

		const data = {
			name: filename,
			contentType: mediaType,
			buffer: Buffer.from(req.body, 'base64'),
		}

		await App.modules.R2.uploadFile(data)
		cache.collection.set(filename, data)

		reply.status(200).send({
			message: 'OK',
			data: {
				name: filename,
				contentType: mediaType,
			},
		})
	})

	done()
}
