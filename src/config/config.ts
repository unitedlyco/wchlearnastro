// Config
// ------------
// Description: The configuration file for the website.

export interface Logo {
	src: string
	alt: string
}

export type Mode = 'auto' | 'light' | 'dark'

export interface Config {
	siteTitle: string
	siteDescription: string
	ogImage: string
	logo: Logo
	canonical: boolean
	noindex: boolean
	mode: Mode
	scrollAnimations: boolean
}

export const configData: Config = {
	siteTitle: 'WCH Learn',
	siteDescription:
		'WCH Learn is your go to resource for health and wellness information. We offer a wide range of resources to help you stay healthy and active.',
	ogImage: '/og.jpg',
	logo: {
		src: '/logo.svg',
		alt: 'World Council For Health Learn'
	},
	canonical: true,
	noindex: false,
	mode: 'auto',
	scrollAnimations: true
}
