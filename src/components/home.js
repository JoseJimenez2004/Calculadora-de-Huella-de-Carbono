document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const transitionScreen = document.querySelector('.transition-screen');
  const hoverSound = document.getElementById('hoverSound');
  const clickSound = document.getElementById('clickSound');
  const robots = document.querySelectorAll('.robot');
  
  // Configurar confeti
  const confettiSettings = {
    target: 'confetti-canvas',
    max: 150,
    size: 1.5,
    animate: true,
    props: ['circle', 'square', 'triangle', 'line'],
    colors: [[$color-primary, $color-secondary, $color-accent]],
    clock: 25,
    rotate: true,
    start_from_edge: true,
    respawn: true
  };
  
  const confetti = new ConfettiGenerator(confettiSettings);
  
  // Efectos de sonido
  startBtn.addEventListener('mouseenter', () => {
    hoverSound.currentTime = 0;
    hoverSound.play().catch(e => console.log("Sonido no pudo reproducirse:", e));
  });
  
  // Animación de inicio
  gsap.from('.hero-content', {
    duration: 1.5,
    y: 50,
    opacity: 0,
    ease: "power3.out"
  });
  
  // Animación de robots interactivos
  robots.forEach(robot => {
    robot.addEventListener('mouseenter', () => {
      gsap.to(robot, {
        y: -20,
        duration: 0.3,
        ease: "back.out"
      });
      
      gsap.to(robot.querySelector('.eye'), {
        scale: 1.3,
        duration: 0.2,
        yoyo: true,
        repeat: 1
      });
    });
    
    robot.addEventListener('mouseleave', () => {
      gsap.to(robot, {
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)"
      });
    });
  });
  
  // Efecto al hacer clic
  startBtn.addEventListener('click', () => {
    clickSound.currentTime = 0;
    clickSound.play().catch(e => console.log("Sonido no pudo reproducirse:", e));
    
    // Mostrar confeti
    confetti.render();
    
    // Animación de transición
    gsap.to(transitionScreen, {
      y: 0,
      duration: 1,
      ease: "power4.inOut",
      onComplete: () => {
        window.location.href = 'categories.html';
      }
    });
    
    // Animación de elementos al salir
    gsap.to('.title', {
      y: -100,
      opacity: 0,
      duration: 0.8,
      ease: "power3.in"
    });
    
    gsap.to('.subtitle', {
      y: -80,
      opacity: 0,
      duration: 0.8,
      ease: "power3.in",
      delay: 0.1
    });
    
    gsap.to('.cta-button', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.in",
      delay: 0.2
    });
  });
  
  // Efecto de cursor personalizado
  document.body.addEventListener('mousemove', (e) => {
    gsap.to('.earth-container', {
      x: e.clientX * 0.02,
      y: e.clientY * 0.02,
      duration: 1,
      ease: "power1.out"
    });
    
    gsap.to('.robot-squad', {
      x: e.clientX * 0.03,
      duration: 1.5,
      ease: "power1.out"
    });
  });
  
  // Efecto de flotación constante para el botón
  gsap.to(startBtn, {
    y: -10,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
});