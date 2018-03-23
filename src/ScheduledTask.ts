import { IScheduledTask, IScheduler, ITask, ITime } from './types'

export class ScheduledTask<Time extends ITime, Timecode extends ITime> implements IScheduledTask<Timecode> {
  public task: ITask<Timecode>
  public time: Timecode
  public localOffset: Time
  public period: Time | null
  public scheduler: IScheduler<Time, Timecode>
  public active: boolean

  constructor (
    time: Timecode,
    localOffset: Time,
    period: Time | null,
    task: ITask<Timecode>,
    scheduler: IScheduler<Time, Timecode>
  ) {
    this.time = time
    this.localOffset = localOffset
    this.period = period
    this.task = task
    this.scheduler = scheduler
    this.active = true
  }

  public nextPeriod () {
    const { period, time } = this
    if (period === null) return false
    this.time = time.add(period) as Timecode
    return true
  }

  public run () {
    return this.task.run(this.time.add(this.localOffset) as Timecode)
  }

  public error (e: Error) {
    return this.task.error(this.time.add(this.localOffset) as Timecode, e)
  }

  public dispose () {
    this.scheduler.cancel(this)
    return this.task.dispose()
  }
}
