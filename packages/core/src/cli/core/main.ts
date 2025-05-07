import { CoreParams }   from '../types'
import { CoreConfig }   from './config'
import { CoreInputs }   from './inputs'
import { CoreModel }    from './model'
import { CoreOutput }   from './output'
import { CorePrompt }   from './prompt'
import { CoreResponse } from './response'

export const coreMessages = {}
export class Core {

	prompt : CorePrompt

	model : CoreModel

	config : CoreConfig

	input : CoreInputs

	response : CoreResponse

	output : CoreOutput

	Error : CoreResponse['Error']

	ERROR_ID : CoreResponse['ERROR_ID']

	exit : CoreResponse['exit']

	cancel : CoreResponse['cancel']

	constructor( args: CoreParams ) {

		this.config = new CoreConfig( args )
		this.prompt = new CorePrompt( args )
		this.model  = new CoreModel( args )
		this.input  = new CoreInputs( args )
		this.output = new CoreOutput( args )

		this.response = new CoreResponse( args )
		this.Error    = this.input.Error
		this.ERROR_ID = this.input.ERROR_ID
		this.exit     = this.input.exit.bind( this.input )
		this.cancel   = this.input.cancel.bind( this.input )

	}

}
