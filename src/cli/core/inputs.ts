import { CoreSuper } from "./super"

type Input = {
	urls : URL[]

	paths : string[]; 
}

export class CoreInputs extends CoreSuper {

	title = 'Input'
	description = 'Inputs to add context to your chat.'

	errorTitle = this._c.error( this.title )

	async getContent( inputs?: Input ): Promise<string> {

		// console.log( { inputs } )
		const setError = () => this._errorRes( this.errorTitle, 'Unexpected error! Missing required arguments. Please provide all required arguments.' )

		if ( !inputs ) {

			setError()
			inputs = await this.getInputs( undefined, undefined )
			return this.getContent( inputs )
		
		}
		try {

			const urlContent = !( !inputs.urls || !inputs.urls.length ) ? await this._getDataContent( inputs.urls, 'url' ) : undefined
			const fileContent = !( !inputs.paths || !inputs.paths.length ) ? await this._getDataContent( inputs.paths, 'path' ) : undefined

			if ( urlContent && fileContent ) return urlContent.sanitize( urlContent.content + fileContent.content )
			else if ( urlContent ) return urlContent.content
			else if ( fileContent ) return fileContent.content
			else return 'NO CONTEXT FOUND'
			// setError()
			// throw new this.Error( 'No content found.' )

		} catch {

			inputs = await this.getInputs( undefined, undefined )
			return this.getContent( inputs )
		
		}
	
	}

	#separateInputs ( inputs: string[] ): Input | undefined {

		const urls: Input['urls'] = []
		const paths: Input['paths'] = []
		// const text: string[] = []
      
		for ( const input of inputs ) {

			const type = this._string.getStringType( input )
			if ( type === 'url' ) urls.push( new URL( input ) )
			else paths.push( input )
			// else if ( type === 'text' ) text.push( input )
		
		}

		if ( !paths.length && !urls.length ) return undefined
        
		return {
			urls,
			paths, 
			// text,
		}
	
	}

	async #choiceIncludes( placeholder?: string ): Promise<string[]> {

		const prompt = await this._p.text( {
			message     : 'Enter input paths or urls to be processed (comma-separated):',
			placeholder : placeholder,
			validate( value ) {

				if ( !value ) return 'Please provide at least one file path or url.'
        
			},
		} )
		if ( this._p.isCancel( prompt ) ) throw new this.Error( this.ERROR_ID.CANCELLED )

		return prompt.split( ',' ).map( path => path.trim() )
	
	}

	async #choiceExcludes( placeholder?: string ): Promise<string[]> {

		const prompt = await this._p.text( {
			message     : 'Enter paths to exclude (comma-separated):',
			placeholder : placeholder,
			validate( value ) {

				if ( !value ) return 'Please provide at least one exclude path.'
        
			},
		} )
		if ( this._p.isCancel( prompt ) ) throw new this.Error( this.ERROR_ID.CANCELLED )

		return prompt.split( ',' ).map( path => path.trim() )
	
	}

	async getInputs( includesPaths?: string[], excludesPaths?: string[], includePlaceholder?: string, excludePlaceholder?: string ): Promise<Input> {

		const input = includesPaths
			? ( this._successRes( `Inputs selected:`, includesPaths.length ? includesPaths.join( ', ' ) : 'none' ), includesPaths )
			: ( await this.#choiceIncludes( includePlaceholder ) )
            
		const ignore = excludesPaths
			? ( this._successRes( 'Inputs (excluded paths):', excludesPaths.length ? excludesPaths.join( ', ' ) : 'none' ), excludesPaths )
			: ( await this.#choiceExcludes( excludePlaceholder ) )

		let i = this.#separateInputs( input )

		const errorMsg = () => this._errorRes( 'No files or urls were found matching the inclusion patterns in:', input.join( ', ' ) )
		if ( !i ) {

			i = {
				urls  : [],
				paths : [],
			}
			// errorMsg()
			// i = await this.getInputs( undefined, undefined, input.join( ', ' ), ignore.join( ', ' ) )
        
		}
		else {

			i.paths = await this._sys.getPaths( i.paths, {
				ignore,
				gitignore : true,
           
			} )
			if ( !i || ( !i.paths.length && !i.urls.length ) ) {

				errorMsg()
				i = await this.getInputs( undefined, undefined, input.join( ', ' ), ignore.join( ', ' ) )
            
			}
        
		}
        
		return i
    
	}

	async get(): Promise<string> {

		this._setTitle( ) 
		// const defaults = {
		// 	i : [ "**/*.{js,ts,jsx,tsx}" ],
		// 	e : [ "**/node_modules/**", "**/dist/**" ],
		// }
		const inputs = await this.getInputs( this._argv.include || [ ], this._argv.exclude || [ ] )
		const res = await this.getContent( inputs )
		this._setDebug( res )
	
		return res
	
	}

}
