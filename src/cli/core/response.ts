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
		
		this._setDebug( prompt )

		const line = this.#line
		const chatName = 'Assistant'
		const title = chatName + ':'
		const lastLine = ( ) =>( console.log( '\n\n\n' ), this._p.intro( line ) )
		const firstLine = () =>( this._p.outro( line ), console.log( '\n' ) )
		const spin = this._p.spinnerCustom()
		let output = '',
			exitResponse = false

		if ( !this.#chat ) throw new this.Error( 'Chat not initialized' )
		spin.start( title + ' Thinking...' )	
		const response = await this.#chat.send( prompt )
		
		spin.message( title + ' Thinking...' )	

		if ( response && response[Symbol.asyncIterator] ) { 

			spin.stop( title )	
			firstLine()
			
			this._process.onSIGNIT( async () => ( exitResponse = true ) )

			for await ( const part of response ) {

				if ( exitResponse ){
 
					this._process.stdout.write( '\n' )
					lastLine( )
					throw new this.Error( this.ERROR_ID.RESPONSE_CANCELLED )
				
				}
				else {

					this._process.stdout.write( part.message.content.toString() )
					output += part.message.content
				
				}
			
			}

			lastLine()
        
		} else {

			spin.stop( title + 'There has been an error in the chat process' )	
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

			const spinMsg = 'Generating chat'
			spin.message( spinMsg )

			const capturedMessages: string[] = []

			this.#chat = await this._process.onOutputWrite( {
				fn : async ( ) => await this._ai.chatVectored( {
					system,
					model,
					docs,
				} ),
				on : async value => {

					if ( !value.includes( spinMsg ) && !value.includes( '\x1B[999D' ) && !value.includes( '\x1B[J' ) ) 
						capturedMessages.push( value )
					else return value
				
				},
			} )

			spin.stop( 'Chat successfully generated! ✨' )
	
			if ( capturedMessages.length ) this._p.note( capturedMessages.join( '\n' ), 'Notifications' )
			else this._p.log.message( this.#line )
		
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
			else if ( e instanceof this.Error && e.message === this.ERROR_ID.RESPONSE_CANCELLED )
				await this.#reply()
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
