export type Primitive =
  | string
  | string[]
  | number
  | number[]
  | boolean
  | boolean[]
  | Buffer
  | Date
  | Date[]
  | Record<string, unknown>
  | Array<Record<string, unknown>>
  | null
  | undefined;
