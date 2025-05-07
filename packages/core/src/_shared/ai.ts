import ollama from 'ollama'

import AiVectored from './ai-vector'

type AiOptions = {
	system : string
	prompt : string

	model : string
}

export default class Ai {

	#ollama : typeof ollama

	error = { NO_MODELS: 'no-models' } as const

	constructor() {

		this.#ollama = ollama

	}

	async getModels() {

		const output = await this.#ollama.list()
		if ( !output.models || output.models.length === 0 ) throw new Error( this.error.NO_MODELS )
		return output.models.map( model => model.name )

	}

	async installModel( name: string ) {

		return await ollama.pull( {
			model  : name,
			stream : true,
		} )

	}

	async chatVectored( opts: Omit<AiOptions, 'prompt'> & { docs: Parameters<AiVectored['generateChat']>[0] } ) {

		const vectored = new AiVectored( {
			model  : opts.model,
			system : opts.system,
		} )

		await vectored.generateChat( opts.docs )

		return {
			send  : vectored.chat.bind( vectored ),
			reset : vectored.resetChatEngine.bind( vectored ),
		}

	}

	async chat( opts: Omit<AiOptions, 'prompt'> ) {

		// console.log( opts )
		const ollama   = this.#ollama
		const messages = [
			{
				role    : 'system',
				content : opts.system,
			},
		]

		const sendMessage = async ( prompt: AiOptions['prompt'] ) => {

			// console.log( { prompt } )
			messages.push( {
				role    : 'user',
				content : prompt,
			} )

			// console.log( { messages: messages.length } )
			const response = await ollama.chat( {
				stream  : true,
				model   : opts.model,
				messages,
				options : { temperature: 0 },
			} )

			return response

		}

		return {
			send                : sendMessage,
			addAssistantMessage : ( content: string ) => messages.push( {
				role : 'assistant',
				content,
			} ),
		}

	}

}
