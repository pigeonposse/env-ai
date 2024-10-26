import {
	name, version, bugs, description, 
} from '../../package.json' 
export { version }
export const projectDesc = description
export const bugsUrl = bugs.url
export const projectName = name

export const overwrite = {
	always : 'always',
	ask    : 'ask',
	last   : 'last',
} as const

export const theme = {
	custom      : 'custom',
	explain     : 'explain',
	docs        : 'docs',
	fix         : 'fix',
	performance : 'performance',
	refactor    : 'refactor',
	test        : 'tests',
} as const

export const themeDesc = {
	custom      : 'Adapt the system to your needs.',
	explain     : 'Provide clear explanations of code and functionality.',
	docs        : 'Generate user guides and technical documentation.',
	fix         : 'Identify and resolve bugs for accurate output.',
	performance : 'Improve the efficiency of your code and reduce response times.',
	refactor    : 'Improve code structure for better readability and maintainability.',
	test        : 'Create tests and ensure quality.',
} as const satisfies Record<keyof typeof theme, string> 
  
export const PROMPT_VARS = { CONTENT: 'content' } as const
