import prompts       from './prompt-default'
import { CoreSuper } from './super'

type ThemeTypes = Exclude<CoreSuper['_argv']['theme'], undefined>
export class CorePrompt extends CoreSuper {

	title = 'Prompt'
	description = 'The prompt configuration for your chat.'
	defaults = prompts

	async #getSystem( defaultValue?: string ): Promise<string> {

		const message = `System prompt ${this._c.italic( '(Enter text path or url)' )}:`

		const setPrompt = async ( value?: string, placeholder?: string ): Promise<string> => {

			let res: string | undefined,
				prompt: string | undefined

			try {

				if ( value ) res = await this._validateContent( value )
				else {

					prompt = await this._textPrompt( {
						message,
						placeholder : placeholder
							? placeholder
							: 'You are an expert code programmer with extensive knowledge of the content of this library',

					} ) as string

					res = await this._validateContent( prompt )

				}

				if ( !res ) throw new Error()

			}
			catch ( e ) {

				if ( e instanceof this.Error && e.message === this.ERROR_ID.CANCELLED )
					throw new this.Error( this.ERROR_ID.CANCELLED )

				else this._errorRes( `System prompt error:`, this._setErrorMessage( e ) )
				res = await setPrompt( undefined, res || prompt )

			}

			return res

		}

		const argv = this._argv.system
		const res  = argv
			? ( this._successRes( message, argv ), await setPrompt( argv ) )
			: defaultValue
				? defaultValue
				: await setPrompt( undefined )

		return res

	}

	async getTheme(): Promise<ThemeTypes> {

		const theme   = this._argv.theme
		const message = `Select theme:`
		const res     = theme
			? ( this._successRes( message, theme ), theme )
			: ( await this._selectPrompt( {
				message : message,
				opts    : Object.entries( this._const.theme ).map( ( [ k, v ] ) => ( {
					value : v,
					title : v,

					// @ts-ignore
					desc : this._const.themeDesc[k] || undefined,
				} ) ),
			} ) )
		return res

	}

	async get( ) {

		this._setTitle()
		const theme  = await this.getTheme()
		const system = await this.#getSystem( theme !== 'custom' ? this.defaults[theme].system : undefined )
		const res    = {
			theme  : theme,
			system : system,
		}
		this._setDebug( JSON.stringify( res, null, 2 ) )
		return res

	}

}
