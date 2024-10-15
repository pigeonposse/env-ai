
import {
	CoreParams, LineParams, PromptGroup,
} from './types'

export const setLine = async ( core: CoreParams, args: LineParams ) => {

	const { group } = core.p
	const {
		onCancel, onError,
	} = args

	return { list : async <L>( list: PromptGroup<L> ) =>{

		try {

			await group<L>( list, { onCancel: async () => await onCancel() } )
		
		} catch ( e ){

			await onError( e )
		
		}
	
	} }

}
