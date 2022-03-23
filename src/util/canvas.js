function randomNormal(o) {
  const copy = {
    mean: 0,
    dev: 1,
    pool: [],
    ...o,
  };
  let r;
  let a;
  let n;
  let e = 0;
  const l = copy.mean;
  const t = copy.dev;
  do {
    r = (a = 2 * Math.random() - 1) * a + (n = 2 * Math.random() - 1) * n;
  } while (r >= 1);
  e = a * Math.sqrt((-2 * Math.log(r)) / r);
  return t * e + l;
}

function rand(low, high) {
  return Math.random() * (high - low) + low;
}

class CanvasAnimate {
  constructor(id) {
    this.canvas = document.getElementById(id);
    // this.canvas.width = this.canvas.width * window.devicePixelRatio;
    // this.canvas.height = this.canvas.height * window.devicePixelRatio;
    this.canvas.width = this.canvas.parentNode.offsetWidth;
    this.canvas.height = this.canvas.parentNode.offsetHeight;
    this.ctx = this.canvas.getContext('2d');
    this.NUM_PARTICLES = 200;
    this.PARTICLE_SIZE = 0.22;
    this.SPEED = 55000;
    this.particles = [];

    this.timeId = null;

    this.init();
  }

  init() {
    for (let i = 0; i < this.NUM_PARTICLES; i++) {
      this.particles.push(this.createParticle(i));
    }
  }

  // eslint-disable-next-line class-methods-use-this
  createParticle(i) {
    const colour = {
      r: 122,
      // g: randomNormal({ mean: 125, dev: 20 }),
      g: 122,
      // g: 255,
      b: 168,
      a: rand(0.2, 0.8),
    };
    const rd = Math.floor(60 * Math.random()) + 20;
    return {
      id: i,
      flash: 0,
      flashOrigin: rd,
      flashSpeed: Math.random(),
      x: -2,
      y: -2,
      diameter: Math.max(0, randomNormal(
        { mean: this.PARTICLE_SIZE, dev: this.PARTICLE_SIZE / 2 },
      )),
      duration: randomNormal({ mean: this.SPEED, dev: this.SPEED * 0.1 }),
      amplitude: randomNormal({ mean: 16, dev: 2 }),
      offsetY: randomNormal({ mean: 0, dev: 10 }),
      arc: Math.PI * 2,
      startTime: performance.now() - rand(0, this.SPEED),
      colour: `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  moveParticle(particle, time) {
    const progress = ((time - particle.startTime) % particle.duration) / particle.duration;
    return {
      ...particle,
      x: progress,
      // y: 30,
      y: ((Math.sin(progress * particle.arc) * particle.amplitude) + particle.offsetY),
    };
  }

  drawParticle(particle) {
    if (particle.id < 10) {
      if (particle.flash > particle.flashOrigin) {
        particle.flashSpeed = 1;
      }
      if (particle.flash < -particle.flashOrigin) {
        particle.flashSpeed = -1;
      }
      particle.flash -= particle.flashSpeed;
      if (particle.flash > 0) {
        this.ctx.fillStyle = particle.colour;
      } else {
        this.ctx.fillStyle = '#fff';
      }
    } else {
      this.ctx.fillStyle = particle.colour;
    }

    const vh = this.canvas.height / 100;
    this.ctx.beginPath();
    this.ctx.ellipse(
      particle.x * this.canvas.width,
      particle.y * vh + (this.canvas.height / 2),
      particle.diameter * vh,
      particle.diameter * vh,
      0,
      0,
      2 * Math.PI,
    );
    this.ctx.fill();
  }

  draw(time) {
    // Move particles
    this.particles.forEach((particle, index) => {
      this.particles[index] = this.moveParticle(particle, time);
    });

    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw the particles
    this.particles.forEach((particle) => {
      this.drawParticle(particle);
    });

    // Schedule next frame
    this.timeId = requestAnimationFrame((t) => this.draw(t));
  }

  destroy() {
    cancelAnimationFrame(this.timeId);
    this.particles.length = 0;
  }

  update() {
    this.canvas.width = this.canvas.parentNode.offsetWidth;
    this.canvas.height = this.canvas.parentNode.offsetHeight;
  }
}

export default CanvasAnimate;
