
import * as consts from './const'
import {
	Core,
	coreMessages,
} from './core/main'
import { setLine } from './line'
import {
	CliInterface,
	CliParams,
	CoreParams,
	CmdProps,
} from './types'
import * as c             from '../_shared/color'
import * as p             from '../_shared/prompt'
import { setErrorString } from '../_shared/string'

type FnParams = Omit<CoreParams['argv'], 'config'>
export class CLI<C extends CmdProps = CmdProps> implements CliInterface<C> {

	#argv

	protected c = c
	protected p = p
	protected _const = consts

	name = ''
	desc = ''

	// Not default values for options
	options: CliInterface<C>['options'] = {
		// inputs
		input : {
			alias    : 'i',
			describe : 'Path patterns or URLs to be processed',
			type     : 'array',
		},
		// ai
		model : {
			alias    : 'm',
			describe : 'Ollama LLM model name',
			type     : 'string',
		},
		system : {
			alias    : 's',
			describe : 'System message (text, path or url)',
			type     : 'string',
		},
		prompt : {
			alias    : 'p',
			describe : 'Fist prompt to generate a response (text, path or url)',
			type     : 'string',
		},
		theme : {
			alias    : 't',
			describe : 'Set a theme for your chat.',
			choices  : Object.values( consts.theme ),
		},
		// response
		output : {
			alias    : 'o',
			describe : 'Output path for the generated response',
			type     : 'string',
		},
		overwrite : {
			describe : 'Behavior when output file exists',
			choices  : Object.values( consts.overwrite ),
		},
		single : {
			describe : 'Only one response',
			type     : 'boolean',
		},
		// others
		config : {
			alias    : 'c',
			describe : 'Path to config file. Files supported: [.mjs|.js|.json|.yml|.yaml|.toml|.tml]',
			type     : 'string',
		},
		// 'non-interactive' : {
		// 	alias    : 'n',
		// 	describe : 'Non-interactive mode. Do not prompt for user input',
		// 	type     : 'boolean',
		// 	default  : false,
		// },
		debug : {
			describe : 'Debug mode',
			type     : 'boolean',
		},
	}

	message = {
		intro  : 'Line execution',
		outro  : 'Operation completed!',
		cancel : 'Operation cancelled',
		error  : {
			general      : `Error`,
			debug        : `Debug Error`,
			debugFlag    : ( flag: string ) => `You can debug the error with flag: ${flag}`,
			debugContact : ( url: string ) => `Or contact developers at: ${url}`,
			unexpected   : 'Unexpected error',
		},
		...coreMessages,
	}

	constructor( argv: CliParams['argv'] ) {

		this.#argv = argv

	}

	/**
	 * Run the CLI.
	 * @param argv The parsed command line arguments as provided by `yargs.argv`.
	 * @param params
	 * @returns The result of the CLI action.
	 */
	async fn( params: FnParams ) {

		return await this.#handler( params )

	}

	async #handler( argv: CoreParams['argv'] ) {

		const p       = this.p
		const c       = this.c
		const cliArgv = this.#argv

		const prompts = {
			...p,
			log : {
				...p.log,
				debug : ( title: string, msg: string ) => {

					if ( argv.debug ) p.log.info( c.debug( 'DEBUG' ) + ' ' + c.gray( title ) + '\n\n' + msg )

				},
			},
		}

		const core     = new Core( {
			argv,
			c,
			p : prompts,
		} )
		const cancel   = () => ( core.cancel( this.message.cancel ) )
		const { list } = await setLine( {
			argv,
			c,
			p : prompts,
		}, {
			argv     : cliArgv,
			onCancel : async () => ( cancel() ),
			onError  : async error => {

				const e           = typeof error === 'string' ? error : setErrorString( error as Error )
				const isCoreError = error instanceof core.Error
				const errorMsg    = ( error instanceof Error ) ? error.message : typeof error === 'string' ? error : this.message.error.unexpected
				const isDebug     = argv.debug

				const set = ( v:string, d: string ) => ( p.log.step( '' ), p.log.error( c.error( v.toUpperCase() ) ), p.log.step( '' ), p.cancel( d ) )

				if ( isCoreError ) {

					if ( error.message === core.ERROR_ID.CANCELLED ) cancel()
					else set( this.message.error.general, errorMsg )

				}
				else if ( isDebug ) set( this.message.error.debug, e.trim() )
				else
					set(
						this.message.error.general,
						`${errorMsg}\n\n   ${this.message.error.debugFlag( c.italic( '--debug' ) )}\n   ${this.message.error.debugContact( c.link( this._const.bugsUrl ) )}`,
					)

				// console.log( {
				// 	isCoreError,
				// 	isDebug,
				// } )
				core.exit( 'error' )

			},
		} )

		const UnexpectedError = new Error( this.message.error.unexpected )
		type AiResponse = Awaited<ReturnType<typeof core.prompt.get>>

		await list( {
			intro    : async () => p.intro( c.introColor( this.message.intro.toUpperCase() ) ),
			config   : async () => await core.config.set(),
			model    : async () => await core.model.get(),
			content  : async () => await core.input.get(),
			ai       : async ( ): Promise<AiResponse> => await core.prompt.get( ),
			output   : async ( ) => await core.output.get( ),
			response : async ( { results } ) => {

				if ( !results.ai || !results.output || !results.model || !results.content ) throw UnexpectedError

				const res = await core.response.get( {
					system : results.ai.system,
					model  : results.model,
					docs   : results.content,
					output : results.output,
				} )
				return res

			},
			outro : async () => ( p.log.step( '' ), p.outro( c.success( this.message.outro.toUpperCase() ) ) ),
		} )

	}

	run() {

		return {
			command  : this.name,
			describe : this.desc,
			builder  : yargs => yargs.options( this.options ),
			handler  : this.#handler.bind( this ) as C['handler'],
		} as C

	}

}
