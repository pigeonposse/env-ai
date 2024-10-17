
export const catchError = async <T>( promise: Promise<T> ): Promise<[undefined, T] | [Error]> => {

	return promise
		.then( value => ( [ undefined, value ] as unknown as [undefined, T] ) )
		.catch( error => ( [ error ] ) )

}

export class TypedError<M extends string = string, D = undefined> extends Error {

	data : D | undefined
    
	constructor( message: M, data?: D ) {

		super( message ) 
		this.data = data
		Error.captureStackTrace( this, this.constructor ) // Captura el stack trace
    
	}

}
