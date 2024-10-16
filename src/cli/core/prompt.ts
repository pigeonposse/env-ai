import { CoreSuper } from "./super"
import prompts from './prompt-default'

type ThemeTypes = Exclude<CoreSuper['_argv']['theme'], undefined>
export class CorePrompt extends CoreSuper {

	title = 'Prompt'
	description = 'The prompt configuration for your chat.'
	defaults = prompts

	async setPrompt( value?: string, placeholder?: string ): Promise<string> {

		let res: string | undefined, 
			prompt: string | undefined

		try {

			if ( value ) res = await this._validateContent( value )
			else {

				const desc = this._c.italic( '(Enter text path or url)' )
				prompt = await this._textPrompt( {
					message     : `System prompt ${desc}:`,
					placeholder : placeholder 
						? placeholder : 'You are an expert code programmer with extensive knowledge of the content of this library',
                    
				} ) as string

				res = await this._validateContent( prompt )
			
			}

			if ( !res ) throw new Error()
		
		} catch ( e ){

			if ( e instanceof this.Error ) {

				if ( e.message === this.ERROR_ID.CANCELLED ) throw new this.Error( this.ERROR_ID.CANCELLED )
				else this._errorRes( e.message, '' )
			
			}

			else this._errorRes( `File or content not found or invalid. Value:`, value || 'not defined' )
			res = await this.setPrompt( undefined, res || prompt )
    
		} 

		return res
	
	}

	async #choiceSystem( defaultValue?: string ): Promise<string> {
		
		const argv = this._argv.system 
		const res = argv
			? ( this._successRes( `System prompt selected:`, argv ), await this.setPrompt( argv ) )
			: defaultValue ? defaultValue : await this.setPrompt( undefined )

		return res
	
	}

	async #choiceTheme( ){

		const prompt = await this._selectPrompt( {
			message : 'Select theme:',
			opts    : Object.entries( this._const.theme ).map( ( [ k, v ] ) => ( {
				value : v,
				title : v, 
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				desc  : this._const.themeDesc[k] || undefined,
			} ) ),
		} ) 
		return prompt
	
	}

	async getTheme(): Promise<ThemeTypes> {

		const theme = this._argv.theme 
		const res = theme
			? ( this._successRes( `Selected theme:`, theme ), theme )
			: ( await this.#choiceTheme() )
		return res as ThemeTypes
	
	}

	async get( ) {

		this._setTitle()
		const theme = await this.getTheme()
		const system = await this.#choiceSystem( theme !== 'custom' ? this.defaults[theme].system : undefined )
		const res = {
			theme,
			system,
		}
		this._setDebug( 'SET THEME: ' + res.theme + '\nSET SYSTEM PROMPT: ' + res.system )
		return res
	
	}

}
