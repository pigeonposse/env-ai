import { paramsSchema }    from './schema'
import * as c            from '../_shared/color'
import * as p            from '../_shared/prompt'
import { ValidateInfer } from '../_shared/validate'

///////////////////////////
// UTILS
///////////////////////////

export type Prettify<T> = {
	[K in keyof T]: Prettify<T[K]>;
} & {}

type Exact<A, B> = A extends B ? ( B extends A ? A : never ) : never

///////////////////////////

export type PromptGroup<L> = p.PromptGroup<L>
type ParamsSchema = ValidateInfer<typeof paramsSchema>
/**Type for check argv schema */
type SeParams<Opts> = Exact<Opts, ParamsSchema>

export type CoreParams = {
	options : SeParams<{

		/**
		 * Output path for generated response.
		 */
		output? : ParamsSchema['output']

		/**
		 * Glob patterns to input files and URLs.
		 */
		input? : ParamsSchema['input']

		/**
		 * Behavior when output file exists.
		 */
		overwrite? : ParamsSchema['overwrite']

		/**
		 * Ollama model name to be used for AI interactions.
		 */
		model? : ParamsSchema['model']

		/**
		 * Custom prompt text string or path.
		 */
		prompt? : ParamsSchema['prompt']

		/**
		 * Custom system text string or path.
		 */
		system? : ParamsSchema['system']

		/**
		 * Theme for CLI interface.
		 */
		theme? : ParamsSchema['theme']

		/**
		 * Only one response should be generated.
		 *
		 * @default false
		 */
		single? : ParamsSchema['single']

		/**
		 * Debug mode for additional logging and debugging.
		 *
		 * @default false
		 */
		debug? : ParamsSchema['debug']

		/**
		 * Path to config file.
		 * files supported: [.mjs|.js|.json|.yml|.yaml|.toml|.tml]
		 */
		config? : ParamsSchema['config']
	}>
	c : typeof c
	p : typeof p & { log: typeof p.log & { debug: ( title: string, msg: string ) => void } }
}


export type LineParams = {
	onCancel : () => Promise<void>
	onError  : ( error: unknown ) => Promise<void>
}
export type EnvAIOptions = CoreParams['options']