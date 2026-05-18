// cli.test.ts
import { exec }      from 'node:child_process'
import { promisify } from 'node:util'
import {
	describe,
	it,
	expect,
} from 'vitest'

const execAsync = promisify( exec )

describe( 'CLI Tests', () => {
	
	const filePath ='tests/run.js'
	const commands = [
		{
			name    : 'Deno',
			command : `deno eval "Object.defineProperty(process.stdin, 'isTTY', { value: false, writable: true }); process.stdin.setRawMode = () => {}; import('./${filePath}');" < /dev/null`,
		},
		{
			name    : 'Bun',
			command : `bun ${filePath} < /dev/null`,
		},
		{
			name    : 'Node',
			command : `node ${filePath} < /dev/null`,
		},
	]

	commands.forEach( ( {
		name, command,
	} ) => {

		it( `should return usage info for ${name}`, async () => {

			const { stderr } = await execAsync( command )
			expect( stderr ).toBe( '' )
			//expect( stdout ).toMatch( new RegExp( `${description}` ) )

		} )

	} )

} )
