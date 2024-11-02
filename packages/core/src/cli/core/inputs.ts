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
	description = 'Inputs to add context to your chat. This in not required.'
	errorTitle = this._c.error( this.title )

	protected async _getDataContent<T extends 'url' | 'path' = 'path'>( inputs: T extends 'url' ? URL[] : string[], type?: T ) {

		type = type ?? 'path' as T
        
		const load = this._p.spinner()

		load.start( 'Preparing inputs...' )
		let res: Docs = []

		if ( type === 'url' ){

			load.message( 'Reading and sanitizing url...' )

			const urlContents: Record<string, string> = {}
        
			for ( const input of inputs ) {

				const [ error, data ] = await this._catchError( ( async () => {

					load.message( 'Reading ' + input )
					const content = await this._string.getTextPlainFromURL( input.toString() )
					return this._string.sanitizeContent( content )
				
				} )() )

				if ( error ){

					load.stop( 'Error reading url: ' + this._c.gray( input.toString() ), 1 )
					throw error
				
				} else 
					urlContents[input.toString()] = data
		
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
				// console.log( {
				// 	content,
				// 	file, 
				// 	sn : this._string.sanitizeContent( content ),
				// } )
				fileContents[file.toString()] = this._string.sanitizeContent( content )
			
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

		const setError = () => this._errorRes( this.errorTitle, 'Unexpected error! Missing required arguments. Please provide all required arguments.' )

		if ( !inputs ) {

			setError()
			inputs = await this.getInputs( undefined, undefined )
			return await this.getContent( inputs )
		
		}
		
		try {

			const urlContent = !( !inputs.urls || !inputs.urls.length ) ? await this._getDataContent( inputs.urls, 'url' ) : undefined
			const fileContent = !( !inputs.paths || !inputs.paths.length ) ? await this._getDataContent( inputs.paths, 'path' ) : undefined
			// console.log( {
			// 	urlContent,
			// 	fileContent, 
			// } )
			if ( urlContent && fileContent ) return [ ...urlContent, ...fileContent ]
			else if ( urlContent ) return urlContent
			else if ( fileContent ) return fileContent
			else return []

		} catch {

			inputs = await this.getInputs( undefined, undefined )
			return await this.getContent( inputs )
		
		}
	
	}

	#separateInputs ( inputs: string[] ): Inputs | undefined {

		const urls: Inputs['urls'] = []
		const paths: Inputs['paths'] = []
      
		for ( const input of inputs ) {

			const type = this._string.getStringType( input )
			if ( type === 'url' ) urls.push( new URL( input ) )
			else paths.push( input )
		
		}

		if ( !paths.length && !urls.length ) return undefined
        
		return {
			urls,
			paths, 
			// text,
		}
	
	}

	async #choiceIncludes( placeholder?: string ): Promise<string[]> {

		const prompt = await this._textPrompt( {
			message     : 'Enter path patterns or URLs to be processed (comma-separated):',
			placeholder : placeholder,
		} )

		return prompt.split( ',' ).map( path => path.trim() )
	
	}

	async getInputs( includesPaths?: string[], includePlaceholder?: string ): Promise<Inputs> {

		const input = includesPaths
			? ( this._successRes( `Inputs selected:`, includesPaths.length ? includesPaths.join( ', ' ) : 'none' ), includesPaths )
			: ( await this.#choiceIncludes( includePlaceholder ) )
		
		let i = this.#separateInputs( input )

		const errorMsg = () => this._errorRes( 'No files or urls were found matching the inclusion patterns in:', input.join( ', ' ) )
		if ( !i ) {

			i = {
				urls  : [],
				paths : [],
			}
        
		}
		else {

			i.paths = await this._sys.getPaths( i.paths )
			if ( !i || ( !i.paths.length && !i.urls.length ) ) {

				errorMsg()
				i = await this.getInputs( undefined, input.join( ', ' ) )
            
			}
        
		}
        
		return i
    
	}

	async get(): Promise<Docs> {

		this._setTitle( ) 
		const inputs = await this.getInputs( this._argv.input || [ ] )
	
		const res = await this.getContent( inputs )
	
		this._setDebug( JSON.stringify( res, null, 2 ) )
	
		return res
	
	}

}
