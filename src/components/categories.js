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
          case 'tecnologia':
            window.location.href = 'calculator.html';
            break;
          // Aquí puedes añadir las demás categorías
          default:
            window.location.href = 'calculator.html';
        }
      }, 400);
    });
  });
});