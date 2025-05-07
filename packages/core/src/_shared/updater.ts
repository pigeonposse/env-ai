import updater from 'tiny-updater'

export const notifier = ( name: string, version: string ) => {

	const opts = {
		name,
		version,
		ttl : 86_400_000,
	}
	return { notify: () => updater( opts ) }

}
