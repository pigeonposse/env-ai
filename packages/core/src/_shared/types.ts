///////////////////////////
// UTILS
///////////////////////////

export type Prettify<T> = {
	[K in keyof T]: Prettify<T[K]>;
} & {}

export type Exact<A, B> = A extends B ? ( B extends A ? A : never ) : never
