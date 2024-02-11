import { S3 } from '@aws-sdk/client-s3'
import { ApplicationEnvConfig } from '@/main'

export const R2BucketName = String(
	ApplicationEnvConfig['@app:R2BucketName'] || process.env['R2_BUCKET_NAME']
)

export const Client = new S3({
	credentials: {
		accessKeyId: String(process.env['R2_KEY']),
		secretAccessKey: String(process.env['R2_SECRET_KEY']),
	},
	forcePathStyle: true,
	endpoint: String(process.env['R2_ENDPOINT']),
	region: 'us-east-1',
})

export const findFile = async (filename: string) => {
	const rawObject = await Client.getObject({
		Bucket: R2BucketName,
		Key: filename.split('/').length >= 1 ? filename : `/images/${filename}`,
	})

	const name = filename.split('/')

	return rawObject.Body
		? {
				name: name[name.length - 1],
				contentType: rawObject.ContentType,
				buffer: Buffer.from(
					await rawObject.Body?.transformToByteArray()
				),
		  }
		: undefined
}

export const uploadFile = async (file: {
	name: string
	contentType: string
	buffer: Buffer
}) => {
	const params = {
		Bucket: R2BucketName,
		Key:
			file.name.split('/').length >= 1
				? file.name
				: `/images/${file.name}`,

		ContentType: file.contentType,
		Body: file.buffer,
	}

	await Client.putObject(params)
	return true
}

export const listFiles = async (max: number = 20) => {
	return (
		await Client.listObjectsV2({
			Bucket: R2BucketName,
			MaxKeys: max,
		})
	).Contents
}
