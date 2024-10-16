import { CoreParams } from "../types"
import { CoreConfig } from "./config"
import { CoreInputs } from "./inputs"
import { CoreModel } from "./model"
import { CorePrompt } from "./prompt"
import { CoreResponse } from "./response"

export const coreMessages = {}
export class Core {

	prompt : CorePrompt

	model : CoreModel

	config : CoreConfig

	inputs : CoreInputs

	response : CoreResponse

	Error : CoreResponse['Error']

	ERROR_ID : CoreResponse['ERROR_ID']

	exit : CoreResponse['exit']

	cancel : CoreResponse['cancel']

	constructor( args: CoreParams ) {

		this.config = new CoreConfig( args )
		this.prompt = new CorePrompt( args )
		this.model = new CoreModel( args )
		this.inputs = new CoreInputs( args )
		this.response = new CoreResponse( args )
		this.Error = this.inputs.Error
		this.ERROR_ID = this.inputs.ERROR_ID
		this.exit = this.inputs.exit.bind( this.inputs )
		this.cancel = this.inputs.cancel.bind( this.inputs )
	
	}

}
