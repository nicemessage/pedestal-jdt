
// eslint-disable-next-line max-classes-per-file
const random = (min = 0, max = 0) => {
  if (min > max) {
    [min, max] = [max, min];
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
const maxOrbit = (x, y) => {
  const max = Math.max(x, y);
  const diameter = Math.round(Math.sqrt(max * max + max * max));
  return diameter / 2;
};

class Start {
  constructor(w, h, ctx, canvas2, maxStars) {
    this.orbitRadius = random(maxOrbit(w, h));
    this.radius = random(60, this.orbitRadius) / 8;
    // 星星大小
    this.orbitX = w / 2;
    this.orbitY = h / 2;
    this.timePassed = random(0, maxStars);
    this.speed = random(this.orbitRadius) / 80000;
    // 星星移动速度
    this.alpha = random(1, 10) / 10;
    this.ctx = ctx;
    this.canvas2 = canvas2;
  }

  draw() {
    const x = Math.sin(this.timePassed) * this.orbitRadius + this.orbitX;
    const y = Math.cos(this.timePassed) * this.orbitRadius + this.orbitY;
    const twinkle = random(10);

    if (twinkle === 1 && this.alpha > 0) {
      this.alpha -= 0.05;
    } else if (twinkle === 2 && this.alpha < 1) {
      this.alpha += 0.05;
    }
    this.ctx.globalAlpha = this.alpha;
    this.ctx.drawImage(this.canvas2, x - this.radius / 2,
      y - this.radius / 2, this.radius, this.radius);
    this.timePassed += this.speed;
  }
}

class StartAnimation {
  constructor(id) {
    this.id = id;
    this.hue = 217;
    this.stars = [];
    this.maxStars = 1000;
    this.count = 0;
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext('2d');
    const ele = document.getElementsByClassName('index-banner')[0];
    this.w = this.canvas.width = ele.clientWidth;
    this.h = this.canvas.height = ele.clientHeight;

    this.init();
    for (let i = 0; i < this.maxStars; i++) {
      this.stars[i] = new Start(
        this.w,
        this.h,
        this.ctx,
        this.canvas2,
        this.maxStars,
      );
    }
  }

  init() {
    const canvas2 = document.createElement('canvas');
    const ctx2 = canvas2.getContext('2d');
    canvas2.width = 100;
    canvas2.height = 100;
    const half = canvas2.width / 2;
    const gradient2 = ctx2.createRadialGradient(half, half, 0, half, half, half);
    gradient2.addColorStop(0.025, '#CCC');
    gradient2.addColorStop(0.1, `hsl(${this.hue}, 61%, 33%)`);
    gradient2.addColorStop(0.25, `hsl(${this.hue}, 64%, 6%)`);
    gradient2.addColorStop(1, 'transparent');

    ctx2.fillStyle = gradient2;
    ctx2.beginPath();
    ctx2.arc(half, half, half, 0, Math.PI * 2);
    ctx2.fill();

    this.canvas2 = canvas2;
  }

  animation() {
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.globalAlpha = 0.5; // 尾巴
    this.ctx.fillStyle = `hsla(${this.hue}, 64%, 6%, 1)`;
    this.ctx.fillRect(0, 0, this.w, this.h);

    this.ctx.globalCompositeOperation = 'lighter';
    for (let i = 1, l = this.stars.length; i < l; i++) {
      this.stars[i].draw();
    }

    this.timeId = window.requestAnimationFrame(() => this.animation());
  }

  destroy() {
    window.cancelAnimationFrame(this.timeId);
    this.stars.length = 0;
    this.canvas2 = null;
    this.canvas = null;
  }
}

export default StartAnimation;
