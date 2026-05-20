import {
	exec,
	joinPath,
	readFile,
	writeFile,
} from '@dovenv/core/utils'

/**
 * Run the build
 *
 * @param   {object}        [opts]           - Options
 * @param   {string}        [opts.cwd]       - The current working directory
 * @param   {string}        [opts.outputDir] - The output directory
 * @returns {Promise<void>}
 */
const run = async opts => {

	const {
		cwd = '.',
		outputDir = 'dist',
	} = opts || {}

	const inputPath  = joinPath( cwd, 'src/index.ts' )
	const outputPath = joinPath( cwd, outputDir )

	const nccCommand = [
		'pnpm dlx @vercel/ncc build',
		inputPath,
		'-o',
		outputPath,
		'-C',
		'--transpile-only',
	].join( ' ' )

	const tsupCommand = [
		'tsup',
		inputPath,
		'--dts-only',
		'--out-dir',
		outputPath,
		'--format',
		'esm',
	].join( ' ' )

	// console.log( {
	// 	nccCommand,
	// 	tsupCommand,
	// } )

	await exec( nccCommand )
	await exec( tsupCommand )

	const targetFile = joinPath( outputPath, 'index.js' )

	try {

		let content = await readFile( targetFile, 'utf8' )

		content = content.replace( 'from "module";', 'from "node:module";' )

		const polyfills = [
			'if (typeof global === "undefined") { globalThis.global = globalThis; }',
			'if (typeof globalThis.setImmediate === "undefined") {',
			'    globalThis.setImmediate = (fn, ...args) => {',
			'        queueMicrotask(() => fn(...args));',
			'        return 0;',
			'    };',
			'    globalThis.clearImmediate = () => {};',
			'}',
		].join( '\n' ) + '\n'
		content         = polyfills + content

		await writeFile( targetFile, content, 'utf8' )
		console.log( '✅ Prefijo node:module restaurado para Deno.' )

	}
	catch ( err ) {

		console.error( 'Error al parchear el build de ncc:', err )

	}

}

run()
