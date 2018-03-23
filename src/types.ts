export interface ITime {
  cmp (b: any): number
  add (b: any): any
  sub (b: any): any
}

export interface IClock<Time extends ITime> {
  now (): Time
}

export interface ISink<Time extends ITime, A> {
  event (time: Time, value: A): void
  end (time: Time): void
  error (time: Time, err: Error): void
}

export interface IScheduler<Time extends ITime, Timecode extends ITime> {
  currentTime (): Timecode
  scheduleTask (offset: Time, delay: Time, period: Time, task: ITask<Timecode>): IScheduledTask<any>
  relative (offset: Time): IScheduler<Time, Timecode>
  cancel (task: IScheduledTask<any>): void
  cancelAll (predicate: (task: IScheduledTask<any>) => boolean): void
}

export interface IParentScheduler<
  Time extends ITime,
  Timecode extends ITime,
  RootTimecode extends ITime
> extends IScheduler<Time, Timecode> {
  addScheduledTask (task: IScheduledTask<RootTimecode>): void
}

export type TimerHandle = any

export interface ITimer<Time extends ITime> {
  setTimeout (f: () => any, delayTime: Time): TimerHandle
  clearTimeout (timerHandle: TimerHandle): void
}

export type TaskRunner<Time extends ITime> = (st: IScheduledTask<Time>) => any

export interface ITimeline<Time extends ITime> {
  add (scheduledTask: IScheduledTask<Time>): void
  remove (scheduledTask: IScheduledTask<Time>): boolean
  removeAll (f: (scheduledTask: IScheduledTask<Time>) => boolean): void
  isEmpty (): boolean
  nextArrival (): Time | false
  runTasks (time: Time, runTask: TaskRunner<Time>): void
}

export interface ITask<Time extends ITime> {
  run (time: Time): void
  error (time: Time, e: Error): void
  dispose (): void
}

export interface IScheduledTask<Time extends ITime> {
  time: Time
  active: boolean
  nextPeriod (): boolean
  run (): void
  error (err: Error): void
  dispose (): void
}
