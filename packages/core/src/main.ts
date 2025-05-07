import CLI from './chat/main'

export { CLI }

/**
 * The configuration options for the CLI.
 */
export type Config = Parameters<CLI['fn']>[0]

/**
 * Run envai with the given configuration.
 * @param {object} config - The configuration to use.
 * @returns {Promise<void>} The promise that resolves when the CLI is finished.
 * @example
 * import { run } from 'env-ai'
 *
 * run({
 *   input: ['./src/*', '!src/../*', 'https://example.com'],
 *   theme: 'docs',
 *   output: 'README.md',
 * })
 */
export const run = async ( config: Config ) => {

	//@ts-ignore
	const cli = new CLI( {} )

	return await cli.fn( config )

}

/**
 * Define a configuration for the CLI.
 * @param {object} config - The configuration to use.
 * @returns {object} The configuration object.
 * @example
 * import { defineConfig } from 'env-ai'
 *
 * export default defineConfig({
 *   input: ['./src/*', '!src/../*', 'https://example.com'],
 *   theme: 'docs',
 *   output: 'README.md',
 * })
 */
export const defineConfig = ( config: Config ) => config
