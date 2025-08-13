document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const transitionScreen = document.querySelector('.transition-screen');
  
  startBtn.addEventListener('click', () => {
    // Animación de transición
    transitionScreen.style.transition = 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)';
    transitionScreen.style.transform = 'translateY(0)';
    
    // Redirección después de la animación
    setTimeout(() => {
      window.location.href = 'categories.html';
    }, 800);
  });
  
  // Efecto de flotación para el botón
  setInterval(() => {
    startBtn.style.transform = 'translateY(-5px)';
    setTimeout(() => {
      startBtn.style.transform = 'translateY(0)';
    }, 1500);
  }, 3000);
});