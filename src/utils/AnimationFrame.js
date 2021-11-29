class AnimationFrame {
    constructor(fps = 60, animate, reference) {
        this.requestID = 0;
        this.fps = fps;
        this.animate = animate;
        this.reference = reference;
    }

    start() {
        let then = performance.now();
        const interval = 1000 / this.fps;
        const tolerance = 0.1;

        const animateLoop = (now) => {
            this.requestID = requestAnimationFrame(animateLoop);
            const delta = now - then;

            if (delta >= interval - tolerance) {
                then = now - (delta % interval);
                this.animate(delta, this.reference);
            }
        };
        this.requestID = requestAnimationFrame(animateLoop);
    }

    stop() {
        cancelAnimationFrame(this.requestID);
    }

}

export default AnimationFrame;