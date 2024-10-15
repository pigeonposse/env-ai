
import { setLine } from "./line"
import * as c from "../_shared/color"
import * as p from "../_shared/prompt"
import {
	CliInterface, 
	CliParams, 
	CoreParams, 
	CmdProps,
} from "./types"
import {
	Core, coreMessages, 
} from "./core/main"
import * as consts from "./const"
import { setErrorString } from "../_shared/string"

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
		include : {
			alias    : 'i',
			describe : 'Glob patterns to include files and URLs',
			type     : 'array',
			// default  : [ '**/*.{js,ts,jsx,tsx}' ],
		},
		exclude : {
			alias    : 'e',
			describe : 'Glob patterns to exclude files and URLs',
			type     : 'array',
			// default  : [ '**/node_modules/**', '**/dist/**' ],
		},
		// ai
		model : {
			alias    : 'm',
			describe : 'Ollama model name',
			type     : 'string',
		},
		prompt : {
			alias    : 'p',
			describe : 'Custom prompt text string or path',
			type     : 'string',
		},
		system : {
			alias    : 's',
			describe : 'Custom system text string or path',
			type     : 'string',
		},
		theme : {
			alias    : 't',
			describe : 'Theme',
			choices  : Object.values( consts.theme ),
			// default  : theme.custom,
		},
		// response
		output : {
			alias    : 'o',
			describe : 'Output path for generated response',
			type     : 'string',
		},
		overwrite : {
			describe : "Behavior when output file exists",
			choices  : Object.values( consts.overwrite ),
			// default  : overwrite.ask,
		},
		single : {
			describe : 'Only one response',
			type     : 'boolean',
			// default  : false,
		},
		// others
		config : {
			alias    : 'c',
			describe : 'Path to config file. files supported: [.mjs|.js|.json|.yml|.yaml|.toml|.tml]',
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
			// default  : false,
            
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
			unexpected   : 'Unexpected error: ',
		},
		...coreMessages,
	}
	
	bugsUrl = this._const.bugsUrl

	constructor( argv: CliParams['argv'] ){

		this.#argv = argv
	
	}

	/**
	 * Run the CLI.
	 * @param argv The parsed command line arguments as provided by `yargs.argv`.
	 * @returns The result of the CLI action.
	 */
	async fn( params: FnParams ){

		return await this.#handler( params ) 
	
	}
	
	async #handler( argv: CoreParams['argv'] ) {

		const p = this.p
		const c = this.c
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

		const core = new Core( {
			argv,
			c,
			p : prompts,
		} )
		const cancel = () => ( core.cancel( this.message.cancel ) )
		const { list } = await setLine( {
			argv,
			c,
			p : prompts, 
		}, {
			argv     : cliArgv, 
			onCancel : async() => ( cancel() ),
			onError  : async error => {

				const e = typeof error === 'string' ? error : setErrorString( error as Error )
				const isCoreError = error instanceof core.Error
				const errorMsg = ( error instanceof Error ) ? error.message : typeof error === 'string' ? error : this.message.error.unexpected
				const isDebug = argv.debug

				const set = ( v:string, d: string ) => ( p.log.step( '' ), p.log.error( c.error( v ) ), p.log.step( '' ), p.cancel( d ) )
				
				if ( isCoreError ) {

					if ( error.message === core.ERROR_ID.CANCELLED ) cancel()
					else set( this.message.error.general, errorMsg )
				
				}
				else if ( isDebug ) set( this.message.error.debug, e.trim() )
				else 
					set( 
						this.message.error.general,
						`${errorMsg}\n\n   ${this.message.error.debugFlag( c.italic( '--debug' ) )}\n   ${this.message.error.debugContact( c.link( this.bugsUrl ) )}`,
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
			intro   : async () => p.intro( c.introColor( this.message.intro ) ),
			config  : async() => await core.config.set(),
			model   : async() => await core.model.get(),
			content : async(): Promise<string | undefined> => await core.inputs.get(),
			ai      : async ( { results } ): Promise<AiResponse> => {

				const content = results.content
				if ( !content || typeof results.content !== 'string' ) throw UnexpectedError

				const res = await core.prompt.get( content )

				return res 
			
			},
			response : async ( { results } ) => {

				if ( !results.ai || !results.model ) throw UnexpectedError

				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const res = await core.response.get( results.ai.user, results.ai.system, results.model )
				return res
			
			},
			outro : async () => ( p.log.step( '' ), p.outro( c.success( this.message.outro ) ) ),
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
