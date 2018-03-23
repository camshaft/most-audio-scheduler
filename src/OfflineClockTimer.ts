import { IClock, ITime, ITimer } from './types'

interface IOfflineTimer<Time> {
  id: number,
  time: Time,
  handle (): void
}

export class OfflineClockTimer<Time extends ITime> implements IClock<Time>, ITimer<Time> {
  protected id: number = 0
  protected time: Time
  private timers: Array<IOfflineTimer<Time>> = []

  constructor (initialTime: Time) {
    this.time = initialTime
  }

  public now (): Time {
    return this.time
  }

  public setTimeout (handle: () => void, time: Time) {
    const id = this.id++
    const { timers } = this
    time = time.add(this.time)
    const timer = { id, time, handle }

    for (let j = 0; j < timers.length; j++) {
      if (time.cmp(timers[j].time) < 0) {
        timers.splice(j, 0, timer)
        return id
      }
    }

    timers.push(timer)

    return id
  }

  public clearTimeout (id: number) {
    const { timers } = this
    for (let j = 0; j < timers.length; j++) {
      const timer = timers[j]
      if (timer.id === id) {
        timers.splice(j, 1)
        return
      }
    }
  }

  public tick (): boolean {
    const timer = this.timers.shift()
    if (!timer) return false
    const { handle, time } = timer
    this.time = time
    handle()
    return true
  }
}
