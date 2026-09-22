/**
 * SkyPulse Ambient Weather Particle System
 * Renders atmospheric background effects (Rain, Snow, Twinkling Stars, Floating Mist)
 * on a high-performance HTML5 canvas.
 */

class WeatherAtmosphere {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.category = 'clear';
    this.isDay = true;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);

    window.addEventListener('resize', this.resize);
    this.resize();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.initParticles();
  }

  setWeatherState(category, isDay) {
    this.category = category;
    this.isDay = isDay;
    this.initParticles();
    if (!this.animationId) {
      this.render();
    }
  }

  initParticles() {
    this.particles = [];
    const count = this.getParticleCount();

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  getParticleCount() {
    if (this.category === 'rain') return 120;
    if (this.category === 'snow') return 90;
    if (this.category === 'thunderstorm') return 140;
    if (!this.isDay) return 80; // stars
    return 35; // gentle ambient daylight motes
  }

  createParticle() {
    const w = this.width;
    const h = this.height;

    if (this.category === 'rain' || this.category === 'thunderstorm') {
      return {
        type: 'rain',
        x: Math.random() * w,
        y: Math.random() * h,
        speed: 9 + Math.random() * 8,
        length: 12 + Math.random() * 14,
        opacity: 0.2 + Math.random() * 0.4
      };
    }

    if (this.category === 'snow') {
      return {
        type: 'snow',
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 1.5 + Math.random() * 2.5,
        speed: 0.8 + Math.random() * 1.5,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.02,
        opacity: 0.3 + Math.random() * 0.6
      };
    }

    if (!this.isDay) {
      return {
        type: 'star',
        x: Math.random() * w,
        y: Math.random() * (h * 0.85),
        radius: 0.8 + Math.random() * 1.4,
        alpha: Math.random(),
        alphaSpeed: 0.008 + Math.random() * 0.015,
        alphaDir: Math.random() > 0.5 ? 1 : -1
      };
    }

    // Default warm daytime motes
    return {
      type: 'mote',
      x: Math.random() * w,
      y: Math.random() * h,
      radius: 1 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.2 - Math.random() * 0.3,
      opacity: 0.15 + Math.random() * 0.25
    };
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      if (p.type === 'rain') {
        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity})`;
        this.ctx.lineWidth = 1.2;
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x - 2, p.y + p.length);
        this.ctx.stroke();

        p.y += p.speed;
        p.x -= 1.5;

        if (p.y > this.height) {
          p.y = -p.length;
          p.x = Math.random() * (this.width + 50);
        }
      } else if (p.type === 'snow') {
        this.ctx.beginPath();
        this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        this.ctx.arc(p.x + Math.sin(p.sway) * 8, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();

        p.y += p.speed;
        p.sway += p.swaySpeed;

        if (p.y > this.height) {
          p.y = -p.radius * 2;
          p.x = Math.random() * this.width;
        }
      } else if (p.type === 'star') {
        p.alpha += p.alphaSpeed * p.alphaDir;
        if (p.alpha >= 1) {
          p.alpha = 1;
          p.alphaDir = -1;
        } else if (p.alpha <= 0.15) {
          p.alpha = 0.15;
          p.alphaDir = 1;
        }

        this.ctx.beginPath();
        this.ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.75})`;
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.type === 'mote') {
        this.ctx.beginPath();
        this.ctx.fillStyle = `rgba(254, 240, 138, ${p.opacity})`;
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.y < 0) {
          p.y = this.height + 5;
          p.x = Math.random() * this.width;
        }
      }
    }

    this.animationId = requestAnimationFrame(this.render);
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', this.resize);
  }
}

export function initWeatherAtmosphere(canvasId) {
  return new WeatherAtmosphere(canvasId);
}
