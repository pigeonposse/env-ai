#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import ASK from './ask/main'
import { argv } from './_shared/process'
import { notifier } from './_shared/updater'

const args = hideBin( argv )
const run = async () => {

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

	notifier( name, version ).notify()
	
	cli
		.scriptName( name )
		.usage( `${desc}\n\nUsage: $0 <command> [options]` )
		.command( ask.run() )
		.showHelpOnFail( false )
		.locale( 'en' )
		.help()
		.alias( 'h', 'help' )
		.alias( 'v', 'version' )

	const argv = await cli.argv

	if ( argv._.length === 0 ) cli.showHelp( 'log' )

}

run()
