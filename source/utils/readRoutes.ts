import { readdir } from 'fs/promises'

export const readRoutes = async () => {
	const routes = await readdir(`${__dirname}/../routes/`)
	const response = []

	for (const route of routes) {
		response.push(await import(`${__dirname}/../routes/${route}`))
	}

	return response
}
