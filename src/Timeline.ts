import { findIndex, removeAll } from '@most/prelude'
import { IScheduledTask, ITime, ITimeline } from './types'

interface ITimeslot<Time extends ITime> {events: Array<IScheduledTask<Time>>, time: Time}

export type runTaskFn<Time extends ITime> = (task: IScheduledTask<Time>) => void

export class Timeline<Time extends ITime> implements ITimeline<Time> {
  private tasks: Array<ITimeslot<Time>> = []

  public nextArrival (): Time | false {
    return this.isEmpty() ? false : this.tasks[0].time
  }

  public isEmpty (): boolean {
    return this.tasks.length === 0
  }

  public add (st: IScheduledTask<Time>): void {
    insertByTime(st, this.tasks)
  }

  public remove (st: IScheduledTask<Time>): boolean {
    const i = binarySearch(st.time, this.tasks)

    if (i >= 0 && i < this.tasks.length) {
      const at = findIndex(st, this.tasks[i].events)
      if (at >= 0) {
        this.tasks[i].events.splice(at, 1)
        return true
      }
    }

    return false
  }

  public removeAll (f: (task: IScheduledTask<Time>) => boolean): void {
    this.tasks = this.tasks.filter((timeslot) => {
      timeslot.events = removeAll(f, timeslot.events)
      return timeslot.events.length !== 0
    })
  }

  public runTasks (t: Time, runTask: runTaskFn<Time>): void {
    const tasks = this.tasks
    const l = tasks.length
    let i = 0

    while (i < l && tasks[i].time.cmp(t) < 1) {
      ++i
    }

    this.tasks = tasks.slice(i)

    for (let j = 0; j < i; ++j) {
      this.tasks = runReadyTasks(runTask, tasks[j].events, this.tasks)
    }
  }
}

function runReadyTasks<Time extends ITime> (
  runTask: runTaskFn<Time>,
  events: Array<IScheduledTask<Time>>,
  tasks: Array<ITimeslot<Time>>
): Array<ITimeslot<Time>> {
  for (const task of events) {
    if (task.active) {
      runTask(task)

      if (task.active && task.nextPeriod()) {
        insertByTime(task, tasks)
      }
    }
  }

  return tasks
}

function insertByTime<Time extends ITime> (task: IScheduledTask<Time>, timeslots: Array<ITimeslot<Time>>) {
  const l = timeslots.length
  const { time } = task

  if (l === 0) {
    timeslots.push(newTimeslot(time, [task]))
    return
  }

  const i = binarySearch(time, timeslots)

  if (i >= l) {
    timeslots.push(newTimeslot(time, [task]))
  } else {
    insertAtTimeslot(task, timeslots, time, i)
  }
}

function insertAtTimeslot<Time extends ITime> (
  task: IScheduledTask<Time>,
  timeslots: Array<ITimeslot<Time>>,
  time: Time,
  i: number
): void {
  const timeslot = timeslots[i]
  if (time.cmp(timeslot.time) === 0) {
    addEvent(task, timeslot.events)
  } else {
    timeslots.splice(i, 0, newTimeslot(time, [task]))
  }
}

function addEvent<Time extends ITime> (task: IScheduledTask<Time>, events: Array<IScheduledTask<Time>>) {
  if (events.length === 0 || task.time.cmp(events[events.length - 1].time) > -1) {
    events.push(task)
  } else {
    spliceEvent(task, events)
  }
}

function spliceEvent<Time extends ITime> (task: IScheduledTask<Time>, events: Array<IScheduledTask<Time>>) {
  for (let j = 0; j < events.length; j++) {
    if (task.time.cmp(events[j].time) < 0) {
      events.splice(j, 0, task)
      break
    }
  }
}

function binarySearch<Time extends ITime> (t: Time, sortedArray: Array<ITimeslot<Time>>) {
  let lo = 0
  let hi = sortedArray.length

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const comparison = t.cmp(sortedArray[mid].time)

    if (comparison === 0) {
      return mid
    } else if (comparison < 0) {
      hi = mid
    } else {
      lo = mid + 1
    }
  }
  return hi
}

function newTimeslot<Time extends ITime> (t: Time, events: Array<IScheduledTask<Time>>): ITimeslot<Time> {
  return { time: t, events }
}
