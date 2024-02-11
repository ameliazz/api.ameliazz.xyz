export class ArrayCollection<T = unknown> extends Array<T> {
	findByProperty(prop: string) {
		return this.find((item) => {
			const splittedProp = prop.split(':')
			return Boolean(item[splittedProp[0] as keyof T] == splittedProp[1])
		})
	}
}

export default class Collection<T = unknown> extends Map {
	setMany(map: Array<[PropertyKey, T]>) {
		return new Promise((resolve, reject) => {
			for (const item of map) this.set(item[0], item[1])
			resolve(true)
		})
	}

	toArray() {
		return Array.from(this, ([key, value]) => {
			return [key, value]
		})
	}

	toObject() {
		return Object.fromEntries(this.entries())
	}
}
