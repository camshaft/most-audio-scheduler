import { IParentScheduler, IScheduledTask, IScheduler, ITask, ITime } from './types'

export class RelativeScheduler<Time extends ITime, Timecode extends ITime, RootTimecode extends ITime>
    implements IParentScheduler<Time, Timecode, RootTimecode> {
  protected offset: Time
  protected scheduler: IParentScheduler<Time, Timecode, RootTimecode>

  constructor (offset: Time, scheduler: IParentScheduler<Time, Timecode, RootTimecode>) {
    this.offset = offset
    this.scheduler = scheduler
  }

  public currentTime (): Timecode {
    return this.scheduler.currentTime().sub(this.offset) as Timecode
  }

  public scheduleTask (
    localOffset: Time,
    delay: Time,
    period: Time,
    task: ITask<Timecode>
  ): IScheduledTask<Timecode> {
    return this.scheduler.scheduleTask(localOffset.add(this.offset) as Time, delay, period, task)
  }

  public addScheduledTask (st: IScheduledTask<RootTimecode>): void {
    this.scheduler.addScheduledTask(st)
  }

  public relative (offset: Time): IScheduler<Time, Timecode> {
    return new RelativeScheduler(offset.add(this.offset) as Time, this.scheduler)
  }

  public cancel (task: IScheduledTask<any>) {
    this.scheduler.cancel(task)
  }

  public cancelAll (f: (task: IScheduledTask<any>) => boolean) {
    this.scheduler.cancelAll(f)
  }
}
