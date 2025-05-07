import { createInterface } from 'readline'

import AiVectored from './ai-vector'
import Sys        from './sys'

const sys = new Sys()
const ai  = new AiVectored( {
	model  : 'llama3.2:latest',
	system : 'You are a helpful and knowledgeable programming assistant. Include relevant bits of context from files when you respond to enrich your answers. If the user mentions your project or a file in the context, respond briefly and accurately as needed and try to provide the paths (file_path) to the files to reference.',
} )

const loadAndProcessDocsFromDir = async ( paths: string[] ) => {

	try {

		const {
			getPaths,
			readFile,
		} = sys

		const files = await getPaths( paths, { gitignore: false } )

		// const file = "./package.json"
		// const contentJson = await readFile( file, "utf-8" )
		// const content = new TextEncoder().encode( contentJson )

		// const reader = new JSONReader( {
		// 	levelsBack     : 0,
		// 	collapseLength : 100,
		// } )
		// const docsFromContent = await reader.loadDataAsContent( content )
		// const docsFromFile = await reader.loadData( file )
		// const docsFromContent = await reader.loadDataAsContent( content )
		// console.log( {
		// 	docsFromFile,
		// 	docsFromContent,
		// } )
		// process.exit( )

		const docs = []
		for ( const file of files ) {

			const content = await readFile( file, 'utf-8' )
			docs.push( {
				content : content,
				path    : file,
			} )

		}

		await ai.generateChat( docs )
		console.log( 'Documents processed successfully.' )

	}
	catch ( error ) {

		console.error( 'Error reading files:', error )

	}

}

// Crear interfaz de lectura para recibir input del usuario en el terminal
const rl = createInterface( {
	input  : process.stdin,
	output : process.stdout,
} )

/**
 *
 */
async function startChatLoop() {

	await loadAndProcessDocsFromDir( [
		'dist/**',
		'./package.json',
		'docs/**',
	] )

	while ( true ) {

		// Preguntar al usuario por su input
		const userPrompt = await new Promise<string>( resolve => {

			rl.question( 'User prompt: ', resolve )

		} )

		// Si el usuario escribe 'exit', finalizar el loop
		if ( userPrompt.toLowerCase() === 'exit' ) {

			console.log( 'Exiting chat.' )
			break

		}

		const response = await ai.chat( userPrompt )

		if ( !response ) {

			console.error( 'No response from assistant' )
			continue

		}
		process.stdout.write( '\n\n' )
		for await ( const part of response ) {

			process.stdout.write( part.message.content.toString() )

		}
		process.stdout.write( '\n\n' )
		// Continuar el bucle y solicitar un nuevo input del usuario

	}
	rl.close()

}

// Iniciar el chat interactivo
startChatLoop()
