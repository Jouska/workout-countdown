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
let circuitsArr = []
let activeCircuit = 0

// Nice! Another run of bug checking, then start to style and clean up presentation and user flow

const Exercise = function (name, type, duration) {
    this.name = name
    this.type = type
    this.duration = duration + 1
}

const Circuit = function (name, setsNum, exerciseArray = [], exerNum = 0) {
    this.name = name
    this.exerNum = exerNum
    this.setsNum = setsNum
    this.exerciseArray = exerciseArray
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
            renderCurrentSetExerciseNum()
            

            startStopEl.textContent = 'Start'
            pauseResumeEl.classList.add('disabled')
        }
    } else {
        exerciseTitleEl.textContent = 'Create an exercise first!'
    }
}

// let circuitOne = new Circuit('circuitOne', 3)

loadCircuits()
appReset()
populateCircuitSelect()
updateCircuitArr()

function appReset () {
    if (circuitsArr.length > 0) {
        debugger
        renderCurrentSetExerciseNum()
    } else {
        exerciseNumberEl.textContent = `Exercise number: 0 of 0`
        setNumberEl.textContent = `Set number: 0 of 0`
    }
}

function renderCurrentSetExerciseNum () {
    // debugger

    setNumberEl.textContent = `Set number: ${circuitsArr[activeCircuit].exerCycles + 1} of ${circuitsArr[activeCircuit].setsNum}`
    exerciseNumberEl.textContent = `Exercise number: ${circuitsArr[activeCircuit].exerCycles + 1} of ${parseInt(circuitsArr[activeCircuit].exerNum, 10)}`
    if (circuitsArr[activeCircuit].exerNum === 0) {
        
        exerciseNumberEl.textContent = `Exercise number: 0 of ${parseInt(circuitsArr[activeCircuit].exerNum, 10)}`
    }
}

function populateCircuitSelect () {
    selectCircuitEl.innerHTML = ''
    circuitsArr.forEach((circuit) => {
        const circuitOption = document.createElement('option')
        circuitOption.textContent = circuit.name
        circuitOption.value = circuit.id
        selectCircuitEl.appendChild(circuitOption)
        
    })
    if (circuitsArr.length > 0) {
        exerciseFormEl.classList.remove('hidden')
        renderCurrentSetExerciseNum()
    }
}

function createCircuit (name, sets, exerciseArray, exerNum) {
    debugger
    const circuit = new Circuit(name, sets, exerciseArray, exerNum)
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
    if (circuitsJSON) {
        circuitsParsed = JSON.parse(circuitsJSON)
        console.log(circuitsParsed)
        circuitsParsed.forEach((circuit) => {
            const newCircuit = createCircuit(circuit.name, circuit.setsNum, circuit.exerciseArray, circuit.exerNum)
            console.log(circuitsArr)
        })
    } else {
        circuitsArr = []
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
    circuitsArr[activeCircuit].startCircuit()
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

    circuitsArr[activeCircuit].addExercise(name, type, duration)
    exerciseNumberEl.textContent = `Exercise number: ${circuitsArr[activeCircuit].exerCycles + 1} of ${circuitsArr[activeCircuit].exerNum + 1}`

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
    setNumberEl.textContent = `Set number: ${circuitsArr[activeCircuit].exerCycles + 1} of ${setNum}`
    
    exerciseTitleEl.textContent = `Now add some exercises!`

    populateCircuitSelect()
    
    if (circuitsArr.length > 0) {
        exerciseFormEl.classList.remove('hidden')
    }

})

selectCircuitEl.addEventListener('change', (e) => {
   updateCircuitArr()
})

function updateCircuitArr () {
    if (circuitsArr.length > 0) {
        let indexCircuit = circuitsArr.findIndex((circuit) => {
            return selectCircuitEl.value === circuit.id
        })
        activeCircuit = indexCircuit
        renderCurrentSetExerciseNum()
        console.log(indexCircuit)
        
        console.log(circuitsArr[indexCircuit])
    } else {
        activeCircuit = 0
    }
}