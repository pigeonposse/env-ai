import {
	argv, cwd, stdout,
} from "node:process"
import process from "node:process"

const onSIGNIT = ( listener: NodeJS.SignalsListener ) => process.on( 'SIGINT', listener )
export const exit = ( code?: number | string | null | undefined ) => process.exit( code )

export const rmDeprecationAlerts = () => {

	// This is not recomended but is for not display `(node:31972) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.` message.
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	process.noDeprecation = true

}

export {
	argv,
	onSIGNIT,
	cwd,
	stdout,
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FnDefault = () => Promise<any>
type OnWriteParams<FN extends FnDefault> = {
	fn : FN
	
	// eslint-disable-next-line no-unused-vars
	on( value:string ): Promise<string | undefined>
}
export const onOutputWrite = async <FN extends FnDefault>( {
	fn, on, 
}: OnWriteParams<FN> ): Promise<ReturnType<FN>> => {

	const originalWrite = stdout.write
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	stdout.write = async ( chunk, ...args ) => {

		const value = chunk.toString()
		const validated = await on( value )
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if ( validated ) originalWrite.call( stdout, chunk, ...args )
	
	}

	try {

		// Llamamos a la función original
		return await fn()

	} finally {

		// Restauramos process.stdout.write a su comportamiento original
		stdout.write = originalWrite
	
	}

}
