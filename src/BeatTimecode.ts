import { BigNumber, BigNumberValue } from './BigNumber'
import { MillisecondTimecode } from './MillisecondTimecode'
import { ITime } from './types'

const msInMinute = new BigNumber(60000)

export class BeatTimecode extends BigNumber implements ITime {
  public timestamp: MillisecondTimecode
  public tempo: BigNumber

  public static fromTimestamp (timestamp: MillisecondTimecode, tempo: BigNumberValue) {
    const bigTempo = new BigNumber(tempo)
    const timecode = new BeatTimecode(timestamp.div(msInMinute.div(bigTempo)))
    timecode.timestamp = timestamp
    timecode.tempo = bigTempo
    return timecode
  }

  public static epoch (timestamp: MillisecondTimecode, tempo: BigNumberValue): BeatTimecode {
    const timecode = new BeatTimecode(0)
    timecode.timestamp = timestamp
    timecode.tempo = new BigNumber(tempo)
    return timecode
  }

  public cmp (timecode: BeatTimecode): number {
    return this.timestamp.cmp(timecode.timestamp)
  }

  public add (value: BeatTimecode | BigNumberValue): BeatTimecode {
    const timecode = (value instanceof BeatTimecode) ? value : this.cast(value)
    const result = super.add(timecode) as BeatTimecode
    result.timestamp = this.timestamp.add(timecode.timestamp)
    result.tempo = this.tempo
    return result
  }

  public sub (value: BeatTimecode | BigNumberValue): BeatTimecode {
    const timecode = (value instanceof BeatTimecode) ? value : this.cast(value)
    const result = super.sub(timecode) as BeatTimecode
    result.timestamp = this.timestamp.sub(timecode.timestamp)
    result.tempo = this.tempo
    return result
  }

  public toMillisecondTimecode (): MillisecondTimecode {
    return this.timestamp
  }

  protected cast (value: BigNumberValue): BeatTimecode {
    const { tempo } = this

    const timestamp = new MillisecondTimecode(
      msInMinute.div(tempo).mul(value)
    )

    return BeatTimecode.fromTimestamp(timestamp, tempo)
  }
}
