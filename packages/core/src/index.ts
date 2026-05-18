
import { EnvAI  } from './cli'
import { EnvAIOptions } from './cli/types'

export { EnvAI }

/**
 * The configuration options for the CLI.
 */
export type Config = EnvAIOptions

/**
 * Run envai with the given configuration.
 *
 * @param   {Config}        config - The configuration to use.
 * @returns {Promise<void>}        The promise that resolves when the CLI is finished.
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

	const cli = new EnvAI( config)
	return await cli.run( )

}

/**
 * Define a configuration for the CLI.
 *
 * @param   {Config} config - The configuration to use.
 * @returns {object}        The configuration object.
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
