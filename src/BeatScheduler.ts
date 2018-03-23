import { Beat } from './Beat'
import { BeatScheduledTask } from './BeatScheduledTask'
import { BeatTimecode } from './BeatTimecode'
import { BigNumber } from './BigNumber'
import { MillisecondTimecode } from './MillisecondTimecode'
import { IParentScheduler, IScheduledTask, ITask } from './types'

export interface IBeatSchedulerOpts {
  tempo?: number
  numerator?: number
  denominator?: number
}

export class BeatScheduler implements IParentScheduler<Beat, BeatTimecode, MillisecondTimecode> {
  public scheduler: IParentScheduler<MillisecondTimecode, MillisecondTimecode, MillisecondTimecode>
  protected _tempo: number
  protected epoch: BeatTimecode

  constructor (
    tempo: number,
    scheduler: IParentScheduler<MillisecondTimecode, MillisecondTimecode, MillisecondTimecode>
  ) {
    this.scheduler = scheduler
    this._tempo = tempo
    this.epoch = BeatTimecode.epoch(scheduler.currentTime(), tempo)
  }

  get tempo () {
    return this._tempo
  }

  set tempo (tempo: number) {
    if (tempo === this._tempo) return
    const epoch = this.epoch = this.currentTime()
    epoch.tempo = new BigNumber(this._tempo = tempo)
    this.reschedule(epoch)
  }

  public currentTime (): BeatTimecode {
    const {
      _tempo,
      scheduler,
      epoch
    } = this

    const time = scheduler.currentTime().sub(epoch.timestamp)

    const timecode = BeatTimecode.fromTimestamp(time, _tempo)
    return timecode.add(epoch)
  }

  public scheduleTask (
    localOffset: Beat | number | string,
    delay: Beat | number | string,
    period: Beat | number | string | null,
    task: ITask<BeatTimecode>
  ): IScheduledTask<MillisecondTimecode> {
    if (period !== null) period = new Beat(period)

    const st = new BeatScheduledTask(
      this.currentTime(),
      new Beat(delay),
      new Beat(localOffset),
      period,
      task,
      this
    )
    this.scheduler.addScheduledTask(st)

    return st
  }

  public addScheduledTask (st: IScheduledTask<MillisecondTimecode>) {
    this.scheduler.addScheduledTask(st)
  }

  public relative (offset: Beat) {
    const scheduler = new BeatScheduler(this._tempo, this.scheduler)
    // TODO i don't think this is correct - fix it
    scheduler.epoch = this.epoch.add(offset)

    return scheduler
  }

  public cancel (task: IScheduledTask<any>) {
    this.scheduler.cancel(task)
  }

  public cancelAll (f: (task: IScheduledTask<any>) => boolean) {
    this.scheduler.cancelAll(f)
  }

  protected reschedule (epoch: BeatTimecode) {
    const tasks: BeatScheduledTask[] = []

    this.cancelAll((task: IScheduledTask<any>) => {
      if (!(task instanceof BeatScheduledTask)) return false
      if (task.scheduler !== this) return false
      task.reschedule(epoch)
      if (task.active) tasks.push(task)
      return true
    })

    for (const task of tasks) {
      this.addScheduledTask(task)
    }
  }
}
