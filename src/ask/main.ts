import { CLI } from "../cli/main"

type CLIParams = ConstructorParameters<typeof CLI>[0]

export default class AskCLI extends CLI {

	constructor( cli: CLIParams ) {
		
		super( cli )
		const projectName = this._const.projectName
		this.name = 'ask'
		this.desc = `Chat with the ${projectName} assistant`
		this.message.intro = `${projectName} assistant`
		this.message.cancel = `${projectName} assistant cancelled!`
		this.message.outro = `${projectName} assistant completed!`
        
	}

}
