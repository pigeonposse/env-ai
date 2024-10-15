// test/replacePlaceholders.test.ts

import {
	describe, it, expect, 
} from 'vitest'
import { isPath } from './sys'

describe( 'isPath', () => {

	it( 'should return true for valid paths', () => {

		expect( isPath( './file.txt' ) ).toBe( true )
		expect( isPath( '/usr/local/bin' ) ).toBe( true )
		expect( isPath( 'C:\\Windows\\System32' ) ).toBe( true )
		expect( isPath( './src/index.js' ) ).toBe( true )
		expect( isPath( '../config' ) ).toBe( true )
		expect( isPath( '../config\\ folder' ) ).toBe( true )
		expect( isPath( '../config\\ folder' ) ).toBe( true )
	
	} )
    
	it( 'should return false for strings that are not paths', () => {

		expect( isPath( 'This is just a sentence' ) ).toBe( false )
		expect( isPath( 'random:file/without/meaning' ) ).toBe( false )
		expect( isPath( 'path/without/dot' ) ).toBe( false )
		expect( isPath( 'path/folder string content with spaces' ) ).toBe( false )
		expect( isPath( './path/folder string content with spaces' ) ).toBe( false )
		expect( isPath( 'string content with spaces ./path/folder' ) ).toBe( false )
		expect( isPath( '1234:/not-a-path' ) ).toBe( false )
		expect( isPath( 'just_some_text' ) ).toBe( false )
	
	} )
    
	it( 'should handle edge cases', () => {

		expect( isPath( '.' ) ).toBe( false )
		expect( isPath( '..' ) ).toBe( false )
		expect( isPath( 'C:' ) ).toBe( false )
		expect( isPath( '/' ) ).toBe( true )
	
	} )

} )

