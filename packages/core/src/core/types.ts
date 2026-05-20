import type {
	overwrite, theme,
} from './const'
import type * as c from '../_shared/color'
import type * as p from '../_shared/prompt'

export type PromptGroup<L> = p.PromptGroup<L>

export type LineParams = {
	onCancel : () => Promise<void>
	onError  : ( error: unknown ) => Promise<void>
}

/**
 * The configuration options for the CLI.
 */
export type Config = {
	/*
	 * Output path for generated response.
	 */
	output? : string

	/**
	 * Glob patterns to input files and URLs.
	 */
	input? : string[]

	/**
	 * Behavior when output file exists.
	 */
	overwrite? : typeof overwrite[keyof typeof overwrite]

	/**
	 * Ollama model name to be used for AI interactions.
	 */
	model? : string

	/**
	 * Custom prompt text string or path.
	 */
	prompt? : string

	/**
	 * Custom system text string or path.
	 */
	system? : string

	/**
	 * Theme for CLI interface.
	 */
	theme? : typeof theme[keyof typeof theme]

	/**
	 * Only one response should be generated.
	 *
	 * @default false
	 */
	single? : boolean

	/**
	 * Debug mode for additional logging and debugging.
	 *
	 * @default false
	 */
	debug? : boolean

	/**
	 * Path to config file.
	 * files supported: [.mjs|.js|.json|.yml|.yaml|.toml|.tml]
	 */
	config? : string
}

export type CoreParams = {
	options : Config
	c       : typeof c
	p       : typeof p & { log: typeof p.log & { debug: ( title: string, msg: string ) => void } }
}

