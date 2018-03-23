import Big from 'big.js'

const {
  plus,
  minus,
  times,
  div,
  cmp,
  mod,
  valueOf
} = Big.prototype

const NUMERIC = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i

export type BigNumberValue = BigNumber | number | string

export class BigNumber {
  public static DP: number = Big.DP
  public static RM: number = Big.RM
  public static NE: number = Big.NE
  public static PE: number = Big.PE

  protected s: number
  protected e: number
  protected c: number[]

  constructor (n: BigNumberValue) {
    if (n instanceof BigNumber) {
      this.s = n.s
      this.e = n.e
      this.c = n.c.slice()
    } else {
      let e, i, nl

      // Minus zero?
      if (n === 0 && 1 / n < 0) n = '-0'

      n = n.toString()
      if (!NUMERIC.test(n)) throw Error('Invalid number')

      // Determine sign.
      this.s = n.charAt(0) === '-' ? (n = n.slice(1), -1) : 1

      // Decimal point?
      if ((e = n.indexOf('.')) > -1) n = n.replace('.', '')

      // Exponential form?
      if ((i = n.search(/e/i)) > 0) {

        // Determine exponent.
        if (e < 0) e = i
        e += +n.slice(i + 1)
        n = n.substring(0, i)
      } else if (e < 0) {

        // Integer.
        e = n.length
      }

      nl = n.length

      // Determine leading zeros.
      for (i = 0; i < nl && n.charAt(i) === '0';) ++i

      if (i === nl) {

        // Zero.
        this.c = [this.e = 0]
      } else {

        // Determine trailing zeros.
        for (; nl > 0 && n.charAt(--nl) === '0';);
        this.e = e - i - 1
        this.c = []

        // Convert string to array of digits without leading/trailing zeros.
        for (e = 0; i <= nl;) this.c[e++] = +n.charAt(i++)
      }
    }
  }

  public neg (): BigNumber {
    const n: BigNumber = new (this.constructor as any)(this)
    n.s = n.s * -1
    return n
  }

  public add (n: BigNumberValue): BigNumber {
    return plus.call(this, n)
  }

  public plus (n: BigNumberValue): BigNumber {
    return plus.call(this, n)
  }

  public sub (n: BigNumberValue): BigNumber {
    return minus.call(this, n)
  }

  public minus (n: BigNumberValue): BigNumber {
    return minus.call(this, n)
  }

  public mul (n: BigNumberValue): BigNumber {
    return times.call(this, n)
  }

  public times (n: BigNumberValue): BigNumber {
    return times.call(this, n)
  }

  public div (n: BigNumberValue): BigNumber {
    return div.call(this, n)
  }

  public mod (n: BigNumberValue): BigNumber {
    return mod.call(this, n)
  }

  public cmp (n: BigNumberValue): number {
    return cmp.call(this, n)
  }

  public eq (n: BigNumberValue): boolean {
    return !this.cmp(n)
  }

  public gt (n: BigNumberValue): boolean {
    return this.cmp(n) > 0
  }

  public gte (n: BigNumberValue): boolean {
    return this.cmp(n) > -1
  }

  public lt (n: BigNumberValue): boolean {
    return this.cmp(n) < 0
  }

  public lte (n: BigNumberValue): boolean {
    return this.cmp(n) < 1
  }

  public valueOf (): number {
    return +valueOf.call(this)
  }
}
