
import * as consts from './const'
import {
	Core,
	coreMessages,
} from './core/main'
import { setLine } from './line'
import {
	EnvAIOptions,
} from './types'
import * as c             from '../_shared/color'
import * as p             from '../_shared/prompt'
import { setErrorString } from '../_shared/string'

const projectName   = consts.projectName

export class EnvAI  {

	options
	color = c
	prompt = p
	data = consts

	message = {
		intro  : `${projectName} assistant`,
		outro  : `${projectName} assistant completed!`,
		cancel : `${projectName} assistant cancelled!`,
		error  : {
			general      : `Error`,
			debug        : `Debug Error`,
			debugFlag    : ( flag: string ) => `You can debug the error with flag: ${flag}`,
			debugContact : ( url: string ) => `Or contact developers at: ${url}`,
			unexpected   : 'Unexpected error',
		},
		...coreMessages,
	}

	/**
	 * Create a env-ai instance
	 * @param options {EnvAIOptions} - Options for env-ai instance
	 * 
	 */
	constructor( options?: EnvAIOptions ) {

		this.options = options

	}

	async run() {

		const p       = this.prompt
		const c       = this.color
		const options = this.options || {}
		const isDebug = options.debug

		const prompts = {
			...p,
			log : {
				...p.log,
				debug : ( title: string, msg: string ) => {

					if ( isDebug ) p.log.info( c.debug( 'DEBUG' ) + ' ' + c.gray( title ) + '\n\n' + msg )

				},
			},
		}

		const core     = new Core( {
			options,
			c,
			p : prompts,
		} )
		const cancel   = () => ( core.cancel( this.message.cancel ) )
		const { list } = await setLine( 
			{
				options,
				c,
				p : prompts,
			}, 
			{
			onCancel : async () => ( cancel() ),
			onError  : async error => {

				const e           = typeof error === 'string' ? error : setErrorString( error as Error )
				const isCoreError = error instanceof core.Error
				const errorMsg    = ( error instanceof Error ) ? error.message : typeof error === 'string' ? error : this.message.error.unexpected
				

				const set = ( v:string, d: string ) => ( p.log.step( '' ), p.log.error( c.error( v.toUpperCase() ) ), p.log.step( '' ), p.cancel( d ) )

				if ( isCoreError ) {

					if ( error.message === core.ERROR_ID.CANCELLED ) cancel()
					else set( this.message.error.general, errorMsg )

				}
				else if ( isDebug ) set( this.message.error.debug, e.trim() )
				else
					set(
						this.message.error.general,
						`${errorMsg}\n\n   ${this.message.error.debugFlag( c.italic( '--debug' ) )}\n   ${this.message.error.debugContact( c.link( this.data.bugsUrl ) )}`,
					)

				// console.log( {
				// 	isCoreError,
				// 	isDebug,
				// } )
				core.exit( 'error' )

				},
			} 
		)

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



}
