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
		const {
			select, log, 
		} = this._p
		this._setTitle( ) 
		
		const getModels = async () => {

			try {

				const output = await this._ai.getModels()
				return output
			
			} catch ( e ) {

				const ollamaInfo = `\n\n   For more information about Ollama please visit ${this._c.gray( 'https://ollama.com/' )}` 
				this._errorRes( 'Error retrieving model from Ollama.', '' )
				if ( e instanceof Error && e.message === this._ai.error.NO_MODELS ) throw new this.Error( 'No Ollama models found.\n   Please download at least one model.' + ollamaInfo )
				else throw new this.Error( 'Ollama is not installed or is not running.\n   Please install/start Ollama to use this tool.' + ollamaInfo )
			
			}
		
		}
		const models = await getModels()

		if ( modelArgv && models.includes( modelArgv ) ) {

			log.success( `Selected model: ${gray( modelArgv )}` )
			return modelArgv 
		
		}
		else if ( modelArgv && !models.includes( modelArgv ) ) log.warn( `Model [${modelArgv}] not exists or is not installed.` )
		
		const embedModelName = 'nomic-embed-text'
		
		if ( !models.some( m => m.startsWith( embedModelName ) ) ){

			log.warn( `Model [${embedModelName}] must be installed for create embeddings` )
			const nomic = await this._p.confirm( { message: `Do you want to install [${embedModelName}] model now?` } )

			if ( this._p.isCancel( nomic ) ) throw new this.Error( this.ERROR_ID.CANCELLED )
			if ( nomic === false ) throw new this.Error( `Model [${embedModelName}] must be installed.\n   Read more about it at https://ollama.com/library/nomic-embed-text` )
			else await this.installModel( embedModelName )
			const checkModelsAgain = await getModels()
			if ( !checkModelsAgain.some( model => model.startsWith( embedModelName ) ) ) 
				throw new this.Error( `Model [${embedModelName}] failed to install unexpectedly` )
		
		}

		const model = await select( {
			message : 'Select a model to use:',
			options : models.filter( model => !model.startsWith( embedModelName ) ).map( modelName => ( {
				value : modelName,
				label : modelName, 
			} ) ),
				
		} ) as string
		
		if ( this._p.isCancel( model ) ) throw new this.Error( this.ERROR_ID.CANCELLED )
	
		const res = model 
		this._setDebug( res )

		return res
	
	}

}
