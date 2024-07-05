import { PathLike, existsSync, readdirSync } from 'fs'
import { Hono } from 'hono'

export default function readdir(dir: PathLike) {
	if (!existsSync(dir)) return false
	return readdirSync(dir)
}

export async function readdirAndImport<fileData>(
	dir: string,
	filter?: (item: string) => boolean
) {
	const files = readdir(dir)
	const response: {
		name: string
		data: fileData
	}[] = []

	if (!files) return response

	for (const filename of files.filter(filter || ((item) => item))) {
		response.push({
			name: filename,
			data: require(`${dir}/${filename}`).default,
		})
	}

	return response
}

export const parsePath = (input: string) => {
	switch (input) {
		case 'index':
			return ''

		case 'main':
			return ''

		default:
			return input
	}
}

export const readRouters = async (dir = `${__dirname}/../routers`) => {
	const response: {
		name: string
		routes: {
			path: string
			app: Hono
		}[]
	}[] = []

	const raw = readdir(dir)

	if (!raw) return response
	for (const route of raw) {
		let routeSubRoutes: {
			path: string
			app: Hono
		}[] = []

		if (route.endsWith('.route.ts') || route.endsWith('.route.js')) {
			routeSubRoutes = [
				{
					path: `/${parsePath(route.split('.')[0])}`,
					app: require(`${dir}/${route}`).default,
				},
			]
		} else {
			routeSubRoutes = (
				await readdirAndImport<Hono>(
					`${dir}/${route}`,
					(str) =>
						str.endsWith('.route.ts') || str.endsWith('.route.js')
				)
			).map((item) => {
				return {
					path: `/${parsePath(route)}${parsePath(
						item.name.split('.')[0]
					)}`,
					app: item.data,
				}
			})
		}

		response.push({
			name: route,
			routes: routeSubRoutes,
		})
	}

	return response
}
