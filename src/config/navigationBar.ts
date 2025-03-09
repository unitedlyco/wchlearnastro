// Navigation Bar
// ------------
// Description: The navigation bar data for the website.
export interface Logo {
	src: string
	alt: string
	text: string
}

export interface NavSubItem {
	name: string
	link: string
}

export interface NavItem {
	name: string
	link: string
	submenu?: NavSubItem[]
}

export interface NavAction {
	name: string
	link: string
	style: 'primary' | 'secondary' | 'neutral'
	size: 'sm' | 'base' | 'lg'
}

export interface NavData {
	logo: Logo
	navItems: NavItem[]
	navActions: NavAction[]
}

export const navigationBarData: NavData = {
	logo: {
		src: '/logo.svg',
		alt: 'The tailwind astro theme',
		text: 'Foxi.'
	},
	navItems: [
		{ name: 'Home', link: '/' },
		{ name: 'Blog', link: '/blog' },
		{ name: 'Substack', link: '/substack' },
		{ name: 'Courses', link: '/courses' },
		{
			name: 'Resources',
			link: '#',
			submenu: [
				{ name: 'Features', link: '/features' },
				{ name: 'Changelog', link: '/changelog' },
				{ name: 'FAQ', link: '/faq' },
				{ name: 'Terms', link: '/terms' }
			]
		},
		{ name: 'Contact', link: '/contact' }
	],
	navActions: [{ name: 'Join Now!', link: '/signup', style: 'primary', size: 'lg' }]
}
