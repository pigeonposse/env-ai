// test/replacePlaceholders.test.ts

import {
	describe, it, expect, 
} from 'vitest'
import { replacePlaceholders } from './string'

describe( 'replacePlaceholders', () => {

	it( 'should replace multiple placeholders with provided values', async () => {

		const content = `Hello {{ name  }} {{secondName}}! Today is {{ day('short') }} ({{day( "long"  ) }}).`
		const params = {
			name       : "Alice",
			secondName : "Copper",
			day        : async ( v: string ) => {

				const days = {
					short : "Mon",
					long  : "Monday",
				}
				return days[v as 'short' | 'long'] || "Unknown"
			
			},
		}

		const result = await replacePlaceholders( content, params )
		expect( result ).toBe( "Hello Alice Copper! Today is Mon (Monday)." )
	
	} )

	it( 'should return original content if no placeholders exist', async () => {

		const content = "No placeholders here."
		const params = {}

		const result = await replacePlaceholders( content, params )
		expect( result ).toBe( "No placeholders here." )
	
	} )

	it( 'should not handle placeholders that do not exist in params', async () => {

		const content = "Hello {{ name }}! {{ nonExistent }} is not replaced."
		const params = { name: "Alice" }

		const result = await replacePlaceholders( content, params )
		expect( result ).toBe( "Hello Alice! {{ nonExistent }} is not replaced." )
	
	} )

	it( 'should handle placeholders with different formats', async () => {

		const content = "Today is {{day('long' )}} and tomorrow will be {{day( 'short')}}."
		const params = { day : async ( format: string ) => {

			const days = {
				short : "Tue",
				long  : "Tuesday",
			}
			return days[format as 'short' | 'long'] || "Unknown"
		
		} }

		const result = await replacePlaceholders( content, params )
		expect( result ).toBe( "Today is Tuesday and tomorrow will be Tue." )
	
	} )

	it( 'should return original content when no replacements are possible', async () => {

		const content = "Just text, no placeholders."
		const params = { unknown: "Value" }

		const result = await replacePlaceholders( content, params )
		expect( result ).toBe( "Just text, no placeholders." )
	
	} )

} )

