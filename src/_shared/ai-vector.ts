/* eslint-disable camelcase */
import {
	Document, 
	VectorStoreIndex, 
	ContextChatEngine, 
	OllamaEmbedding, 
	serviceContextFromDefaults, 
	Ollama,
	JSONReader,
} from "llamaindex"
import Sys from "./sys"

type AiVectoredDOC = {
	content : string

	path : string
}
  
export default class AiVectored {
    
	#embedModel
	#llm
	#sys
	#systemPrompt

	#chatEngine : ContextChatEngine | undefined 

	constructor( args:{
		model : string,

		system : string 
	} ) {

		this.#embedModel = new OllamaEmbedding( { model: 'nomic-embed-text' } )
		this.#sys = new Sys()
		this.#systemPrompt = args.system
		this.#llm = new Ollama( {
			model   : args.model,
			options : { temperature: 0.50 },
		} )
        
		this.#chatEngine = undefined
	
	}
	async #createContentFromJSONContent( contentJson: string ) {

		const content = new TextEncoder().encode( contentJson )
		
		const reader = new JSONReader( { levelsBack: 0 } )
		const res = await reader.loadDataAsContent( content )
		return res
	
	}

	async generateChat( lcDocs: AiVectoredDOC[] ) {
	
		if ( lcDocs.length == 0 ) {

			const defaultDoc = new Document( {
				id_      : "default_doc",
				text     : "There are no documents loaded.Starting chat without documentation.",
				metadata : {
					file_path : "default",
					file_name : "default",
				},
			} )
			
			lcDocs.push( {
				content : defaultDoc.text,
				path    : defaultDoc.id_, 
			} )
		
		}
		
		const docsPromise = lcDocs.map( async lcDoc => {

			const sharedProps = {
				id_      : lcDoc.path,
				metadata : {
					file_path : lcDoc.path.startsWith( 'https://' ) ? lcDoc.path : this.#sys.path.resolve( lcDoc.path ),
					file_name : lcDoc.path.startsWith( 'https://' ) ? lcDoc.path : this.#sys.path.basename( lcDoc.path ),
				},
			}

			if ( lcDoc.path.endsWith( '.json' ) ) {

				const data = await this.#createContentFromJSONContent( lcDoc.content ) 
				const res = {
					...data[0],
					...sharedProps, 
				}

				return new Document( res )
			
			}

			return new Document( {
				...{
					text : lcDoc.content,
					id_  : lcDoc.path,
				},
				...sharedProps, 
			} )

		} )

		const docs = await Promise.all( docsPromise )
		// console.log( docs )
		const index = await VectorStoreIndex.fromDocuments( docs, { serviceContext : serviceContextFromDefaults( {
			chunkSize    : 300,
			chunkOverlap : 20,
			embedModel   : this.#embedModel,
			llm          : this.#llm,
		} ) } )
		const retriever = index.asRetriever( { similarityTopK: 2 } )
		if ( this.#chatEngine ) this.#chatEngine.reset()
		this.#chatEngine = new ContextChatEngine( {
			retriever,
			chatModel    : this.#llm,
			systemPrompt : this.#systemPrompt,
		} )
	
	}

	async chat( query: string ) {

		if ( !this.#chatEngine ) return 

		const response = await this.#chatEngine.chat( {
			message : query,
			stream  : true, 
		} )
		//const nodesText = queryResult.sourceNodes?.map( node => node.getContent( MetadataMode.LLM ) )
		return response
	
	}

	async resetChatEngine() {

		if ( this.#chatEngine ) this.#chatEngine.reset()
	
	}

}
