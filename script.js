const segments = [
    { duration: 2, description: "Reporter prepares presentation" },
    { duration: 10, description: "Reporter presents" },
    { duration: 2, description: "Opponent questions reporter" },
    { duration: 4, description: "Opponent prepares presentation" },
    { duration: 12, description: "Opponent leads discussion with reporter" },
    { duration: 1, description: "Opponent summarises" },
    { duration: 1, description: "Reporter concludes" },
    { duration: 10, description: "Jurors question" },
    { duration: 5, description: "Juror write comments and scores" },
    { duration: 5, description: "Open scoring, comments and feedback" }
]

const alarm = document.getElementById("alarmSound");
const track = document.getElementById("timerContainer");
let currentIndex = 0;
const timers = [];

class Timer {
    constructor(segment, index) {
        this.duration = segment.duration * 60;
        this.timeLeft = this.duration;
        this.index = index;
        this.description = segment.description;
        this.interval = null;
        this.isPaused = false;
        this.isComplete = false;

        this.element = this.createTimerElement();
        this.timeDisplay = this.element.querySelector(".time");
        this.progress = this.element.querySelector(".progress");
        this.startBtn = this.element.querySelector(".startBtn");
        this.pauseBtn = this.element.querySelector(".pauseBtn");
        this.resetBtn = this.element.querySelector(".resetBtn");

        this.updateDisplay();
        this.updateButtons("initial");
    }

    createTimerElement() {
        const div = document.createElement("div");
        const durationMins = this.duration / 60;
        const minuteLabel = durationMins <= 1 ? "minute" : "minutes";

        div.className = "timer-segment";
        div.innerHTML = `
        <div class="segment-title">Segment ${this.index + 1}: ${this.description}</div>
        <div class="segment-subtitle">${durationMins} ${minuteLabel}</div>
        <div class="time">00:00</div>
        <div class="progress-bar">
            <div class="progress"></div>
        </div>
        <div class="controls">
            <button class="startBtn">Start</button>
            <button class="pauseBtn">Pause</button>
            <button class="resetBtn">Reset</button>
        </div>
        `;

        div.querySelector(".startBtn").addEventListener("click", () => this.start());
        div.querySelector(".pauseBtn").addEventListener("click", () => this.pause());
        div.querySelector(".resetBtn").addEventListener("click", () => this.reset());

        return div;
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        const progressPercent = ((this.duration - this.timeLeft) / this.duration) * 100;
        this.progress.style.width = `${progressPercent}%`;
    }

    updateButtons(state) {
        const show = (btn) => btn.style.display = 'inline-block';
        const hide = (btn) => btn.style.display = 'none';

        switch (state) {
            case 'initial':
                show(this.startBtn);
                hide(this.pauseBtn);
                hide(this.resetBtn);
                break;
            case 'running':
                hide(this.startBtn);
                this.pauseBtn.textContent = 'Pause';
                show(this.pauseBtn);
                show(this.resetBtn);
                break;
            case 'paused':
                hide(this.startBtn);
                this.pauseBtn.textContent = 'Resume';
                show(this.pauseBtn);
                show(this.resetBtn);
                break;
            case 'complete':
                hide(this.startBtn);
                hide(this.pauseBtn);
                show(this.resetBtn);
                break;
        }
    }

    start() {
        if(!this.interval && !this.isComplete) {
            this.interval = setInterval(() => {
                this.timeLeft--;
                this.updateDisplay();
                if(this.timeLeft <= 0) this.complete();
            }, 1000);
            this.isPaused = false;
            this.updateButtons("running");
        }
    }

    pause() {
        if(this.interval){
            clearInterval(this.interval);
            this.interval = null;
            this.isPaused = true;
            this.updateButtons("paused");
        } else if (this.isPaused && !this.isComplete){
            this.start();
        }

    }

    reset() {
        clearInterval(this.interval);
        this.interval = null;
        this.timeLeft = this.duration;
        this.isPaused = false;
        this.isComplete = false;
        this.updateDisplay();
        this.progress.style.width = "0%";
        this.element.classList.remove("complete");
        this.updateButtons("initial");
        alarm.pause();
        alarm.currentTime = 0;
    }

    complete() {
        clearInterval(this.interval);
        this.interval = null;
        this.isComplete = true;
        this.updateDisplay();
        this.updateButtons("complete");
        alarm.currentTime = 0;
        alarm.play().catch(() => { });
    }
}

timers.forEach((timer, i) => {
    timer.element.style.animationDelay = `${i * 0.15}s`;
})

segments.forEach((segment, i) => {
    const timer = new Timer(segment, i);
    timers.push(timer);
    track.appendChild(timer.element)
})

function updateCarousel() {
    const children = Array.from(track.children);
    children.forEach((child, i) => {
        child.style.display = i === currentIndex ? "block" : "none";
    });

    document.getElementById("prevBtn").disabled = (currentIndex === 0);
    document.getElementById("nextBtn").disabled = (currentIndex === segments.length - 1);
}

document.getElementById("prevBtn").addEventListener("click", () => {
    if(currentIndex > 0) {
        currentIndex--;
        updateCarousel();
    }
});

document.getElementById("nextBtn").addEventListener("click", () => {
    if(currentIndex < timers.length - 1) {
        currentIndex++;
        updateCarousel();
    }
});

updateCarousel();
