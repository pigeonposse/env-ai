import { CoreSuper } from "./super"

export class CoreResponse extends CoreSuper {

	title = 'Output'
	description : string | undefined = 'Output configuration for save the generated content.'

	#chat : Awaited<ReturnType<CoreSuper['_ai']['chat']>> | undefined
    
	async getOverwrite( ) {

		const argv = this._argv.overwrite
		const {
			ask, ...values
		} = this._const.overwrite

		if ( argv && argv !== ask ) return argv
        
		const prompt = await this._p.select( {
			message : 'How do you want the output to be overwritten?',
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			options : Object.entries( values ).map( ( [ k, v ] ) => ( {
				value : k,
				label : v, 
			} ) ),
		} ) as typeof values[keyof typeof values]

		if ( this._p.isCancel( prompt ) ) throw new this.Error( this.ERROR_ID.CANCELLED )
		return prompt
	
	}
	async getSingle( ): Promise<boolean> {

		const argv = this._argv.single
		if ( !argv || argv !== true ) return false 
		this._successRes( `Response type:`, 'Single' )
		return argv
	
	}

	async #choiceOutput( placeholder?: string ) {

		const prompt = await this._p.text( {
			message : 'Enter output path:',
			placeholder,
			validate( value ) {

				if ( !value || value.trim() === '' ) return 'Please provide at least one file path.'
            
			}, 
		} )

		if ( this._p.isCancel( prompt ) ) throw new this.Error( this.ERROR_ID.CANCELLED )

		return prompt
	
	}

	async getOutput(): Promise<{
		// eslint-disable-next-line @stylistic/key-spacing
		path : string,
		overwrite : 'last' | 'always',
	} | undefined> {
		
		const set = async ( initValue?: string, placeholder?: string ) => {

			const value = initValue
				? ( this._successRes( `Output path:`, initValue ), initValue as string )
				: ( await this.#choiceOutput( placeholder ) )

			const res = this._sys.path.resolve( this._process.cwd(), value )

			return res
		
		}

		const argv = this._argv.output
		return argv ? ( {
			path      : await set( argv ), 
			overwrite : await this.getOverwrite(),
		} ) : undefined
	
	}
	line = '──────────────────────────────────────────────────────────'
	async #setChatResponse( prompt: string ) {

		const line = this.line
		const lastLine = ( ) =>( console.log( '\n\n\n' ), this._p.intro( line ) )
		const firstLine = () =>( this._p.log.info( 'Assistant:' ), this._p.outro( line ), console.log( '\n' ) )
		let output = ''

		if ( !this.#chat ) throw new this.Error( 'Chat not initialized' )
			
		const response = await this.#chat.send( prompt )
 
		if ( response[Symbol.asyncIterator] ) { // Si es un iterable asíncrono

			firstLine()
			this._process.onSIGNIT( () => {

				this._process.stdout.write( '\n' )
				lastLine( )

				// TODO Hacer q aborte pero solo la respuesta, que continue la linea de chat. asi es util para cancelar una respuesta
				this.cancel( 'Exit from assistant response' )
            
			} )

			for await ( const part of response ) {
				
				this._process.stdout.write( part.message.content )
				output += part.message.content
        
			}

			lastLine()
        
		} else {

			throw new this.Error( 'Response is not iterable' )
        
		}

		this.#chat.addAssistantMessage( output )

		return output
	
	}

	async generate( prompt: string, system: string, model: string ) {

		const spin = this._p.spinner()
		spin.start( 'starting...' )
		try {
			
			spin.message( 'Generating chat...' )
			// console.log( {
			// 	system,
			// 	model, 
			// } )
			this.#chat = await this._ai.chat( {
				system,
				model,
				
			} )
			spin.stop( 'Chat successfully generated! ✨' )
			this._p.log.message( '' )
			const res = this.#setChatResponse( prompt )
			return res
		
		} catch ( e ) {
		
			this._p.log.error( 'Error generating repsonse: ' + this._setErrorMessage( e ) )
			throw e
		
		}
	
	}
    
	async reply(){

		let res = ''
		try {

			const validate = async ( v: string ) => {

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

				return content
	
			}

			const prompt = await this._p.text( {
				message : `You:`,
				validate( v ) {
                
					if ( !v ) return 'Please provide valid path or content.'
        
				},
            
			} ) as string

			if ( this._p.isCancel( prompt ) ) throw new this.Error( this.ERROR_ID.CANCELLED )

			res = await validate( prompt )
			res = await this._replacePlaceholders( res )
			res = await this.#setChatResponse( res )
        
		} catch ( e ) {

			if ( e instanceof this.Error && e.message === this.ERROR_ID.CANCELLED ) 
				throw new this.Error( this.ERROR_ID.CANCELLED )
			this._errorRes( this.title, this._setErrorMessage( e ) )
			res = await this.reply()
		
		}

		return res
	
	}

	async write( outputPath: string, content: string, overrides: 'last' | 'always' ): Promise<void> {

		if ( overrides === 'last' ) {

			const exists = await this._sys.existsFile( outputPath )
			if ( exists ){

				const existingContent = await this._sys.readFile( outputPath, 'utf-8' )
				content = `${existingContent === '' ? '' : ( existingContent + '\n\n---\n\n' )}${content}`
			
			}
		
		}

		await this._sys.writeFile( outputPath, content )
		this._successRes( `Response generated in:`, outputPath )
	
	}

	async #recursiveReply( outputPath?: string, overrides?: 'last' | 'always' ): Promise<void> {

		const content = await this.reply()
		if ( outputPath ) await this.write( outputPath, content, overrides || 'last' )
		await this.#recursiveReply( outputPath, overrides )
	
	}

	async get( prompt: string, system: string, model: string ){

		this._setTitle()

		const output = await this.getOutput()
		const single = await this.getSingle()
		
		if ( !output && !single ) this._p.log.success( 'No output path provided' )

		this.title = 'Chat'
		this.description = undefined
		this._setTitle()

		const content = await this.generate( prompt, system, model )
		if ( output ) await this.write( output.path, content, output.overwrite )
		
		if ( !single ) await this.#recursiveReply( output?.path, output?.overwrite )
	
	}

}
