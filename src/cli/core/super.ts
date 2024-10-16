import { CoreParams } from '../types'

import Ai from '../../_shared/ai'
import Sys from '../../_shared/sys'
import * as string from '../../_shared/string'
import * as process from '../../_shared/process'
import * as consts from '../const'
import { argvSchema } from '../schema'
import {
	TypedError, catchError, 
} from '../../_shared/error'

// se tiene que definir aqui para que acepte instaceof luego
const ErroClass = class CoreError extends TypedError {}

export class CoreSuper {

	protected _c : CoreParams['c']

	protected _p : CoreParams['p']

	protected _argv : CoreParams['argv']

	protected _sys = new Sys()
	protected _ai = new Ai()
	protected _string = string
	protected _const = consts
	protected _process = process
	protected _catchError = catchError

	Error = ErroClass

	ERROR_ID = {
		CANCELLED          : 'CANCELLED',
		RESPONSE_CANCELLED : 'RESPONSE_CANCELLED', 
	}
	title = 'core'
	description : string | undefined
	argvSceham = argvSchema

	constructor( {
		argv, c, p, 
	}: CoreParams ){

		this._c = c
		this._p = p

		this._argv = argv
	
	}
	protected _successRes( title: string, res: string, onlyText = false ){

		const text = title + ( res !== '' ? ( '\n' + this._c.gray( res ) ) : '' )
		if ( onlyText ) return text
		this._p.log.success( title + '\n' + this._c.gray( res ) )

	}
	protected _errorRes( title: string, res: string, onlyText = false ) {

		const text = title + ( res !== '' ? ( '\n' + this._c.gray( res ) ) : '' )
		if ( onlyText ) return text
		this._p.log.error( text )

	}
	protected _setDebug( msg: string ) {

		this._p.log.debug( this._c.section( this.title.toUpperCase() ), msg )
	
	}

	protected _setTitle( ) {

		const description = this.description ? ( '\n\n' + this._c.gray( this.description ) ) : ''
		this._p.log.info( this._c.section( this.title.toUpperCase() ) + description )
	
	}
	protected _setErrorMessage( e: unknown, unknownMessage = 'Unexpected error' ): string {

		if ( e instanceof Error ) return e.message
		else return unknownMessage
	
	}

	cancel( msg: string ) {

		this._p.log.warn( this._c.warn( msg ) )
		this.exit( )
	
	}

	exit( code: number | 'error' = 0 ) {

		console.log( '' )
		if ( code === 'error' ) this._process.exit( 1 )
		else this._process.exit( code )

	}
	async _textPrompt( args:{
		message : string

		placeholder? : string 
	} ) {

		const prompt = await this._p.text( {
			message     : args.message,
			placeholder : args.placeholder,
			validate( value ) {

				if ( !value || value.trim() === '' ) return 'No empty value is allowed.'
        
			},
		} )
		if ( this._p.isCancel( prompt ) ) throw new this.Error( this.ERROR_ID.CANCELLED )

		return prompt
	
	}

	async _confirmPrompt( args: { message: string } ) {

		const prompt = await this._p.confirm( { message: args.message } )

		if ( this._p.isCancel( prompt ) ) throw new this.Error( this.ERROR_ID.CANCELLED )
		return prompt
	
	}

	async _selectPrompt<Opts extends {
		title : string,
		value : string,
		desc? : string 
	}[] >( args: {
		message : string,

		opts : Opts
	} ): Promise<Opts[number]["value"]> {

		const maxTitleLength = Math.max( ...args.opts.map( opt => opt.title.length ) ) + 2

		const padding = ( length: number ) => ' '.repeat( maxTitleLength - length )
		const prompt = await this._p.select( {
			message : args.message,
			options : args.opts.map( opt => ( {
				value : opt.value,
				label : opt.title + ( opt.desc ? ( this._c.gray( padding( opt.title.length ) + '(' + opt.desc + ')' ) ) : '' ), 
			} ) ),
		} ) 

		if ( this._p.isCancel( prompt ) ) throw new this.Error( this.ERROR_ID.CANCELLED )
		return prompt as Promise<Opts[number]["value"]>
	
	}

	async _validateContent( v: string ) {

		let content: string = v
		const stringType = this._string.getStringType( v ) 

		if ( stringType === 'path' ) {

			const exist = await this._sys.existsFile( v )
			if ( !exist ) throw new this.Error( `Path "${v}" doesn't exist.` )
			content = await this._sys.readFile( v, 'utf-8' )
	
		} else if ( stringType === 'url' ) {

			try {

				content = await this._string.getTextPlainFromURL( v )
		
			} catch ( e ) {

				throw new this.Error( `${this._setErrorMessage( e, 'Failed to fetch URL' )}` )
		
			}
	
		}

		const res = await this._string.replacePlaceholders( content, {
			url : async v => {

				let res
				try {

					res = await this._string.getTextPlainFromURL( v )
				
				} catch ( e ){

					this._p.log.warn( this._setErrorMessage( e ) )
				
				}
				if ( res && typeof res === 'string' ) return res
				return 'Not found or invalid URL.'
			
			},
			path : async v => {

				let res
				try {

					const exist = await this._sys.existsFile( v )
					if ( !exist ) throw new this.Error( `Path "${v}" doesn't exist.` )
					res = await this._sys.getPaths( v )
				
				} catch ( e ){

					this._p.log.warn( this._setErrorMessage( e ) )
				
				}
				if ( res && typeof res === 'string' ) return res
				return 'Not found or invalid path.'
                
			},
		} )

		return res
	
	}

}
