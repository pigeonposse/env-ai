import {
	streamText, type ModelMessage,
} from 'ai'
import ollama                 from 'ollama'
import { ollama as aiOllama } from 'ollama-ai-provider-v2'

import AiVectored from './ai-vector'

type AiOptions = {
	system : string
	prompt : string
	model  : string
}

export class Ai {

	#ollamaClient = ollama

	error = { NO_MODELS: 'no-models' } as const

	async getModels() {

		const output = await this.#ollamaClient.list()
		if ( !output.models || output.models.length === 0 ) throw new Error( this.error.NO_MODELS )
		return output.models.map( model => model.name )

	}

	async installModel( name: string ) {

		return await this.#ollamaClient.pull( {
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

		// Historial usando el tipado estricto CoreMessage de Vercel AI SDK
		const messages: ModelMessage[] = [
			{
				role    : 'system',
				content : opts.system,
			},
		]

		const sendMessage = async ( prompt: AiOptions['prompt'] ) => {

			messages.push( {
				role    : 'user',
				content : prompt,
			} )

			// Migrado del cliente plano de ollama a streamText de Vercel AI SDK
			const response = streamText( {
				model       : aiOllama( opts.model ),
				messages,
				temperature : 0,
			} )

			return response.textStream

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
