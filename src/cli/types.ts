/* eslint-disable no-unused-vars */
/* eslint-disable @stylistic/no-multi-spaces */

import {
	Argv, CommandModule,
	Options,
} from "yargs"
import * as c from "../_shared/color"
import * as p from "../_shared/prompt"
import { argvSchema } from "./schema"
import { ValidateInfer } from "../_shared/validate"

///////////////////////////
// UTILS
///////////////////////////

export type Prettify<T> = {
	[K in keyof T]: Prettify<T[K]>;
} & {}

type Exact<A, B> = A extends B ? ( B extends A ? A : never ) : never

///////////////////////////

export type CmdProps = CommandModule
export type PromptGroup<L> = p.PromptGroup<L>
export type CliInterface<C extends CmdProps> = {
	name    : string;
	desc    : string;
	options : Record<string, Options>;

	run(): C;
}

type ArgvSchema = ValidateInfer<typeof argvSchema>
/**Type for check argv schema */
type SetArgv<Opts> = Exact<Opts, ArgvSchema>
  
export type CoreParams = {
	argv : SetArgv<{
		/** 
		 * Output path for generated response.
		 */
		output? : ArgvSchema['output']

		/** 
		 * Glob patterns to include files and URLs.
		 */
		include? : ArgvSchema['include']

		/** 
		 * Glob patterns to exclude files and URLs.
		 */
		exclude? : ArgvSchema['exclude']

		/** 
		 * Behavior when output file exists.
		 */
		overwrite? : ArgvSchema['overwrite']

		/** 
		 * Ollama model name to be used for AI interactions.
		 */
		model? : ArgvSchema['model']

		/** 
		 * Custom prompt text string or path.
		 */
		prompt? : ArgvSchema['prompt']

		/** 
		 * Custom system text string or path.
		 */
		system? : ArgvSchema['system']

		/** 
		 * Theme for CLI interface.
		 */
		theme? : ArgvSchema['theme']
		
		/** 
		 * Only one response should be generated.
		 * @default false
		 */
		single? : ArgvSchema['single']

		/** 
		 * Debug mode for additional logging and debugging.
		 * @default false
		 */
		debug? : ArgvSchema['debug']

		/** 
		 * Path to config file.
		 * files supported: [.mjs|.js|.json|.yml|.yaml|.toml|.tml]
		 */
		config? : ArgvSchema['config']
	}>
	c : typeof c
	p : typeof p & { log: typeof p.log & { debug: ( title: string, msg: string ) => void } }
}

export type CliParams = { argv: Argv }
export type LineParams = {
	argv     : Argv
	onCancel : () => Promise<void>
	onError  : ( error: unknown ) => Promise<void>
}
