import App from '@/main'
import { FastifyInstance } from 'fastify'

import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'

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
			reply.type(String(image.contentType))
			reply.status(200).send(image.buffer)
		} else {
			reply.status(404).send({
				message: 'Not found',
				status: 404,
			})
		}
	})

	fastify.post<{
		Params: {
			file: string
		}
		Reply: {
			200: {
				expiresIn: number
				signedUrl: string
			}
			400: {
				message: string
			}
			401: {
				message: string
			}
		}
		Body: {
			filename: string
			mediaType: string
		}
	}>('/upload/:file', async (req, reply) => {
		const data = req.body
		const auth = req.headers.authorization

		if (!timingSafeEqual(auth)) {
			reply.status(401).send({
				message: 'Unauthorized',
			})

			return
		}

		if (!data.filename || !data.mediaType) {
			reply.status(400).send({
				message: 'Bad Request. Missing properties',
			})
			return
		}

		const presignedUrl = await getSignedUrl(
			App.modules.R2.Client,
			new PutObjectCommand({
				Bucket: App.modules.R2.R2BucketName,
				Key: `/images/${data.filename}`,
				ContentType: data.mediaType,
			}),
			{ expiresIn: 600 }
		)

		setTimeout(() => {
			cache.revalidate()
		}, 10 * (60 * 1000))

		reply.status(200).send({
			expiresIn: 600000,
			signedUrl: presignedUrl,
		})
	})

	done()
}
