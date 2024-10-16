import { CoreSuper } from "./super"

type Inputs = {
	urls : URL[]

	paths : string[]; 
}
type Docs = {
	content : string,
	
	path : string 
}[]

export class CoreInputs extends CoreSuper {

	title = 'Input'
	description = 'Inputs to add context to your chat.'

	errorTitle = this._c.error( this.title )

	protected async _getDataContent<T extends 'url' | 'path' = 'path'>( inputs: T extends 'url' ? URL[] : string[], type?: T ) {

		type = type ?? 'path' as T
        
		const load = this._p.spinner()

		const sanitize = ( content: string ) => this._string.sanitizeContent( content )

		load.start( 'Preparing inputs...' )
		let res: Docs = []
		if ( type === 'url' ){

			load.message( 'Reading and sanitizing url...' )

			const urlContents: Record<string, string> = {}
        
			for ( const input of inputs ) {

				try {

					load.message( 'Reading ' + input )
					const content = await this._string.getTextPlainFromURL( input.toString() )
					urlContents[input.toString()] = sanitize( content )
			
				} catch ( e ){

					load.stop( 'Error reading url: ' + this._c.gray( input.toString() ), 1 )
					throw e
			
				}
		
			}

			load.message( 'Getting source for all urls...' )

			res = [
				...res,
				...Object.entries( urlContents )
					.map( ( [ id, content ] ) => ( {
						content : content,
						path    : id, 
					} ) ),
			]
			
			load.stop( 'Source urls obtained!' )
		
		}

		if ( type === 'path' ) {

			load.message( 'Reading and sanitizing files...' )
    
			const fileContents: Record<string, string> = {}
    
			for ( const file of inputs ) {

				load.message( 'Reading ' + file )
				const content = await this._sys.readFile( file, 'utf-8' )
				fileContents[file.toString()] = sanitize( content )
        
			}
    
			load.message( 'Getting source for all files...' )

			res = [
				...res,
				...Object.entries( fileContents )
					.map( ( [ id, content ] ) => ( {
						content : content,
						path    : id, 
					} ) ),
			]
			load.stop( 'Source files obtained!' )
		
		}

		return res
	
	}

	async getContent( inputs?: Inputs ): Promise<Docs> {

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

			if ( urlContent && fileContent ) return [ ...urlContent, ...fileContent ]
			else if ( urlContent ) return urlContent
			else if ( fileContent ) return fileContent
			else return []
			// setError()
			// throw new this.Error( 'No content found.' )

		} catch {

			inputs = await this.getInputs( undefined, undefined )
			return this.getContent( inputs )
		
		}
	
	}

	#separateInputs ( inputs: string[] ): Inputs | undefined {

		const urls: Inputs['urls'] = []
		const paths: Inputs['paths'] = []
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

	async getInputs( includesPaths?: string[], excludesPaths?: string[], includePlaceholder?: string, excludePlaceholder?: string ): Promise<Inputs> {

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

	async get(): Promise<Docs> {

		this._setTitle( ) 
		// const defaults = {
		// 	i : [ "**/*.{js,ts,jsx,tsx}" ],
		// 	e : [ "**/node_modules/**", "**/dist/**" ],
		// }
		const inputs = await this.getInputs( this._argv.include || [ ], this._argv.exclude || [ ] )
		const res = await this.getContent( inputs )
		this._setDebug( JSON.stringify( res, null, 2 ) )
	
		return res
	
	}

}
