import { CoreSuper } from "./super"

export class CoreModel extends CoreSuper {

	title = 'Model'

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
				if ( e.message === this._ai.error.NO_MODELS ) throw new this.Error( 'No Ollama models found.\n   Please download at least one model.' + ollamaInfo )
				else throw new this.Error( 'Ollama is not installed or is not running.\n   Please install/start Ollama to use this tool.' + ollamaInfo )
			
			}
		
		}
		const models = await getModels()
      
		if ( modelArgv && models.includes( modelArgv ) ) {

			log.success( `Selected model: ${gray( modelArgv )}` )
			return modelArgv 
		
		}
		else if ( modelArgv && !models.includes( modelArgv ) ) log.warn( `Model [${modelArgv}] not exists or is not installed.` )
		
		const model = await select( {
			message : 'Select an Ollama model to use for suggestions:',
			options : models.map( modelName => ( {
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
