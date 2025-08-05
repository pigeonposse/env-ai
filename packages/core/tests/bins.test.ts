// cli.test.ts
import { exec }      from 'node:child_process'
import { promisify } from 'node:util'
import {
	describe,
	it,
	expect,
} from 'vitest'

import { description } from '../package.json'

const execAsync = promisify( exec )

describe( 'CLI Tests', () => {

	const commands = [

		{
			name    : 'Deno',
			command : 'deno run -A --unstable-fs dist/bin.mjs --help',
		},
		{
			name    : 'Bun',
			command : 'bun dist/bin.mjs --help',
		},
		{
			name    : 'Node',
			command : 'node dist/bin.mjs --help',
		},
	]

	commands.forEach( ( {
		name, command,
	} ) => {

		it( `should return usage info for ${name}`, async () => {

			const {
				stdout, stderr,
			} = await execAsync( command )

			expect( stderr ).toBe( '' )
			expect( stdout ).toMatch( new RegExp( `${description}` ) )

		} )

	} )

} )
