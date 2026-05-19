/**
 * ESLint config.
 *
 * @description ESLint config for JavaScript and TypeScript projects.
 * @see https://eslint.org/docs
 * @see https://typescript-eslint.io/
 * @see https://dovenv.pigeonposse.com/guide/plugin/lint
 */

import { setConfig }    from '@dovenv/theme-pigeonposse/eslint'
import { defineConfig } from 'eslint/config'

const config = setConfig( {
	general   : 'ts',
	jsdoc     : true,
	gitignore : true,
	package   : true,
	json      : true,
	toml      : true,
	md        : true,
	ignore    : [
		'**/README.md',
		'**/CHANGELOG.md',
		'**/docs/**',
	],
} )
// console.log(config)
export default defineConfig( config, {
	rules : {
		'package-json/no-redundant-publishConfig' : 'off',
		'package-json/valid-engines'              : 'off',
	},
} )
