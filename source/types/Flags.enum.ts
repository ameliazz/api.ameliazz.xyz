export enum PermissionFlags {
	ReadSessions = 'read:sessions',
	CreateSessions = 'create:sessions',
	DeleteSessions = 'delete:sessions',
	UpdateSessions = 'update:sessions',

	CreateProjects = 'create:projects',
	DeleteProjects = 'delete:projects',
	UpdateProjects = 'update:projects',

	RefreshCache = 'data:refresh',
	bypass = 'all:bypass',
}
