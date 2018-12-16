const timerEl = document.querySelector('#timer-area')
const timerClockEl = document.querySelector('#timer-clock')
const startStopEl = document.querySelector('#start-stop-button')
const pauseResumeEl = document.querySelector('#pause-resume-button')

const circuitNameEl = document.querySelector('#circuit-name')
const circuitSetNumEl = document.querySelector('#sets-number')
const addCircuitBtnEl  = document.querySelector('#add-circuit')
const selectCircuitEl = document.querySelector('#select-circuit')

const exerciseFormEl = document.querySelector('#exer-form')
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
let circuitsArr = loadCircuits()
let activeCircuit = 0

// Complete updateCircuitArr (at bottom)
// Continue updating code to include sets/exercise numbers correctly from circuitSelect dropdown
// Needs to also allow editing of exercises if a circuit is selected

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
    this.id = uuidv4()
}

Circuit.prototype.addExercise = function (name, type, duration) {
    let exercise = new Exercise(name, type, duration)
    this.exerciseArray.push(exercise)
    this.exerNum = this.exerciseArray.length - 1
}

Circuit.prototype.startCircuit = function () {
    if (this.exerciseArray.length !== 0) {

        timerStarted = !timerStarted
        updateExerciseTitle(this)

        if (timerStarted) {
            timer = startTimer(this.exerciseArray[this.exerCycles].duration, "timer-clock", () => {

                    if (this.exerNum > this.exerCycles) {
                        this.exerCycles++
                        listExerNumber(this)
                        updateExerciseTitle(this)
                        timer.resume()
                        
                    } else if (this.exerNum <= this.exerCycles){
                        this.exerCycles = 0
                        listExerNumber(this)
                        updateExerciseTitle(this)
                        this.circuitCycles++
                        listCircsNumber(this)
                        // console.log(this.circuitCycles)

                        if (this.setsNum <= this.circuitCycles) {
                            this.circuitCycles = 0
                            listCircsNumber(this)
                            timer.stop()
                            // console.log('finished')
                            startStopEl.textContent = 'Restart'
                            pauseResumeEl.classList.add('disabled')
                            exerciseTitleEl.textContent = `Restart or add a new circuit`

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
            exerciseNumberEl.textContent = `Exercise number: ${circuitsArr[indexCircuit].exerCycles + 1} of ${circuitsArr[indexCircuit].exerNum + 1}`
            setNumberEl.textContent = `Set number: ${circuitsArr[indexCircuit].exerCycles + 1} of ${circuitsArr[indexCircuit].setsNum}`

            startStopEl.textContent = 'Start'
            pauseResumeEl.classList.add('disabled')
        }
    } else {
        exerciseTitleEl.textContent = 'Create an exercise first!'
    }
}

// let circuitOne = new Circuit('circuitOne', 3)
appReset()
populateCircuitSelect()
updateCircuitArr()

function appReset () {
    exerciseNumberEl.textContent = `Exercise number: 0 of 0`
    setNumberEl.textContent = `Set number: 0 of 0`
}

function populateCircuitSelect () {
    selectCircuitEl.innerHTML = ''
    circuitsArr.forEach((circuit) => {
        const circuitOption = document.createElement('option')
        circuitOption.textContent = circuit.name
        circuitOption.value = circuit.id
        selectCircuitEl.appendChild(circuitOption)
        
    })
}

function createCircuit (name, sets) {
    const circuit = new Circuit(name, sets)
    circuitsArr.unshift(circuit)

    saveCircuit(circuitsArr)
}

function updateExerciseTitle (obj) {
    exerciseTitleEl.textContent = obj.exerciseArray[obj.exerCycles].name
}

function listExerNumber (obj) {
    exerciseNumberEl.textContent = `Exercise number: ${obj.exerCycles + 1} of ${obj.exerNum + 1}`
}

function listCircsNumber (obj) {
    setNumberEl.textContent = `Set number: ${obj.circuitCycles + 1} of ${obj.setsNum}`
}

function saveCircuit (circuitArr) {
    localStorage.setItem('circuits', JSON.stringify(circuitArr))
}

function loadCircuits () {
    circuitsJSON = localStorage.getItem('circuits')

    try {
        return circuitsJSON ? JSON.parse(circuitsJSON) : []
    } catch (e) {
        return []
    }
}

function startTimer (seconds, container, oncomplete) {
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
    circuitsArr[indexCircuit].startCircuit()
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

    circuitsArr[indexCircuit].addExercise(name, type, duration)
    exerciseNumberEl.textContent = `Exercise number: ${circuitsArr[indexCircuit].exerCycles + 1} of ${circuitsArr[indexCircuit].exerNum + 1}`

    exerciseNameEl.value = ''
    exerciseDurationEl.value = ''

    exerciseTitleEl.textContent = `Click start to begin circuit`

    saveCircuit(circuitsArr)

    startStopEl.classList.remove('disabled')
})

addCircuitBtnEl.addEventListener('click', (e) => {
    e.preventDefault()
    let name = circuitNameEl.value
    let setNum = parseInt(circuitSetNumEl.value, 10)
    createCircuit(name, setNum)
    setNumberEl.textContent = `Set number: ${circuitsArr[indexCircuit].exerCycles + 1} of ${setNum}`
    
    exerciseTitleEl.textContent = `Now add some exercises!`

    addCircuitBtnEl.textContent = 'Update Circuit'

    populateCircuitSelect()

    if (circuitsArr.length > 0) {
        exerciseFormEl.classList.remove('hidden')
    }
})

selectCircuitEl.addEventListener('change', (e) => {
   updateCircuitArr()
})

function updateCircuitArr () {
    let indexCircuit = circuitsArr.findIndex((circuit) => {
        return selectCircuitEl.value === circuit.id
    })
    setNumberEl.textContent = `Set number: ${circuitsArr[indexCircuit].exerCycles + 1} of ${circuitsArr[indexCircuit].setsNum}`
    exerciseNumberEl.textContent = `Exercise number: ${circuitsArr[indexCircuit].exerCycles + 1} of ${circuitsArr[indexCircuit].exerNum + 1}`
    console.log(indexCircuit)
    activeCircuit = indexCircuit
    console.log(circuitsArr[indexCircuit])
}