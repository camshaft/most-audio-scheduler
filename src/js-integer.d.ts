declare module '@aureooms/js-integer' {
  export const DEFAULT_DISPLAY_BASE: number
  export const DEFAULT_REPRESENTATION_BASE: number
  export class ZeroDivisionError extends Error {}
}

declare module '@aureooms/js-integer-big-endian' {
  export type Data = number[]
  export type MutateTarget = (
    base: number,
    a: Data,
    ai: number,
    aj: number,
    b: Data,
    bi: number,
    bj: number,
    c: Data,
    ci: number,
    cj: number
  ) => void

  export const add: MutateTarget
  export function _alloc (l: number): Data
  export function _cmp (
    a: Data,
    ai: number,
    aj: number,
    b: Data,
    bi: number,
    bj: number
  ): number
  export function _copy (
    a: Data,
    ai: number,
    aj: number,
    b: Data,
    bi: number
  ): void
  export const _idivmod: MutateTarget
  export function _euclidean_algorithm (
    base: number,
    a: Data,
    ai: number,
    aj: number,
    b: Data,
    bi: number,
    bj: number
  ): [Data, number, number]
  export function _increment (
    base: number,
    a: Data,
    ai: number,
    aj: number
  ): void
  export function _jz (
    a: Data,
    ai: number,
    aj: number
  ): boolean
  export const mul: MutateTarget
  export function _powd (
    base: number,
    power: number,
    a: Data,
    ai: number,
    b: Data,
    bi: number,
    bj: number
  ): void
  export const _sub: MutateTarget
  export function _trim_positive (a: Data, ai: number, aj: number): number
  export function _zeros (l: number): Data
  export function convert (
    base: number,
    representation: number,
    a: Data,
    ai: number,
    aj: number
  ): Data
  export function parse (base: number, representation: number, n: string): Data
  export function stringify (
    representation: number,
    display: number,
    a: Data,
    ai: number,
    aj: number
  ): string
}
