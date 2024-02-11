import { ApplicationEnvConfig } from '@/main'
import { Resend as ResendClient } from 'resend'

const ResendConfigObject: {
	enabled: boolean
	domain?: string
} = Object(ApplicationEnvConfig['@app:resources'])['@resend:emails']

const resend = new ResendClient(process.env['RESEND_SECRET'])
export const sendEmail = async (
	to: string,
	body: {
		subject: string
		html: string
	}
) => {
	return await resend.emails.send({
		from: `Amélia R. <mailer@${ResendConfigObject.domain}>`,
		to: to.split(','),
		subject: body.subject,
		html: body.html,
	})
}

export default resend
