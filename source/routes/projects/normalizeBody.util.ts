import { Project } from '@prisma/client'

export default (body: Project) => {
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
