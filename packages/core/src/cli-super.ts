#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import CHAT from './chat/main'
import {
	argv, rmDeprecationAlerts, 
} from './_shared/process'

rmDeprecationAlerts()

const args = hideBin( argv )
export const cli = async () => {

	const cli = yargs( args )

	const chat = new CHAT( cli )
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const consts = chat._const
	
	cli
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
         * @important not use if you want build a binary of the cli
		 */
		updater : async () => {
            
			const { notifier } = await import( './_shared/updater' )

			notifier( consts.projectName, consts.version ).notify()
		
		},
		run : async () => {

			const argv = await cli.argv

			if ( argv._.length === 0 ) cli.showHelp( 'log' )
	
		}, 
	}

}
