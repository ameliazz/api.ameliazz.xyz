import Collection from '@/structures/Collections'

export default class Cache<DataType = unknown> {
	collection = new Collection<DataType>()
	lastRevalidate: number
	revalidateCallback?: () => Promise<Array<[PropertyKey, DataType]>>

	constructor(
		revalidateCallback?: () => Promise<Array<[PropertyKey, DataType]>>
	) {
		this.revalidateCallback = revalidateCallback
		this.revalidate()
	}

	async revalidate() {
		if (this.revalidateCallback) {
			this.lastRevalidate = Date.now()
			const newData = await this?.revalidateCallback()

			this.collection.clear()
			this.collection.setMany(newData)
		} else return
	}
}
