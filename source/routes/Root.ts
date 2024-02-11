import { FastifyInstance } from 'fastify'

export const path = '/'

export default (app: FastifyInstance, _: any, done: () => any) => {
	app.get<{
		Reply: {
			200: string
		}
	}>('/', (req, reply) => {
		reply.status(200).send('OK')
	})

	done()
}
