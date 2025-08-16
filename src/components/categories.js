document.addEventListener('DOMContentLoaded', function() {
  // Animación inicial
  gsap.from('.eco-header', {
    duration: 1,
    y: -100,
    opacity: 0,
    ease: 'power2.out'
  });

  gsap.from('.eco-category', {
    duration: 0.8,
    y: 50,
    opacity: 0,
    stagger: 0.2,
    ease: 'back.out(1.2)',
    delay: 0.3
  });

  gsap.from('.results-panel', {
    duration: 1,
    y: 50,
    opacity: 0,
    ease: 'power2.out',
    delay: 0.8
  });

  // Efectos hover para categorías
  const categories = document.querySelectorAll('.eco-category');
  categories.forEach(category => {
    category.addEventListener('mouseenter', () => {
      gsap.to(category, {
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    category.addEventListener('mouseleave', () => {
      gsap.to(category, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });

  // Efectos hover para subcategorías
  const subcategories = document.querySelectorAll('.subcategory');
  subcategories.forEach(sub => {
    sub.addEventListener('mouseenter', () => {
      gsap.to(sub, {
        backgroundColor: '#e8f5e9',
        duration: 0.3
      });
      gsap.to(sub.querySelector('.progress-leaf'), {
        rotation: 360,
        duration: 0.6,
        ease: 'power2.out'
      });
    });

    sub.addEventListener('mouseleave', () => {
      gsap.to(sub, {
        backgroundColor: 'var(--lighter-green)',
        duration: 0.3
      });
    });
  });

  // Efectos para botones
  const buttons = document.querySelectorAll('.eco-btn');
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, {
        scale: 1.05,
        duration: 0.2,
        ease: 'power2.out'
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
      });
    });
  });

  // Simulación de cálculo (para demostración)
  const calculateButtons = document.querySelectorAll('.calculate-btn');
  calculateButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const category = this.closest('.eco-category');
      
      // Animación al hacer clic
      gsap.to(category, {
        y: -10,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut'
      });

      // Simular cálculo
      simulateCalculation();
    });
  });

  function simulateCalculation() {
    // Actualizar el total
    gsap.to('.co2-amount', {
      innerText: "5.42",
      duration: 1.5,
      snap: { innerText: 0.01 },
      ease: "power2.out"
    });

    // Animar las barras de gráfico
    gsap.to('.energy-bar::after', {
      width: '65%',
      duration: 1.5,
      ease: "power2.out",
      delay: 0.2
    });

    gsap.to('.transport-bar::after', {
      width: '45%',
      duration: 1.5,
      ease: "power2.out",
      delay: 0.4
    });

    gsap.to('.materials-bar::after', {
      width: '30%',
      duration: 1.5,
      ease: "power2.out",
      delay: 0.6
    });

    gsap.to('.services-bar::after', {
      width: '20%',
      duration: 1.5,
      ease: "power2.out",
      delay: 0.8
    });

    // Actualizar comparaciones
    gsap.to('.comparison-item:nth-child(1) .highlight', {
      innerText: "12",
      duration: 1.5,
      snap: { innerText: 1 },
      delay: 1
    });

    gsap.to('.comparison-item:nth-child(2) .highlight', {
      innerText: "2,450",
      duration: 1.5,
      snap: { innerText: 10 },
      delay: 1
    });

    // Animación de la Tierra
    gsap.to('.earth-icon', {
      rotation: 360,
      duration: 3,
      ease: "none",
      repeat: -1
    });
  }

  // Iniciar animación de la hoja en el header
  gsap.to('.eco-leaf', {
    y: -5,
    duration: 2,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut"
  });
});