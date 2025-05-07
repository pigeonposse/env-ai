/**
 * ESLint config.
 * @description ESLint config for JavaScript and TypeScript projects.
 * @see https://eslint.org/docs
 * @see https://typescript-eslint.io/
 * @see https://dovenv.pigeonposse.com/guide/plugin/lint
 */

import { lint } from '@dovenv/theme-pigeonposse'

const { dovenvEslintConfig } = lint

/** @type {import('eslint').Linter.Config[]} */
export default [
	dovenvEslintConfig.includeGitIgnore(),
	...dovenvEslintConfig.config,
	dovenvEslintConfig.setIgnoreConfig( [ '**/docs/**/*' ] ),
]
