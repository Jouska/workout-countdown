const timerEl = document.querySelector('#timer-area')
const timerClockEl = document.querySelector('#timer-clock')
const startStopEl = document.querySelector('#start-stop-button')
const pauseResumeEl = document.querySelector('#pause-resume-button')

const exerciseNameEl = document.querySelector('#exercise-name')
const exerciseTypeEl = document.querySelector('#exercise-type')
const exerciseDurationEl = document.querySelector('#exercise-duration')
const addExerciseBtnEl = document.querySelector('#add-exercise')

const exerciseTitleEl = document.querySelector('#exercise-title')
const exerciseNumberEl = document.querySelector('#exercise-number')
const setNumberEl = document.querySelector('#set-number')

let timer
let timerStarted = false
let intervalNew


const Exercise = function (name, type, duration) {
    this.name = name
    this.type = type
    this.duration = duration + 1
}

const Circuit = function (name, setsNum) {
    this.name = name
    this.exerNum
    this.setsNum = setsNum
    this.exerciseArray = []
    this.circuitCycles = 0
    this.exerCycles = 0
}

Circuit.prototype.addExercise = function (name, type, duration) {
    let exercise = new Exercise(name, type, duration)
    this.exerciseArray.push(exercise)
    this.exerNum = this.exerciseArray.length - 1
}

Circuit.prototype.startCircuit = function () {
    if (this.exerciseArray.length !== 0) {

        timerStarted = !timerStarted
        exerciseTitleEl.textContent = this.exerciseArray[this.exerCycles].name

        if (timerStarted) {
            timer = startTimer(this.exerciseArray[this.exerCycles].duration, "timer-clock", () => {

                    
                    if (this.exerNum > this.exerCycles) {
                        this.exerCycles++
                        exerciseNumberEl.textContent = `Exercise number: ${this.exerCycles + 1}`
                        exerciseTitleEl.textContent = this.exerciseArray[this.exerCycles].name
                        timer.resume()
                    } else if (this.exerNum <= this.exerCycles){
                        this.exerCycles = 0
                        exerciseNumberEl.textContent = `Exercise number: ${this.exerCycles + 1}`
                        exerciseTitleEl.textContent = this.exerciseArray[this.exerCycles].name
                        this.circuitCycles++
                        setNumberEl.textContent = `Set number: ${this.circuitCycles + 1}`
                        console.log(this.circuitCycles)

                        if (this.setsNum <= this.circuitCycles) {
                            this.circuitCycles = 0
                            setNumberEl.textContent = `Set number: ${this.circuitCycles + 1}`
                            timer.stop()
                            console.log('finished')
                            startStopEl.textContent = 'Restart'
                            pauseResumeEl.classList.add('disabled')
                            return 
                        }
                        timer.resume()
                    }
            })
            startStopEl.textContent = 'Stop'
            pauseResumeEl.classList.remove('disabled')
            pauseResumeEl.textContent = 'Pause'
        } else {
            timer.stop()
            this.exerCycles = 0
            this.circuitCycles = 0
            startStopEl.textContent = 'Start'
            pauseResumeEl.classList.add('disabled')
        }
    } else {
        exerciseTitleEl.textContent = 'Create an exercise first!'
    }
}

let circuitOne = new Circuit('circuitOne', 3)


function startTimer(seconds, container, oncomplete) {
    let startTime, timer, obj, ms = seconds*1000,
        display = document.getElementById(container)
    obj = {}
    obj.resume = function() {
        startTime = new Date().getTime()
        timer = setInterval(obj.step,20) // adjust this number to affect granularity
                            // lower numbers are more accurate, but more CPU-expensive
    };
    obj.pause = function() {
        ms = obj.step();
        clearInterval(timer)   
    };
    obj.step = function() {
        let now = Math.max(0,ms-(new Date().getTime()-startTime)),
            m = Math.floor(now/60000), s = Math.floor(now/1000)%60
        s = (s < 10 ? "0" : "")+s
        display.innerHTML = m+":"+s
        if( now == 0) {
            clearInterval(timer);
            // obj.resume = function() {}
            // obj.resume
            if( oncomplete) oncomplete()
        }
        return now;
    };
    obj.stop = function() {
        ms = seconds*1000
        clearInterval(timer)
        display.innerHTML = "0:00"
    }
    obj.resume()
    return obj
}

startStopEl.addEventListener('click', () => {
    circuitOne.startCircuit()
})

pauseResumeEl.addEventListener('click', () => {
    timerStarted = !timerStarted

    if (!timerStarted) {
        timer.pause()
        startStopEl.textContent = 'Restart'
        pauseResumeEl.textContent = 'Resume'
    } else {
        timer.resume()
        pauseResumeEl.textContent = 'Pause'
        startStopEl.textContent = 'Stop'
    }
})

addExerciseBtnEl.addEventListener('click', (e) => {
    e.preventDefault()
    let name = exerciseNameEl.value
    let type = exerciseTypeEl.value
    let duration = parseInt(exerciseDurationEl.value, 10)

    circuitOne.addExercise(name, type, duration)
})