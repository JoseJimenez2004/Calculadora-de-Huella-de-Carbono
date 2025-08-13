document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.category-card');
  
  cards.forEach(card => {
    card.addEventListener('click', () => {
      // Efecto de clic
      card.style.transform = 'scale(0.95)';
      setTimeout(() => {
        card.style.transform = 'translateY(-10px)';
      }, 200);
      
      // Redirección según categoría
      const category = card.getAttribute('data-category');
      setTimeout(() => {
        switch(category) {
          case 'servidores-fisicos':
            window.location.href = 'servidores-fisicos.html';
            break;
          case 'servidores-nube':
            window.location.href = 'servidores-nube.html';
            break;
          case 'laptops':
            window.location.href = 'laptops.html';
            break;
          case 'desktops':
            window.location.href = 'desktops.html';
            break;
          case 'celulares':
            window.location.href = 'celulares.html';
            break;
          case 'instalaciones':
            window.location.href = 'instalaciones.html';
            break;
          case 'tablets':
            window.location.href = 'tablets.html';
            break;
          case 'transporte':
            window.location.href = 'transporte.html';
            break;
          default:
            window.location.href = 'calculator.html';
        }
      }, 400);
    });
  });
});