export * from '@clack/prompts'

import isUnicodeSupported from 'is-unicode-supported'
import {
	cursor, erase, 
} from 'sisteransi'

import { block } from '@clack/core'
import {
	blue,
	grayBright, 
	magenta,
	red, 
} from './color'
import process from "node:process"

const unicode = isUnicodeSupported()
const s = ( c: string, fallback: string ) => ( unicode ? c : fallback )
const S_STEP_CANCEL = s( '■', 'x' )
const S_STEP_ERROR = s( '▲', 'x' )
const S_STEP_SUBMIT = s( '◇', 'o' )
const S_BAR = s( '│', '|' )

/**
 * Spinner custom. Output is in blue.
 * Copy of https://github.com/bombshell-dev/clack/blob/main/packages/prompts/src/index.ts
 * @returns {void}
 */
export const spinnerCustom = () => {

	const frames = unicode ? [
		'◒',
		'◐',
		'◓',
		'◑', 
	] : [
		'•',
		'o',
		'O',
		'0', 
	]
	const delay = unicode ? 80 : 120

	let unblock: () => void,
		loop: NodeJS.Timeout,
		isSpinnerActive = false,
		_message = ''

	const handleExit = ( code: number ) => {

		const msg = code > 1 ? 'Something went wrong' : 'Canceled'
		if ( isSpinnerActive ) stop( msg, code )
	
	}

	const errorEventHandler = () => handleExit( 2 )
	const signalEventHandler = () => handleExit( 1 )

	const registerHooks = () => {

		// Reference: https://nodejs.org/api/process.html#event-uncaughtexception
		process.on( 'uncaughtExceptionMonitor', errorEventHandler )
		// Reference: https://nodejs.org/api/process.html#event-unhandledrejection
		process.on( 'unhandledRejection', errorEventHandler )
		// Reference Signal Events: https://nodejs.org/api/process.html#signal-events
		process.on( 'SIGINT', signalEventHandler )
		process.on( 'SIGTERM', signalEventHandler )
		process.on( 'exit', handleExit )
	
	}

	const clearHooks = () => {

		process.removeListener( 'uncaughtExceptionMonitor', errorEventHandler )
		process.removeListener( 'unhandledRejection', errorEventHandler )
		process.removeListener( 'SIGINT', signalEventHandler )
		process.removeListener( 'SIGTERM', signalEventHandler )
		process.removeListener( 'exit', handleExit )
	
	}

	const start = ( msg = '' ): void => {

		isSpinnerActive = true
		unblock = block()
		_message = msg.replace( /\.+$/, '' )
		process.stdout.write( `${grayBright( S_BAR )}\n` )
		let frameIndex = 0,
			dotsTimer = 0
		registerHooks()
		loop = setInterval( () => {

			const frame = magenta( frames[frameIndex] )
			const loadingDots = '.'.repeat( Math.floor( dotsTimer ) ).slice( 0, 3 )
			process.stdout.write( cursor.move( -999, 0 ) )
			process.stdout.write( erase.down( 1 ) )
			process.stdout.write( `${frame}  ${_message}${loadingDots}` )
			frameIndex = frameIndex + 1 < frames.length ? frameIndex + 1 : 0
			dotsTimer = dotsTimer < frames.length ? dotsTimer + 0.125 : 0
		
		}, delay )
	
	}

	const stop = ( msg = '', code = 0 ): void => {

		_message = msg ?? _message
		isSpinnerActive = false
		clearInterval( loop )
		const step
			= code === 0
				? blue( S_STEP_SUBMIT )
				: code === 1
					? red( S_STEP_CANCEL )
					: red( S_STEP_ERROR )
		process.stdout.write( cursor.move( -999, 0 ) )
		process.stdout.write( erase.down( 1 ) )
		process.stdout.write( `${step}  ${_message}\n` )
		clearHooks()
		unblock()
	
	}

	const message = ( msg = '' ): void => {

		_message = msg ?? _message
	
	}

	return {
		start,
		stop,
		message,
	}

}
