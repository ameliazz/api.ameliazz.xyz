import { Project } from '@prisma/client'

export const normalizeProject = (body: Project) => {
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
