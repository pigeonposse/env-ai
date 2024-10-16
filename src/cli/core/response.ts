import { OutputType } from "./output"
import { CoreSuper } from "./super"

type Chat = CoreSuper['_ai']['chatVectored']
type ChatReturnedData = Awaited<ReturnType<Chat>>
type ChatDocs = Parameters<Chat>[0]['docs']

type ChatParams = {
	system : string,

	model : string,
	
	docs : ChatDocs 

	output : OutputType
}

export class CoreResponse extends CoreSuper {

	title = 'Chat'

	#chat : ChatReturnedData | undefined

	#line = '──────────────────────────────────────────────────────────'
	
	async #setChatResponse( prompt: string ) {

		const line = this.#line
		const lastLine = ( ) =>( console.log( '\n\n\n' ), this._p.intro( line ) )
		const firstLine = () =>( this._p.log.info( 'Assistant:' ), this._p.outro( line ), console.log( '\n' ) )
		let output = ''

		if ( !this.#chat ) throw new this.Error( 'Chat not initialized' )
			
		const response = await this.#chat.send( prompt )
 
		if ( response && response[Symbol.asyncIterator] ) { // Si es un iterable asíncrono

			firstLine()
			this._process.onSIGNIT( () => {

				this._process.stdout.write( '\n' )
				lastLine( )

				// TODO Hacer q aborte pero solo la respuesta, que continue la linea de chat. asi es util para cancelar una respuesta
				this.cancel( 'Exit from assistant response' )
            
			} )

			for await ( const part of response ) {

				this._process.stdout.write( part.message.content.toString() )
				output += part.message.content
        
			}

			lastLine()
        
		} else {

			throw new this.Error( 'Chat unexpeted error' )
        
		}

		return output
	
	}

	async #generate( {
		system, model, docs,
	}: Omit<ChatParams, 'output'> ) {

		const spin = this._p.spinner()
		spin.start( 'starting...' )
		
		try {
			
			spin.message( 'Generating chat...' )

			this.#chat = await this._ai.chatVectored( {
				system,
				model,
				docs,
			} )

			spin.stop( 'Chat successfully generated! ✨' )
			this._p.log.message( this.#line )
		
		} catch ( e ) {
		
			this._p.log.error( 'Error generating repsonse: ' + this._setErrorMessage( e ) )
			throw e
		
		}
	
	}
    
	async #reply( args: {
		first? : boolean,

		prompt? : string 
	} | undefined = undefined ) {

		const first = args?.first
		let res = ''
		try {

			const prompt = args?.prompt && first
				? ( this._successRes( `You:`, args.prompt ), args.prompt ) 
				: await this._textPrompt( {
					message     : `You:`,
					placeholder : first ? 'Write your first prompt here' : 'Write your next prompt here',
				} )

			res = await this._validateContent( prompt )
			res = await this.#setChatResponse( res )
        
		} catch ( e ) {

			if ( e instanceof this.Error && e.message === this.ERROR_ID.CANCELLED ) 
				throw new this.Error( this.ERROR_ID.CANCELLED )
			this._errorRes( this.title, this._setErrorMessage( e ) )
			res = await this.#reply()
		
		}

		return res
	
	}

	async #write( outputPath: string, content: string, overrides: NonNullable<OutputType['overwrite']> ): Promise<void> {

		if ( overrides === 'last' ) {

			const exists = await this._sys.existsFile( outputPath )
			if ( exists ){

				const existingContent = await this._sys.readFile( outputPath, 'utf-8' )
				content = `${existingContent === '' ? '' : ( existingContent + '\n\n---\n\n' )}${content}`
			
			}
		
		}

		await this._sys.writeFile( outputPath, content )
		this._successRes( `Response saved in:`, outputPath )
	
	}

	async #recursiveReply( outputPath?: string, overrides?: OutputType['overwrite'] ): Promise<void> {

		const response = await this.#reply()
		if ( outputPath ) await this.#write( outputPath, response, overrides || 'last' )
		await this.#recursiveReply( outputPath, overrides )
	
	}

	async get( {
		system, model, docs, output,
	}: ChatParams ){
	
		this._setTitle()

		await this.#generate( {
			system,
			model, 
			docs,
		} )

		const prompt = this._argv.prompt

		const response = await this.#reply( {
			first : true,
			prompt, 
		} )

		if ( output.path && output.overwrite ) await this.#write( output.path, response, output.overwrite )
		
		if ( !output.single ) await this.#recursiveReply( output?.path, output?.overwrite )
	
	}

}
