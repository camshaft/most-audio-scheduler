import { RelativeScheduler } from './RelativeScheduler'
import { ScheduledTask } from './ScheduledTask'
import { runTask } from './task'
import {
  IClock,
  IParentScheduler,
  IScheduledTask,
  ITask,
  ITime,
  ITimeline,
  ITimer,
  TimerHandle
} from './types'

export class Scheduler<Time extends ITime, Timecode extends ITime>
    implements IParentScheduler<Time, Timecode, Timecode> {
  protected clock: IClock<Timecode>
  protected timer: ITimer<Timecode>
  protected timeline: ITimeline<Timecode>
  protected _timer: TimerHandle | null = null
  protected _nextArrival: Timecode | null = null

  constructor (clock: IClock<Timecode>, timer: ITimer<Timecode>, timeline: ITimeline<Timecode>) {
    this.clock = clock
    this.timer = timer
    this.timeline = timeline
  }

  public currentTime (): Timecode {
    return this.clock.now()
  }

  public scheduleTask (localOffset: Time, delay: Time, period: Time, task: ITask<Timecode>): IScheduledTask<Timecode> {
    const time = this.currentTime().add(delay) as Timecode
    const st = new ScheduledTask(time, localOffset, period, task, this)
    this.addScheduledTask(st)
    return st
  }

  public addScheduledTask (st: IScheduledTask<Timecode>): void {
    this.timeline.add(st)
    this.scheduleNextRun()
  }

  public relative (offset: Time): IParentScheduler<Time, Timecode, Timecode> {
    return new RelativeScheduler(offset, this)
  }

  public cancel (task: IScheduledTask<any>) {
    task.active = false
    if (this.timeline.remove(task)) {
      this.reschedule()
    }
  }

  public cancelAll (f: (task: IScheduledTask<any>) => boolean) {
    this.timeline.removeAll(f)
    this.reschedule()
  }

  protected reschedule () {
    if (!this.scheduleNextRun()) {
      this.unschedule()
    }
  }

  protected unschedule () {
    this.timer.clearTimeout(this._timer)
    this._timer = null
  }

  protected scheduleNextRun (): boolean {
    if (this.timeline.isEmpty()) {
      return false
    }

    const nextArrival = this.timeline.nextArrival()

    if (nextArrival === false) return nextArrival

    if (this._timer === null || this._nextArrival === null) {
      this.scheduleNextArrival(nextArrival)
    } else if (nextArrival.cmp(this._nextArrival) < 0) {
      this.unschedule()
      this.scheduleNextArrival(nextArrival)
    }

    return true
  }

  protected scheduleNextArrival (nextArrival: Timecode) {
    this._nextArrival = nextArrival
    const delay = nextArrival.sub(this.currentTime()) as Timecode
    this._timer = this.timer.setTimeout(this.runReadyTasks, delay)
  }

  protected runReadyTasks = () => {
    this._timer = null
    this.timeline.runTasks(this.currentTime(), runTask)
    this.scheduleNextRun()
  }
}
