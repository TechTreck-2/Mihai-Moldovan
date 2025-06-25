import { Component, Input, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { trigger, state, style, animate, transition } from "@angular/animations"

@Component({
  selector: "app-sand-animation",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./sand-animation.component.html",
  styleUrls: ["./sand-animation.component.scss"],
  animations: [
    trigger("rotateHand", [
      state("start", style({ transform: "rotate(0deg)" })),
      state("end", style({ transform: "rotate(360deg)" })),
      transition("start => end", animate("{{duration}}ms linear")),
    ]),
  ],
})
export class SandAnimationComponent implements OnInit, OnDestroy {
  @Input() duration = 60000

  animationState = "start"
  isPaused = false
  elapsedTime = 0
  startTime = 0
  pauseTime = 0
  animationParams = { duration: this.duration }

  private timer: any
  private requestId: number | null = null

  ngOnInit() {
    this.startAnimation()
  }

  ngOnDestroy() {
    this.stopAnimation()
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  startAnimation() {
    this.isPaused = false
    this.animationState = "start"
    this.animationParams = { duration: this.duration }

    this.startTime = performance.now() - this.elapsedTime
    this.animate()

    this.timer = setInterval(() => {
      if (!this.isPaused) {
        const currentTime = performance.now()
        this.elapsedTime = currentTime - this.startTime

        if (this.elapsedTime >= this.duration) {
          this.elapsedTime = this.duration
          clearInterval(this.timer)
        }
      }
    }, 100)

    setTimeout(() => {
      this.animationState = "end"
    }, 50)
  }

  animate() {
    if (this.isPaused) return

    const currentTime = performance.now()
    this.elapsedTime = currentTime - this.startTime

    if (this.elapsedTime < this.duration) {
      this.requestId = requestAnimationFrame(() => this.animate())
    } else {
      this.elapsedTime = this.duration
    }
  }

  pauseAnimation() {
    if (this.isPaused) return

    this.isPaused = true
    this.pauseTime = performance.now()

    if (this.requestId) {
      cancelAnimationFrame(this.requestId)
      this.requestId = null
    }
  }

  resumeAnimation() {
    if (!this.isPaused) return

    this.isPaused = false

    const pauseDuration = performance.now() - this.pauseTime
    this.startTime += pauseDuration

    this.animate()
  }

  stopAnimation() {
    this.isPaused = true
    if (this.requestId) {
      cancelAnimationFrame(this.requestId)
      this.requestId = null
    }
  }

  resetAnimation() {
    this.stopAnimation()
    this.elapsedTime = 0
    this.startAnimation()
  }

  formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000) % 60
    const minutes = Math.floor(ms / 60000)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  getProgressPercentage(): number {
    return (this.elapsedTime / this.duration) * 100
  }

  getFormattedPercentage(): string {
    return Math.min(Math.round(this.getProgressPercentage()), 100) + "%"
  }
}

