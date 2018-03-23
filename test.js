const {
  BeatScheduler,
  BeatTimecode,
  BigNumber,
  Timeline,
  Scheduler,
  OfflineClockTimer,
  MillisecondTimecode,
} = require('./')

const clock = new OfflineClockTimer(new MillisecondTimecode(0))
const timeline = new Timeline()

const scheduler = new Scheduler(clock, clock, timeline)

const beatScheduler = new BeatScheduler(120, scheduler)

beatScheduler.scheduleTask(
  0,
  2,
  2,
  {
    name: 'TEMPO',
    run(time) {
      beatScheduler.tempo += 1
      console.log('SET TEMPO', beatScheduler.tempo += 1, 'AT', time.valueOf())
    },
    error(time, error) {
      console.error('ERROR', time, error)
    },
    dispose() {}
  }
)

beatScheduler.scheduleTask(
  0,
  0,
  '0.25',
  {
    name: 'QUARTER',
    run(time) {
      console.log('QUARTER', time.valueOf())
    },
    error(time, error) {
      console.error('ERROR', time, error)
    },
    dispose() {}
  }
)

beatScheduler.scheduleTask(
  0,
  0,
  '0.33333333333333333333333333333333',
  {
    name: 'TRIPLET',
    run(time) {
      console.log('TRIPLET', time.valueOf())
    },
    error(time, error) {
      console.error('ERROR', time, error)
    },
    dispose() {}
  }
)

for (let i = 0; i < 20; i++) {
  clock.tick()
}
