#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import ASK from './ask/main'
import { argv } from './_shared/process'

const args = hideBin( argv )
export const cli = async () => {

	const cli = yargs( args )

	const ask = new ASK( cli )
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const name = ask._const.projectName
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const desc = ask._const.projectDesc
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const version = ask._const.version
	
	cli
		.scriptName( name )
		.version( version )
		.usage( `${desc}\n\nUsage: $0 <command> [options]` )
		.command( ask.run() )
		.showHelpOnFail( false )
		.locale( 'en' )
		.help()
		.alias( 'h', 'help' )
		.alias( 'v', 'version' )

	return { 
		updater : async () => {
            
			const { notifier } = await import( './_shared/updater' )

			notifier( name, version ).notify()
		
		},
		run : async () => {

			const argv = await cli.argv

			if ( argv._.length === 0 ) cli.showHelp( 'log' )
	
		}, 
	}

}
