document.addEventListener('DOMContentLoaded', function() {
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    (function initParticles(){
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) return;
        const container = document.getElementById('hero-particles');
        if (!container) return;
        const count = Math.min(40, Math.floor(window.innerWidth / 30));
        for (let i = 0; i < count; i++){
            const p = document.createElement('span');
            p.className = 'particle';
            const x = Math.random() * window.innerWidth;
            const s = (Math.random() * 0.8) + 0.4;
            const dx = (Math.random() - 0.5) * 80;
            const dur = (Math.random() * 12) + 12;
            p.style.setProperty('--x', `${x}px`);
            p.style.setProperty('--s', s.toFixed(2));
            p.style.setProperty('--dx', `${dx.toFixed(1)}px`);
            p.style.animationDuration = `${dur.toFixed(1)}s`;
            p.style.background = `rgba(167,139,250,${(Math.random()*0.4+0.3).toFixed(2)})`;
            container.appendChild(p);
        }
    })();

    let lastScrollY = window.scrollY;
    const header = document.querySelector('.site-header');
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Add stagger effect to children if they exist
                const children = entry.target.querySelectorAll('*');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0)';
                    }, index * 50);
                });
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.feature, .product-card, .social-card, .server-card, .tier-card');
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.7s cubic-bezier(.22,.61,.36,1), transform 0.7s cubic-bezier(.22,.61,.36,1)';
        observer.observe(el);
        el.style.animationDelay = `${index * 0.1}s`;
        el.classList.add('fade-in');
    });

    const heroElements = document.querySelectorAll('.hero, .store-hero');
    // Hint the browser for smoother transforms
    heroElements.forEach(el => {
        el.style.willChange = 'transform';
    });
    
    // Smooth, eased parallax using requestAnimationFrame
    let targetParallax = 0;
    let currentParallax = 0;
    const parallaxStrength = -0.3; // softer than before
    const parallaxEase = 0.08; // lower = softer

    function updateParallax() {
        currentParallax += (targetParallax - currentParallax) * parallaxEase;
        heroElements.forEach(hero => {
            if (hero.getBoundingClientRect().bottom > 0) {
                hero.style.transform = `translateY(${currentParallax}px)`;
            }
        });
        requestAnimationFrame(updateParallax);
    }

    updateParallax();

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        targetParallax = scrolled * parallaxStrength;
    }, { passive: true });

    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.style.transition = 'transform 200ms cubic-bezier(.22,.61,.36,1)';
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        btn.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0) scale(0.98)';
        });
        
        btn.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
    });

    const cards = document.querySelectorAll('.product-card, .feature, .social-card, .server-card, .tier-card');
    
    cards.forEach(card => {
        card.style.transition = 'transform 250ms cubic-bezier(.22,.61,.36,1)';
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20; // softer tilt
            const rotateY = (centerX - x) / 20; // softer tilt
            
            this.style.transform = `translateY(-6px) scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1) rotateX(0deg) rotateY(0deg)';
        });
    });



    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transform = 'scale(1.1)';
        img.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        img.addEventListener('load', function() {
            this.style.opacity = '1';
            this.style.transform = 'scale(1)';
        });
        
        if (img.complete) {
            img.style.opacity = '1';
            img.style.transform = 'scale(1)';
        }
    });

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link, index) => {
        link.style.animationDelay = `${index * 0.1}s`;
        link.classList.add('fade-in');
    });

    const style = document.createElement('style');
    style.textContent = `
        .fade-in {
            animation: fadeInUp 0.6s ease both;
        }
        
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
    document.head.appendChild(style);
});
