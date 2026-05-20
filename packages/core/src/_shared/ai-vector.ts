/* eslint-disable camelcase */
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory'
import { Document }          from '@langchain/core/documents'
import { OllamaEmbeddings }  from '@langchain/ollama'
import { streamText }        from 'ai'
import { ollama }            from 'ollama-ai-provider-v2'

import { getStringType } from '../_shared/string'
import Sys               from '../_shared/sys'

type AiVectoredDOC = {
	content : string
	path    : string
}

export default class AiVectored {

	#modelName    : string
	#systemPrompt : string
	#sys          : Sys

	#vectorStore       : MemoryVectorStore | undefined
	#embeddingsManager : OllamaEmbeddings

	constructor( args:{
		model  : string
		system : string
	} ) {

		this.#modelName    = args.model
		this.#systemPrompt = args.system
		this.#sys          = new Sys()

		// Creador de embeddings compatible con Ollama y portable
		this.#embeddingsManager = new OllamaEmbeddings( { model: 'nomic-embed-text' } )

	}

	async #createContentFromJSONContent( contentJson: string ) {

		// Al usar LangChain, JSONReader ya no es estrictamente necesario ya que procesamos
		// el texto directamente, pero mantenemos una estructura limpia para no romper tu flujo.
		try {

			const parsed = JSON.parse( contentJson )
			return typeof parsed === 'object' && parsed !== null ? contentJson : contentJson

		}
		catch {

			return contentJson

		}

	}

	async generateChat( lcDocs: AiVectoredDOC[] ) {

		if ( lcDocs.length === 0 ) {

			lcDocs.push( {
				content : 'There are no documents loaded. Starting chat without documentation.',
				path    : 'default_doc',
			} )

		}

		const isJSON = ( str: string ) => {

			try {

				const parsed = JSON.parse( str )
				return typeof parsed === 'object' && parsed !== null

			}
			catch {

				return false

			}

		}

		const docsPromise = lcDocs.map( async lcDoc => {

			const is_url          = getStringType( lcDoc.path ) === 'url'
			const isJSONUrl       = is_url && isJSON( lcDoc.content )
			const is_JSON_content = lcDoc.path.endsWith( '.json' ) || isJSONUrl

			const metadata = {
				is_url,
				is_JSON_content,
				is_local_path : !is_url,
				file_path     : is_url ? lcDoc.path : this.#sys.path.resolve( lcDoc.path ),
				file_name     : is_url ? lcDoc.path : this.#sys.path.basename( lcDoc.path ),
			}

			let textContent = lcDoc.content
			if ( is_JSON_content ) {

				textContent = await this.#createContentFromJSONContent( lcDoc.content )

			}

			return new Document( {
				pageContent : textContent,
				metadata,
			} )

		} )

		const docs = await Promise.all( docsPromise )

		// Generamos el almacén vectorial en memoria usando LangChain
		this.#vectorStore = await MemoryVectorStore.fromDocuments(
			docs,
			this.#embeddingsManager,
		)

	}

	async chat( query: string ) {

		if ( !this.#vectorStore ) return

		// Búsqueda de similitud (RAG) para inyectar contexto relevante
		const similarityResults = await this.#vectorStore.similaritySearch( query, 3 )

		const context = similarityResults
			.map( doc => `[Source: ${doc.metadata.file_name}]: ${doc.pageContent}` )
			.join( '\n\n' )

		// Streaming nativo de Vercel AI SDK
		const result = streamText( {
			model       : ollama( this.#modelName ),
			system      : `${this.#systemPrompt}\n\nUse the following pieces of context to answer the question:\n${context}`,
			prompt      : query,
			temperature : 0.50,
		} )

		return result.textStream

	}

	async resetChatEngine() {

		this.#vectorStore = undefined

	}

}
