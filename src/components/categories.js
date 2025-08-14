document.addEventListener('DOMContentLoaded', () => {
  const scroller = document.getElementById('islandsScroller');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const islands = document.querySelectorAll('.island');
  
  let currentIndex = 0;
  const islandWidth = 300; // Ancho de cada isla + margen
  const visibleIslands = Math.min(3, islands.length); // Mostrar 3 islas
  
  // Posicionar islas inicialmente
  function positionIslands() {
    const viewportWidth = document.querySelector('.islands-viewport').offsetWidth;
    const offset = (viewportWidth - (visibleIslands * islandWidth)) / 2;
    
    islands.forEach((island, index) => {
      // Activar islas visibles
      if (index >= currentIndex && index < currentIndex + visibleIslands) {
        island.style.opacity = '1';
        island.style.transform = 'translateZ(50px)';
        island.querySelector('.island-details').style.transform = 'translateY(0)';
      } else {
        island.style.opacity = '0.6';
        island.style.transform = 'translateZ(0)';
        island.querySelector('.island-details').style.transform = 'translateY(20px)';
      }
    });
    
    // Centrar el scroller
    scroller.style.transform = `translateX(${offset - (currentIndex * islandWidth)}px)`;
  }
  
  // Navegación
  function goToIsland(index) {
    currentIndex = Math.max(0, Math.min(index, islands.length - visibleIslands));
    positionIslands();
  }
  
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      goToIsland(currentIndex - 1);
    }
  });
  
  nextBtn.addEventListener('click', () => {
    if (currentIndex < islands.length - visibleIslands) {
      goToIsland(currentIndex + 1);
    }
  });
  
  // Efecto 3D con mouse
  document.addEventListener('mousemove', (e) => {
    const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
    
    islands.forEach(island => {
      if (island.style.opacity === '1') {
        gsap.to(island, {
          rotationY: xAxis,
          rotationX: yAxis,
          duration: 1,
          ease: "power1.out"
        });
      }
    });
  });
  
  // Efecto hover para botones
  document.querySelectorAll('.explore-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, {
        y: -5,
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        y: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    btn.addEventListener('click', function() {
      const islandId = this.closest('.island').dataset.island;
      // Animación de clic
      gsap.to(this, {
        scale: 0.9,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        onComplete: () => {
          // Redirigir a la página específica
          window.location.href = `category-${islandId}.html`;
        }
      });
    });
  });
  
  // Inicialización
  positionIslands();
  
  // Animación de entrada
  gsap.from('.island', {
    y: 100,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    delay: 0.5,
    ease: "back.out"
  });
  
  gsap.from('.ocean', {
    height: 0,
    duration: 1.5,
    ease: "power3.out",
    delay: 0.3
  });
  
  gsap.from('.cloud', {
    opacity: 0,
    y: -50,
    duration: 1,
    stagger: 0.3,
    delay: 0.7
  });
});