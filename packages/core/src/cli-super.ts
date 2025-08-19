import yargs       from 'yargs'
import { hideBin } from 'yargs/helpers'

import {
	argv,
	rmDeprecationAlerts,
} from './_shared/process'

rmDeprecationAlerts()
console.warn = () => {}

const args = hideBin( argv )

export const cli = async () => {

	const _cli             = yargs( args )
	const { default:CHAT } = await import( './chat' )
	const chat             = new CHAT( _cli )

	// @ts-ignore
	const consts = chat._const

	_cli
		.scriptName( consts.projectName )
		.version( consts.version )
		.usage( `${consts.projectDesc}\n\nUsage: $0 <command> [options]` )
		.command( chat.run() )
		.showHelpOnFail( false )
		.locale( 'en' )
		.help()
		.alias( 'h', 'help' )
		.alias( 'v', 'version' )

	return {

		/**
		 * Checks for available updates for the cli and notifies the user
		 * if one is available.
		 *
		 * **IMPORTANT:** not use if you want build a binary of the cli
		 */
		updater : async () => {

			const { updater } = await import( './_shared/updater' )
			await updater( { name: consts.projectName, version: consts.version } )

		},

		/**
		 * Runs the cli.
		 *
		 * If no command is provided, the help menu is shown.
		 *
		 * @returns {Promise<void>}
		 */
		run : async () => {

			const argv = await _cli.argv

			if ( argv._.length === 0 ) _cli.showHelp( 'log' )

		},
	}

}
