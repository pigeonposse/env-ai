import {
	z, ZodType, 
} from 'zod'

export const validate = z

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ValidateSchema = ZodType<any, any, any>

export type ValidateInfer<O extends ValidateSchema> = z.infer<O>

export function createLiteralUnion<T extends string>( values: T[] ) {

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return z.union( values.map( value => z.literal( value ) ) ) as unknown as z.ZodUnion<[
		z.ZodLiteral<T>,
		...z.ZodLiteral<T>[],
	]>

}
