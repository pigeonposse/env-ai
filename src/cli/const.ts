import {
	name, version, bugs, description } from '../../package.json' assert {type: 'json'
}

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

export const PROMPT_VARS = { CONTENT: 'content' } as const
