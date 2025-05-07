
import { CoreSuper } from './super'

export type OutputType = {
	path? : string

	overwrite? : 'always' | 'last'

	single : boolean
}

export class CoreOutput extends CoreSuper {

	title = 'Output'
	description = 'Output configuration for save the generated content.'

	async getOverwrite( ) {

		const argv = this._argv.overwrite
		const {
			ask, ...values
		} = this._const.overwrite

		const title = 'Select overwrite type:'

		if ( argv && argv !== ask ) {

			if ( argv === 'always' || argv === 'last' ) {

				this._successRes( title, argv )
				return argv

			}
			else this._errorRes( 'Invalid overwrite type: ', argv )

		}

		const prompt = await this._selectPrompt( {
			message : title,
			opts    : Object.values( values ).map( v => ( {
				value : v,
				title : v,
			} ) ),
		} ) as OutputType['overwrite']

		return prompt

	}

	async getSingle( ): Promise<boolean> {

		const argv = this._argv.single
		if ( !argv || argv !== true ) return false
		this._successRes( `Response type:`, 'Single' )
		return argv

	}

	async getPath() {

		const set = async ( initValue?: string, placeholder?: string ) => {

			const value = initValue
				? ( this._successRes( `Output path:`, initValue ), initValue as string )
				: ( await this._textPrompt( {
					message : 'Enter output path:',
					placeholder,
				} ) )

			const res = this._setProcessPath( value )

			return res

		}

		const argv = this._argv.output
		return argv ? await set( argv ) : undefined

	}

	async get(): Promise<OutputType> {

		this._setTitle()
		const path      = await this.getPath()
		const single    = await this.getSingle()
		const overwrite = path ? await this.getOverwrite() : undefined

		const res = {
			path,
			overwrite,
			single,
		}

		if ( !path && !single ) this._p.log.success( 'No output path provided' )

		this._setDebug( JSON.stringify( res, null, 2 ) )

		return res

	}

}
