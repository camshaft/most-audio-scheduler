import { Beat } from './Beat'
import { BeatTimecode } from './BeatTimecode'
import { MillisecondTimecode } from './MillisecondTimecode'
import { IScheduledTask, IScheduler, ITask } from './types'

export class BeatScheduledTask implements IScheduledTask<MillisecondTimecode> {
  public time: MillisecondTimecode
  public active: boolean = true
  public scheduler: IScheduler<Beat, BeatTimecode>
  protected startTime: BeatTimecode
  protected delay: Beat
  protected beatTime: BeatTimecode
  protected task: ITask<BeatTimecode>
  protected localOffset: Beat
  protected period: Beat | null

  constructor (
    startTime: BeatTimecode,
    delay: Beat,
    localOffset: Beat,
    period: Beat | null,
    task: ITask<BeatTimecode>,
    scheduler: IScheduler<Beat, BeatTimecode>
  ) {
    const beatTime = startTime.add(delay)
    this.time = beatTime.toMillisecondTimecode()
    this.scheduler = scheduler

    this.startTime = startTime
    this.delay = delay
    this.beatTime = beatTime
    this.task = task
    this.localOffset = localOffset
    this.period = period
  }

  public nextPeriod (): boolean {
    const { period, scheduler } = this
    if (period === null) return false

    this.delay = period
    const currentTime = this.startTime = scheduler.currentTime()
    const beatTime = this.beatTime = currentTime.add(period)
    this.time = beatTime.toMillisecondTimecode()

    return true
  }

  public run (): void {
    this.task.run(this.beatTime.add(this.localOffset))
  }

  public error (e: Error): void {
    this.task.error(this.beatTime.add(this.localOffset), e)
  }

  public dispose (): void {
    this.scheduler.cancel(this)
    this.task.dispose()
  }

  public reschedule (newEpoch: BeatTimecode): void {
    const { startTime } = this
    const timePassed = newEpoch.sub(startTime)
    const delay = this.delay = new Beat(timePassed.add(this.delay.neg()).neg())
    this.startTime = newEpoch
    const beatTime = this.beatTime = newEpoch.add(delay)
    this.time = beatTime.toMillisecondTimecode()

    // because of the time changed we missed the beat time
    if (beatTime.cmp(newEpoch) < 0) {
      const { period } = this
      if (period !== null) {
        this.delay = period
        this.reschedule(beatTime)
      } else {
        this.task.dispose()
        this.active = false
      }
    }
  }
}
