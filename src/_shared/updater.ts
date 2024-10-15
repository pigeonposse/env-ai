import updateNotifier from 'update-notifier'

export const notifier = ( name: string, version: string ) => updateNotifier( { pkg : {
	name,
	version, 
} } )
