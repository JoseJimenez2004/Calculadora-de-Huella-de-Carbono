document.addEventListener('DOMContentLoaded', function() {
  // Datos para las descripciones de cada categoría
  const categoryData = {
    energy: {
      title: "Consumo de Energía",
      icon: "fa-bolt",
      color: "#ff9a3c",
      description: "El consumo de energía es uno de los principales contribuyentes a la huella de carbono. Esta categoría evalúa el impacto ambiental de tu consumo eléctrico, uso de combustibles fósiles y la integración de energías renovables en tu hogar o negocio.",
      subcategories: [
        "Electricidad: Consumo mensual en kWh y su origen (renovable o no renovable)",
        "Combustibles: Uso de gasolina, diésel, gas natural y otros combustibles fósiles",
        "Energías renovables: Integración de sistemas solares, eólicos u otras energías limpias"
      ]
    },
    transport: {
      title: "Transporte y Movilidad",
      icon: "fa-car",
      color: "#3c78d8",
      description: "El transporte es responsable de una parte significativa de las emisiones globales de CO₂. Esta sección calcula el impacto de tus desplazamientos diarios, viajes y logística de mercancías.",
      subcategories: [
        "Vehículos personales: Emisiones de automóviles, motocicletas y otros vehículos privados",
        "Transporte público: Uso de autobuses, trenes, metro y otros medios colectivos",
        "Viajes aéreos: Impacto de los vuelos nacionales e internacionales",
        "Logística: Emisiones relacionadas con el transporte de mercancías y paquetería"
      ]
    },
    materials: {
      title: "Materiales y Recursos",
      icon: "fa-box-open",
      color: "#6d4c41",
      description: "La producción y gestión de materiales tiene un impacto ambiental significativo. Esta categoría analiza el ciclo de vida de los productos que utilizas, desde la extracción de materias primas hasta la gestión de residuos.",
      subcategories: [
        "Materias primas: Extracción y procesamiento de recursos naturales",
        "Productos manufacturados: Bienes de consumo y su huella de carbono incorporada",
        "Residuos: Gestión de desechos, reciclaje y vertederos",
        "Economía circular: Reutilización y reparación de productos"
      ]
    },
    services: {
      title: "Servicios Digitales y Corporativos",
      icon: "fa-laptop",
      color: "#9c64a6",
      description: "En la era digital, los servicios en línea y las operaciones corporativas también generan una huella de carbono. Esta sección evalúa el impacto de tu actividad digital, servicios contratados e infraestructura utilizada.",
      subcategories: [
        "Servicios digitales: Almacenamiento en la nube, streaming y uso de internet",
        "Operaciones de oficina: Consumo de recursos en entornos corporativos",
        "Infraestructura: Edificios, centros de datos y equipamientos",
        "Telecomunicaciones: Redes y dispositivos de comunicación"
      ]
    }
  };

  // Elementos del DOM
  const modal = document.getElementById('descriptionModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalIcon = document.getElementById('modalIcon');
  const modalDescription = document.getElementById('modalDescription');
  const modalSubcategories = document.getElementById('modalSubcategories');
  const closeModal = document.querySelector('.close-modal');
  const continueBtn = document.querySelector('.continue-btn');
  const calculateButtons = document.querySelectorAll('.calculate-btn');

  // Función para abrir el modal con la información de la categoría
  function openModal(category) {
    const data = categoryData[category];
    
    // Actualizar el contenido del modal
    modalTitle.textContent = data.title;
    modalIcon.className = `fas ${data.icon}`;
    modalDescription.textContent = data.description;
    
    // Establecer el color según la categoría
    document.querySelector('.category-icon-large').style.backgroundColor = data.color;
    
    // Limpiar y agregar subcategorías
    modalSubcategories.innerHTML = '';
    data.subcategories.forEach(sub => {
      const li = document.createElement('li');
      li.textContent = sub;
      modalSubcategories.appendChild(li);
    });
    
    // Mostrar el modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    
    // Animación con GSAP
    gsap.fromTo('.modal-content', 
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
  }

  // Función para cerrar el modal
  function closeModalFunc() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restaurar scroll del body
    
    // Animación con GSAP
    gsap.to('.modal-content', {
      y: -50,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in'
    });
  }

  // Event listeners para los botones de calcular
  calculateButtons.forEach(button => {
    button.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      
      // Animación al hacer clic
      gsap.to(this, {
        y: -5,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut'
      });
      
      // Abrir el modal después de un breve retraso
      setTimeout(() => {
        openModal(category);
      }, 300);
    });
  });

  // Event listeners para cerrar el modal
  closeModal.addEventListener('click', closeModalFunc);
  continueBtn.addEventListener('click', closeModalFunc);
  
  // Cerrar modal al hacer clic fuera del contenido
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModalFunc();
    }
  });

  // Cerrar modal con la tecla Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModalFunc();
    }
  });

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

  // Iniciar animación de la hoja en el header
  gsap.to('.eco-leaf', {
    y: -5,
    duration: 2,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut"
  });
});