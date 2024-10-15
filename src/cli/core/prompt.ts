import { CoreSuper } from "./super"
import prompts from './prompt-default'

type ThemeTypes = Exclude<CoreSuper['_argv']['theme'], undefined>
export class CorePrompt extends CoreSuper {

	title = 'Prompt'
	defaults = prompts
	async setPrompt( value?: string, type: 'system' | 'user' = 'system', placeholder?: string ): Promise<string> {

		let res: string | undefined, 
			prompt: string | undefined
            
		const errorTitle = `[${type} prompt]`

		const validate = async ( v: string ) => {

			let content: string = v
			const stringType = this._string.getStringType( v ) 
			if ( stringType === 'path' ) {

				const exist = await this._sys.existsFile( v )
				if ( !exist ) throw new this.Error( `${errorTitle} Path "${v}" doesn't exist.` )
				content = await this._sys.readFile( v, 'utf-8' )
			
			} else if ( stringType === 'url' ) {

				try {

					content = await this._string.getTextPlainFromURL( v )
				
				} catch ( e ) {

					throw new this.Error( `${errorTitle} ${this._setErrorMessage( e, 'Failed to fetch URL' )}` )
				
				}
			
			}
	
			const contentPlaceholderPattern = new RegExp( `\\{\\{\\s*${this._const.PROMPT_VARS.CONTENT}\\s*\\}\\}` )
			if ( type === 'system' && !contentPlaceholderPattern.test( content ) ) {

				throw new this.Error( `${errorTitle} prompt returned from [${stringType}] must include "{{${this._const.PROMPT_VARS.CONTENT}}}".\n${this._c.gray( 'Content variable is where the code will be rendered.' )}` )
			
			}
    
			return content
		
		}

		try {

			if ( value ) res = await validate( value )
			else {

				prompt = await this._p.text( {
					message     : `${errorTitle} Enter path to file content or direct content:`,
					placeholder : placeholder ? placeholder : type === 'system' 
						? 'You are an expert code programmer with extensive knowledge of the content of this library: {{content}}' 
						: 'Tell me some kind of improvement that I could implement to my code',
					validate( v ) {
						
						if ( !v ) return 'Please provide valid path or content.'
                
					},
                    
				} ) as string

				if ( this._p.isCancel( prompt ) ) throw new this.Error( this.ERROR_ID.CANCELLED )

				res = await validate( prompt )
			
			}
			if ( !res ) throw new Error()
		
		} catch ( e ){

			if ( e instanceof this.Error ) {

				if ( e.message === this.ERROR_ID.CANCELLED ) throw new this.Error( this.ERROR_ID.CANCELLED )
				else this._errorRes( e.message, '' )
			
			}

			else this._errorRes( `${errorTitle} File or content not found or invalid. Value:`, value || 'not defined' )
			res = await this.setPrompt( undefined, type, res || prompt )
    
		} 

		return res
	
	}

	async #choiceUser( defaultValue?: string ){

		const argv = this._argv.prompt 

		const res = argv
			? ( this._successRes( `User prompt selected:`, argv ), await this.setPrompt( argv, 'user' ) )
			: defaultValue ? defaultValue : await this.setPrompt( undefined, 'user' )

		const response = await this._replacePlaceholders( res )

		return response
	
	}

	async #choiceSystem( content: string, defaultValue?: string ): Promise<string> {
		
		const argv = this._argv.system 
		const res = argv
			? ( this._successRes( `System prompt selected:`, argv ), await this.setPrompt( argv, 'system' ) )
			: defaultValue ? defaultValue : await this.setPrompt( undefined, 'system' )

		const response = await this._replacePlaceholders( res, content )
		
		return response
	
	}

	async #choiceTheme( ){

		const prompt = await this._p.select( {
			message : 'Select theme:',
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			options : Object.entries( this._const.theme ).map( ( [ k, v ] ) => ( {
				value : k,
				label : v, 
			} ) ),
		} ) as ThemeTypes
		if ( this._p.isCancel( prompt ) ) throw new this.Error( this.ERROR_ID.CANCELLED )
		return prompt
	
	}
	async getTheme(): Promise<ThemeTypes> {

		const theme = this._argv.theme 
		const res = theme
			? ( this._successRes( `Selected theme:`, theme ), theme )
			: ( await this.#choiceTheme() )
		return res as ThemeTypes
	
	}

	async get( content: string ) {

		this._setTitle()
		const theme = await this.getTheme()
		const system = await this.#choiceSystem( content, theme !== 'custom' ? this.defaults[theme].system : undefined )
		const user = await this.#choiceUser( theme !== 'custom' ? this.defaults[theme].user : undefined )
		// console.log( theme, user )
		const res = {
			theme,
			system,
			user,
		}
		this._setDebug( 'SET THEME: ' + res.theme + '\nSET SYSTEM PROMPT: ' + res.system + '\nSET USER PROMPT: ' + res.user )
		return res
	
	}

}
