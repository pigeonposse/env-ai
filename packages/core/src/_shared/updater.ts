import { Updater } from '@clippium/updater'

import {
	bold,
	dim,
	green,
	italic,
	blue,
} from './color'

export const updater = async ( {
	name, version,
}:{
	name    : string
	version : string
} ) => {

	const _updater = new Updater( {
		version,
		name,
	} )

	const data = await _updater.get()
	if ( !data ) return

	console.log( `
        
║ 📦 ${bold( 'Update available' )} ${dim( data.currentVersion )} → ${green( data.latestVersion )} ${italic( `(${data.type})` )}
║ Run ${blue( data.packageManager + ' i ' + name )} to update
		
` )

}