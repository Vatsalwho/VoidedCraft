document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const particlesContainer = document.getElementById('particles-js');
  
  if (!particlesContainer) return;
  
  // Set canvas size
  function resizeCanvas() {
    canvas.width = particlesContainer.offsetWidth;
    canvas.height = particlesContainer.offsetHeight;
  }
  
  // Initialize canvas
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  particlesContainer.appendChild(canvas);
  
  // Handle window resize
  window.addEventListener('resize', function() {
    resizeCanvas();
    initParticles();
  });
  
  // Particle class
  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height;
      this.x = Math.random() * canvas.width;
    }
    
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 100;
      this.size = Math.random() * 2 + 1;
      this.speed = Math.random() * 0.5 + 0.2;
      this.opacity = Math.random() * 0.6 + 0.1;
      this.color = `rgba(167, 139, 250, ${this.opacity})`;
    }
    
    update() {
      this.y -= this.speed;
      
      // Reset particle when it goes off screen
      if (this.y < -10) {
        this.reset();
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      
      // Add glow effect
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
  }
  
  // Create particles
  let particles = [];
  const particleCount = Math.floor(window.innerWidth / 10);
  
  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
      // Stagger the initial positions
      particles[i].y = Math.random() * canvas.height;
    }
  }
  
  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });
    
    requestAnimationFrame(animate);
  }
  
  // Start the animation
  resizeCanvas();
  initParticles();
  animate();
});
