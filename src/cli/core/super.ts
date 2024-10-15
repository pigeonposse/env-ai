import { CoreParams } from '../types'

import Ai from '../../_shared/ai'
import Sys from '../../_shared/sys'
import * as string from '../../_shared/string'
import * as process from '../../_shared/process'
import * as consts from '../const'
import { argvSchema } from '../schema'

class CoreError extends Error {

	constructor( message: string ) {

		super( message ) // Llama al constructor de la clase padre (Error)
		this.name = this.constructor.name // Establece el nombre de la clase como el nombre del error
		Error.captureStackTrace( this, this.constructor ) // Captura el stack trace
	
	}

}

export class CoreSuper {

	protected _c : CoreParams['c']

	protected _p : CoreParams['p']

	protected _argv : CoreParams['argv']

	protected _sys = new Sys()
	protected _ai = new Ai()
	protected _string = string
	protected _const = consts
	protected _process = process
	
	Error = CoreError 

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

		this._p.log.debug( this._c.section( this.title ), msg )
	
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

	protected async _getDataContent<T extends 'url' | 'path' = 'path'>( inputs: T extends 'url' ? URL[] : string[], type?: T ) {

		type = type ?? 'path' as T
        
		const load = this._p.spinner()
		const pageSeparator = '---\n\n'
		const sanitize = ( content: string ) => this._string.sanitizeContent( content )

		load.start( 'Preparing inputs...' )
		let res = ''
		if ( type === 'url' ){

			load.message( 'Reading and sanitizing url...' )

			const urlContents: Record<string, string> = {}
        
			for ( const input of inputs ) {

				try {

					load.message( 'Reading ' + input )
					const content = await this._string.getTextPlainFromURL( input.toString() )
					urlContents[input.toString()] = sanitize( content )
			
				} catch ( e ){

					load.stop( 'Error reading url: ' + this._c.gray( input.toString() ), 1 )
					throw e
			
				}
		
			}

			load.message( 'Getting source for all urls...' )

			res = Object.entries( urlContents )
				.map( ( [ id, content ] ) => `${pageSeparator}URL: ${id}\n\n${pageSeparator}\n${content}\n\n` )
				.join()
			load.stop( 'Source urls obtained!' )
		
		}

		if ( type === 'path' ) {

			load.message( 'Reading and sanitizing files...' )
    
			const fileContents: Record<string, string> = {}
    
			for ( const file of inputs ) {

				load.message( 'Reading ' + file )
				const content = await this._sys.readFile( file, 'utf-8' )
				fileContents[file.toString()] = sanitize( content )
        
			}
    
			load.message( 'Getting source for all files...' )

			res = Object.entries( fileContents )
				.map( ( [ id, content ] ) => `${pageSeparator}FILE: ${id}\n\n${pageSeparator}\n${content}\n\n` )
				.join( )

			load.stop( 'Source files obtained!' )
		
		}

		return {
			content   : res,
			sanitize  : sanitize,
			separator : pageSeparator,
		}
	
	}

	protected async _replacePlaceholders( value: string, content?: string ) {

		const res = await this._string.replacePlaceholders( value, {
			content : content ?? '',
			url     : async v => {

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

		// console.log( { res } )

		return res
	
	}

}
