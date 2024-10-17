import { CoreSuper } from "./super"

export class CoreModel extends CoreSuper {

	title = 'Model'
	description = 'LLM model to use for your chat.'

	async installModel( modelName: string ) {

		const spin = this._p.spinner( )
		const msg = ( v:string ) => `[${modelName}] Installation: ` + v
		try {
			
			spin.start( msg( 'Initializing...' ) )
			const response = await this._ai.installModel( modelName )
			if ( response[Symbol.asyncIterator] ) { 

				this._process.onSIGNIT( () => {

					this._process.stdout.write( '\n' )
					this.cancel( 'Exit from installation' )
			
				} )

				for await ( const part of response ) {

					spin.message( msg( part.status ) )
				
				}

				spin.stop( msg( 'Model installed successfully! ✨' ) )
			
			} else {
				
				throw new this.Error( 'Response is not iterable' )
		
			}
		
		} catch ( e ) {

			spin.stop( msg( 'Error installing model' ), 1 )
			// this._errorRes( `Error installing model ${embedModelName}`, this._setErrorMessage( e ) )
			throw new Error( `Error installing [${modelName}] model: ${this._setErrorMessage( e )}` )
	
		}
	
	}

	async get (): Promise<string> {

		const modelArgv = this._argv.model as string | undefined
		const { gray } = this._c

		this._setTitle( ) 
		
		const getModels = async () => {

			const [ error, output ] = await this._catchError( this._ai.getModels() )

			if ( error ) {

				const ollamaInfo = `\n\n   For more information about Ollama please visit ${this._c.gray( 'https://ollama.com/' )}` 
				this._errorRes( 'Error retrieving model from Ollama.', '' )
				if ( error instanceof Error && error.message === this._ai.error.NO_MODELS ) throw new this.Error( 'No Ollama models found.\n   Please download at least one model.' + ollamaInfo )
				else throw new this.Error( 'Ollama is not installed or is not running.\n   Please install/start Ollama to use this tool.' + ollamaInfo )
			
			} else 
				return output
		
		}

		const promptTile = 'Select a LLM model:'
		const models = await getModels()

		if ( modelArgv && models.includes( modelArgv ) ) {

			this._p.log.success( `${promptTile}\n${gray( modelArgv )}` )
			return modelArgv 
		
		}
		else if ( modelArgv && !models.includes( modelArgv ) ) this._p.log.error( `Model [${modelArgv}] not exists or is not installed.` )
		
		const embedModelName = 'nomic-embed-text'
		
		if ( !models.some( m => m.startsWith( embedModelName ) ) ){

			this._p.log.warn( `Model [${embedModelName}] must be installed for create embeddings` )
			const nomic = await this._confirmPrompt( { message: `Do you want to install [${embedModelName}] model now?` } )

			if ( nomic === false ) throw new this.Error( `Model [${embedModelName}] must be installed.\n   Read more about it at https://ollama.com/library/nomic-embed-text` )
			else await this.installModel( embedModelName )
			const checkModelsAgain = await getModels()
			if ( !checkModelsAgain.some( model => model.startsWith( embedModelName ) ) ) 
				throw new this.Error( `Model [${embedModelName}] failed to install unexpectedly` )
		
		}

		const model = await this._selectPrompt( {
			message : promptTile,
			opts    : models.filter( model => !model.startsWith( embedModelName ) ).map( modelName => ( {
				value : modelName,
				title : modelName, 
			} ) ),
				
		} ) 
	
		const res = model 
		this._setDebug( res )

		return res
	
	}

}
