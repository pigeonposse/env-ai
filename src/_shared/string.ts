import sanitizeHtml from 'sanitize-html'
import { isPath } from './sys'

// eslint-disable-next-line no-unused-vars
type CustomParams = Record<string, ( ( arg: string ) => Promise<string> ) | string>

export async function replacePlaceholders(
	content: string,
	params: CustomParams,
) {

	// Regular expression to capture {{ key }} | {{ key('argument') }} | {{ key("argument") }}
	const regex = /{{\s*(\w+)\s*(?:\(\s*['"]([^'"]+)['"]\s*\))?\s*}}/g

	// Store the matches to resolve later
	const matches: {
		placeholder : string,

		key : string,

		arg? : string 
	}[] = []
	let match

	// First pass: Collect all matches
	while ( ( match = regex.exec( content ) ) !== null ) {

		const [
			placeholder,
			key,
			arg, 
		] = match
		matches.push( {
			placeholder,
			key,
			arg, 
		} )
	
	}

	// Replace placeholders with their values
	for ( const {
		placeholder, key, arg, 
	} of matches ) {

		const value = params[key]

		// Determine replacement value
		let replacement = ''
		if ( typeof value === 'function' ) {

			replacement = await value( arg || '' )
		
		} else if ( value !== undefined ) {

			replacement = value
		
		} else {

			// Keep the original placeholder if no replacement is possible
			replacement = placeholder
		
		}

		// Replace in the content
		content = content.replace( placeholder, replacement )
	
	}

	return content

}

export const setErrorString = ( error: Error ) =>{

	const v = {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		code    : error?.code,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		name    : error?.name,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		message : error?.message,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		stack   : error?.stack ? error.stack.split( '\n' ) : [],
		...( error instanceof Object ? error : {} ),
	}

	if ( Array.isArray( v.stack ) && v.stack.length > 0 ) return v.stack.map( line => `   ${line}` ).join( '\n' )
	return JSON.stringify( v, null, '\t' ) 

}

export const sanitizeContent = ( content: string ): string => {

	return sanitizeHtml( content, {
		allowedTags       : [],
		allowedAttributes : {},

		textFilter : function( text ) {

			return text.replace( /&nbsp;/g, ' ' )
        
		},
	} )

}
export const getTextPlainFromURL = async ( url: string ): Promise<string> => {

	try {

		const response = await fetch( url )
    
		if ( !response.ok ) throw new Error( `HTTP error! Status: ${response.status}` )
    
		const data = await response.text()
		return data
    
	} catch ( error ) {

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		throw new Error( `Failed to fetch URL: ${error?.message || 'Unexpected error'}` )
	
	}

}

export const getStringType = ( value: string ): 'text' | 'url' | 'path' => {

	if ( isUrl( value ) ) return 'url'
	if ( isPath( value ) ) return 'path'
	return 'text'

}
const isUrl = ( value: string ): boolean => {

	try {

		new URL( value ) 
		return true
	
	} catch {

		return false 
	
	}

}

