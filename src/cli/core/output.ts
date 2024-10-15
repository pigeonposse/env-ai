
import { CoreSuper } from "./super"

export class CoreOutput extends CoreSuper {

	title = 'Output'
	description = 'Output configuration for save the generated content.'

	async #choiceOverwrite( ) {

		const {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			ask, ...values
		} = this._const.overwrite
		const prompt = await this._p.select( {
			message : 'Select overwrite type:',
			options : Object.entries( values ).map( ( [ k, v ] ) => ( {
				value : k,
				label : v, 
			} ) ),
		} ) as string
		if ( this._p.isCancel( prompt ) ) throw new this.Error( this.ERROR_ID.CANCELLED )
		return prompt
	
	}
    
	async getOverwrite( ) {

		const argv = this._argv.overwrite
		const { ask } = this._const.overwrite

		if ( argv !== ask ) return argv
		return await this.#choiceOverwrite()
	
	}

	async #choiceOutput( placeholder?: string ){

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

	async get(): Promise<string | undefined> {
		
		const set = async ( initValue?: string, placeholder?: string ) => {

			this._setTitle()
			//let res: string
			const value = initValue
				? ( this._successRes( `Output path:`, initValue ), initValue as string )
				: ( await this.#choiceOutput( placeholder ) )

			const res = this._sys.path.resolve( this._process.cwd(), value )

			// const exist = await this._sys.existsFile( res )

			// if ( exist ) {

			// 	this._errorRes( 'File already exists.', res )
			// 	res = await set( initValue, res )
			
			// }

			return res
		
		}

		const argv = this._argv.output
		const res = argv ? await set( argv ) : undefined

		this._setDebug( res || 'undefined' )

		return res
	
	}

}
