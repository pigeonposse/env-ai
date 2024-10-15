import ollama from 'ollama' 

type AiOptions = {
	system : string,
	prompt : string,
     
	model : string 
} 
export default class Ai {

	#ollama : typeof ollama

	error = { NO_MODELS: 'no-models' } as const
    
	constructor(){

		this.#ollama = ollama
	
	}

	async generateStreamResponse( {
		system, prompt, model, 
	}: AiOptions ) {

		const response = await this.#ollama.generate( {
			system,
			prompt,
			model,
			stream : true,
		} )
		return response
	
	}
	async getModels () {

		const output = await this.#ollama.list()
		if ( !output.models || output.models.length === 0 ) throw new Error( this.error.NO_MODELS )
		return output.models.map( model => model.name )
	
	}

	async chat( opts: Omit<AiOptions, 'prompt'> ) {

		// console.log( opts )
		const ollama = this.#ollama
		const messages = [
			{
				role    : "system",
				content : opts.system, 
			},
		]
      
		async function sendMessage( prompt: AiOptions['prompt'] ) {

			// console.log( { prompt } )
			messages.push( {
				role    : "user",
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
				role : "assistant",
				content, 
			} ), 
		}
	
	}

}
