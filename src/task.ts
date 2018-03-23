import { IScheduledTask, ITime } from './types'

export function defer<Time extends ITime> (task: IScheduledTask<Time>) {
  return Promise.resolve(task).then(runTask)
}

export function runTask<Time extends ITime> (task: IScheduledTask<Time>) {
  try {
    return task.run()
  } catch (e) {
    return task.error(e)
  }
}
