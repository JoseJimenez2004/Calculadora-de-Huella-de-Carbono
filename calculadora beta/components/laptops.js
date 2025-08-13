document.addEventListener('DOMContentLoaded', function() {
  // Accedemos a los datos desde el objeto global
  const { components, countries } = window.CalculatorData;
  const { jsPDF } = window.jspdf;

  // Elementos del DOM
  const componentCategory = document.getElementById('componentCategory');
  const componentSelect = document.getElementById('componentSelect');
  const addComponentBtn = document.getElementById('addComponent');
  const selectedComponentsList = document.querySelector('.selected-components .components-list');
  const tdpTotalSpan = document.getElementById('tdpTotal');
  const tdpGauge = document.getElementById('tdpGauge');
  const hoursInput = document.getElementById('hours');
  const hoursValue = document.getElementById('hoursValue');
  const countrySelect = document.getElementById('country');
  const includeManufacturing = document.getElementById('includeManufacturing');
  const co2Result = document.getElementById('co2Result');
  const equivalent = document.getElementById('equivalent');
  const chartContainer = document.getElementById('impactChart');
  const graphLegend = document.getElementById('graphLegend');
  const generateBtn = document.getElementById('generateReport');
  const resetBtn = document.getElementById('resetCalculator');
  const componentsCount = document.getElementById('componentsCount');

  // Estado de la aplicación
  const state = {
    selectedComponents: [],
    lifespan: 5, // años
    maxTDP: 800 // Para el medidor visual
  };

  // Mapeo de nombres de categorías
  const categoryNames = {
    cpu: "CPU",
    gpu: "GPU",
    ram: "RAM",
    storage: "Almacenamiento",
    psu: "Fuente de Poder"
  };

  // Colores para gráficos
  const chartColors = [
    '#2ECC71', '#3498DB', '#9B59B6', '#E74C3C', 
    '#F39C12', '#1ABC9C', '#34495E', '#E91E63'
  ];

  // Inicialización
  init();

  function init() {
    populateCountrySelect();
    setupEventListeners();
    updateComponentsCount();
  }

  function setupEventListeners() {
    // Selector de categoría
    componentCategory.addEventListener('change', updateComponentSelect);
    
    // Selector de componente
    componentSelect.addEventListener('change', function() {
      addComponentBtn.disabled = !this.value;
    });
    
    // Botón añadir componente
    addComponentBtn.addEventListener('click', addSelectedComponent);
    
    // Parámetros de uso
    hoursInput.addEventListener('input', updateHoursValue);
    countrySelect.addEventListener('change', calculateFootprint);
    includeManufacturing.addEventListener('change', calculateFootprint);
    
    // Botones de acción
    generateBtn.addEventListener('click', generatePDF);
    resetBtn.addEventListener('click', resetCalculator);
  }

  // Actualizar select de componentes según categoría seleccionada
  function updateComponentSelect() {
    const category = componentCategory.value;
    componentSelect.innerHTML = '<option value="">Selecciona un componente</option>';
    
    if (category && components[category]) {
      componentSelect.disabled = false;
      
      // Ordenar componentes alfabéticamente
      const sortedComponents = Object.entries(components[category])
        .sort((a, b) => a[0].localeCompare(b[0]));
      
      sortedComponents.forEach(([name, data]) => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        option.dataset.tdp = data.tdp;
        option.dataset.co2 = data.co2Manufacturing;
        componentSelect.appendChild(option);
      });
    } else {
      componentSelect.disabled = true;
      addComponentBtn.disabled = true;
    }
  }

  // Añadir componente seleccionado
  function addSelectedComponent() {
    const category = componentCategory.value;
    const componentName = componentSelect.value;
    
    if (!category || !componentName) return;
    
    const componentData = components[category][componentName];
    const componentId = `${category}-${componentName.replace(/\s+/g, '-')}`;
    
    // Evitar duplicados
    if (state.selectedComponents.some(c => c.id === componentId)) {
      showToast(`${componentName} ya está seleccionado`);
      return;
    }
    
    state.selectedComponents.push({
      id: componentId,
      name: componentName,
      type: category,
      typeName: categoryNames[category],
      tdp: componentData.tdp,
      co2Manufacturing: componentData.co2Manufacturing
    });
    
    updateSelectedComponentsList();
    calculateFootprint();
    showToast(`${componentName} añadido`);
    
    // Resetear selects
    componentSelect.value = '';
    componentSelect.dispatchEvent(new Event('change'));
  }

  // Actualizar lista de componentes seleccionados
  function updateSelectedComponentsList() {
    selectedComponentsList.innerHTML = '';
    
    if (state.selectedComponents.length === 0) {
      selectedComponentsList.innerHTML = '<p class="empty-message">No hay componentes seleccionados</p>';
      updateComponentsCount();
      return;
    }
    
    state.selectedComponents.forEach((component, index) => {
      const componentItem = document.createElement('div');
      componentItem.className = 'component-item';
      componentItem.innerHTML = `
        <div class="component-info">
          <span class="component-name">${component.name}</span>
          <span class="component-type">${component.typeName}</span>
        </div>
        <div class="component-values">
          <span class="component-tdp">${component.tdp}W</span>
          <span class="remove-item" data-id="${component.id}">×</span>
        </div>
      `;
      
      // Animación al añadir
      gsap.from(componentItem, {
        x: -20,
        opacity: 0,
        duration: 0.3,
        delay: index * 0.05
      });
      
      selectedComponentsList.appendChild(componentItem);
    });
    
    // Event listeners para eliminar
    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        removeComponent(id);
      });
    });
    
    updateComponentsCount();
  }

  // Eliminar componente
  function removeComponent(id) {
    state.selectedComponents = state.selectedComponents.filter(c => c.id !== id);
    updateSelectedComponentsList();
    calculateFootprint();
  }

  // Actualizar contador de componentes
  function updateComponentsCount() {
    componentsCount.textContent = state.selectedComponents.length;
    gsap.from(componentsCount, {
      scale: 1.5,
      duration: 0.3,
      ease: "elastic.out(1, 0.5)"
    });
  }

  // Actualizar valor de horas de uso
  function updateHoursValue() {
    hoursValue.textContent = hoursInput.value;
    gsap.from(hoursValue, {
      scale: 1.3,
      duration: 0.3,
      ease: "elastic.out(1, 0.5)"
    });
    calculateFootprint();
  }

  // Calcular huella de carbono
  function calculateFootprint() {
    const totalWatts = state.selectedComponents.reduce((sum, comp) => sum + comp.tdp, 0);
    updateTDPDisplay(totalWatts);
    
    const hours = parseFloat(hoursInput.value) || 4;
    const energyMixFactor = countries[countrySelect.value] || 0.5;
    
    // CO2 operacional (uso diario)
    const operationalCO2 = (totalWatts * hours * 365 / 1000) * energyMixFactor;
    
    // CO2 de fabricación (amortizado en la vida útil)
    let manufacturingCO2 = 0;
    if (includeManufacturing.checked) {
      manufacturingCO2 = state.selectedComponents.reduce((sum, comp) => sum + comp.co2Manufacturing, 0) / state.lifespan;
    }
    
    const totalCO2 = operationalCO2 + manufacturingCO2;
    
    updateResultsDisplay(totalCO2);
    updateComparisonChart(totalCO2);
    drawPieChart(totalCO2);
  }

  // Actualizar visualización de TDP
  function updateTDPDisplay(totalWatts) {
    tdpTotalSpan.textContent = totalWatts;
    
    // Actualizar medidor visual
    const percentage = Math.min((totalWatts / state.maxTDP) * 100, 100);
    tdpGauge.style.background = `conic-gradient(${getGaugeColor(percentage)} ${percentage}%, ${getGaugeColor(percentage, true)} ${percentage}%)`;
    tdpGauge.textContent = `${percentage.toFixed(0)}%`;
    
    // Animación
    gsap.from(tdpTotalSpan, {
      scale: 1.3,
      duration: 0.3,
      ease: "elastic.out(1, 0.5)"
    });
  }

  // Obtener color del medidor según porcentaje
  function getGaugeColor(percentage, isBackground = false) {
    if (isBackground) return '#ECF0F1';
    if (percentage < 30) return '#2ECC71';
    if (percentage < 60) return '#F39C12';
    return '#E74C3C';
  }

  // Actualizar visualización de resultados
  function updateResultsDisplay(totalCO2) {
    co2Result.textContent = totalCO2.toFixed(1);
    
    // Calcular equivalencias
    const kmCar = (totalCO2 / 0.12).toFixed(1); // 0.12 kg CO2 por km en auto promedio
    const trees = (totalCO2 / 21.77).toFixed(1); // 1 árbol absorbe ~21.77 kg CO2 al año
    
    equivalent.innerHTML = `
      <i class="fas fa-leaf"></i>
      <span>Equivalente a ${kmCar} km en auto o ${trees} árboles necesarios para absorberlo</span>
    `;
    
    // Animación
    gsap.from(co2Result, {
      scale: 1.3,
      duration: 0.3,
      ease: "elastic.out(1, 0.5)"
    });
    gsap.from(equivalent, {
      y: 10,
      opacity: 0,
      duration: 0.5
    });
  }

  // Actualizar gráfico de comparación
  function updateComparisonChart(totalCO2) {
    const avgCO2 = 210; // kg CO2 promedio anual para desktop
    const yourPercentage = Math.min((totalCO2 / avgCO2) * 100, 100);
    
    // Actualizar barras
    document.querySelector('.your-bar .bar-fill').style.width = `${yourPercentage}%`;
    document.querySelector('.your-bar .bar-value').textContent = `${totalCO2.toFixed(1)} kg`;
    
    // Animación
    gsap.from('.your-bar .bar-fill', {
      scaleX: 0,
      duration: 1,
      ease: "power3.out"
    });
  }

  // Dibujar gráfico de pastel
  function drawPieChart(totalCO2) {
    chartContainer.innerHTML = '';
    graphLegend.innerHTML = '';
    
    if (state.selectedComponents.length === 0 || !totalCO2 || totalCO2 <= 0) {
      chartContainer.innerHTML = '<p class="empty-message">No hay datos para mostrar</p>';
      return;
    }
    
    // Calcular contribución de cada componente
    const hours = parseFloat(hoursInput.value) || 4;
    const energyMixFactor = countries[countrySelect.value] || 0.5;
    
    const contributions = state.selectedComponents.map((comp, index) => {
      // CO2 operacional
      const operational = (comp.tdp * hours * 365 / 1000) * energyMixFactor;
      
      // CO2 fabricación (si está incluido)
      const manufacturing = includeManufacturing.checked 
        ? comp.co2Manufacturing / state.lifespan 
        : 0;
      
      return {
        name: comp.name,
        type: comp.typeName,
        value: operational + manufacturing,
        color: chartColors[index % chartColors.length]
      };
    });
    
    // Filtrar componentes con contribución significativa (>1%)
    const significantContributions = contributions.filter(c => c.value > 0);
    
    // Crear leyenda
    significantContributions.forEach((comp, index) => {
      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';
      legendItem.innerHTML = `
        <span class="legend-color" style="background: ${comp.color}"></span>
        <span class="legend-name">${comp.name}</span>
        <span class="legend-value">${comp.value.toFixed(1)} kg</span>
      `;
      graphLegend.appendChild(legendItem);
      
      // Animación leyenda
      gsap.from(legendItem, {
        x: -20,
        opacity: 0,
        duration: 0.3,
        delay: index * 0.1
      });
    });
    
    // Crear gráfico de pastel con SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("class", "pie-chart");
    
    let cumulativePercent = 0;
    
    significantContributions.forEach(comp => {
      const percent = (comp.value / totalCO2) * 100;
      if (percent < 0.1) return;
      
      const startX = 50 + 50 * Math.cos(2 * Math.PI * cumulativePercent / 100);
      const startY = 50 + 50 * Math.sin(2 * Math.PI * cumulativePercent / 100);
      
      cumulativePercent += percent;
      
      const endX = 50 + 50 * Math.cos(2 * Math.PI * cumulativePercent / 100);
      const endY = 50 + 50 * Math.sin(2 * Math.PI * cumulativePercent / 100);
      
      const largeArcFlag = percent > 50 ? 1 : 0;
      
      const pathData = [
        `M 50 50`,
        `L ${startX} ${startY}`,
        `A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        `Z`
      ].join(' ');
      
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathData);
      path.setAttribute("fill", comp.color);
      path.setAttribute("stroke", "#fff");
      path.setAttribute("stroke-width", "0.5");
      
      // Tooltip
      path.setAttribute("data-tooltip", `${comp.name}: ${comp.value.toFixed(1)} kg (${percent.toFixed(1)}%)`);
      
      svg.appendChild(path);
    });
    
    chartContainer.appendChild(svg);
    
    // Añadir tooltips
    document.querySelectorAll('.pie-chart path').forEach(path => {
      path.addEventListener('mouseover', function(e) {
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        tooltip.textContent = this.getAttribute('data-tooltip');
        document.body.appendChild(tooltip);
        
        gsap.set(tooltip, {
          x: e.pageX,
          y: e.pageY - 30,
          opacity: 0
        });
        
        gsap.to(tooltip, {
          y: e.pageY - 40,
          opacity: 1,
          duration: 0.2
        });
      });
      
      path.addEventListener('mouseout', function() {
        const tooltip = document.querySelector('.chart-tooltip');
        if (tooltip) {
          gsap.to(tooltip, {
            opacity: 0,
            duration: 0.1,
            onComplete: () => tooltip.remove()
          });
        }
      });
      
      path.addEventListener('mousemove', function(e) {
        const tooltip = document.querySelector('.chart-tooltip');
        if (tooltip) {
          gsap.set(tooltip, {
            x: e.pageX,
            y: e.pageY - 40
          });
        }
      });
    });
  }

  // Generar reporte PDF
  function generatePDF() {
    if (state.selectedComponents.length === 0) {
      showToast("Añade componentes para generar el reporte");
      return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configuración inicial
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(24);
    doc.setTextColor(44, 62, 80);
    doc.text('Reporte de Huella de Carbono', 105, 20, { align: 'center' });
    
    // Logo o icono
    doc.setFontSize(40);
    doc.setTextColor(46, 204, 113);
    doc.text('♻', 105, 35, { align: 'center' });
    
    // Fecha
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, 105, 45, { align: 'center' });
    
    // Datos del equipo
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('Configuración del Equipo', 20, 60);
    
    doc.setFontSize(10);
    let yPosition = 70;
    
    // Componentes
    state.selectedComponents.forEach(comp => {
      doc.text(`• ${comp.typeName}: ${comp.name} (${comp.tdp}W)`, 20, yPosition);
      yPosition += 7;
    });
    
    // Parámetros de uso
    yPosition += 5;
    doc.text(`Horas de uso diario: ${hoursInput.value}`, 20, yPosition);
    yPosition += 7;
    doc.text(`País: ${countrySelect.options[countrySelect.selectedIndex].text}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Incluye fabricación: ${includeManufacturing.checked ? 'Sí' : 'No'}`, 20, yPosition);
    
    // Resultados
    doc.setFontSize(16);
    doc.text('Resultados de Huella de Carbono', 20, yPosition + 15);
    doc.setFontSize(12);
    
    const totalCO2 = parseFloat(co2Result.textContent);
    doc.text(`Huella anual estimada: ${totalCO2.toFixed(1)} kg CO₂eq`, 20, yPosition + 25);
    
    const kmCar = (totalCO2 / 0.12).toFixed(1);
    doc.text(`Equivalente a ${kmCar} km recorridos en automóvil`, 20, yPosition + 35);
    
    // Gráfico de barras para componentes
    yPosition += 50;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Distribución por componente:", 20, yPosition);
    
    yPosition += 10;
    const startY = yPosition;
    const barWidth = 5;
    const maxBarLength = 100;
    
    const contributions = state.selectedComponents.map((comp, index) => {
      const operational = (comp.tdp * hoursInput.value * 365 / 1000) * countries[countrySelect.value];
      const manufacturing = includeManufacturing.checked ? comp.co2Manufacturing / state.lifespan : 0;
      return {
        name: comp.name,
        value: operational + manufacturing,
        color: chartColors[index % chartColors.length]
      };
    });
    
    const maxValue = Math.max(...contributions.map(c => c.value));
    
    contributions.forEach((comp, i) => {
      const barLength = (comp.value / maxValue) * maxBarLength;
      
      doc.setFillColor(comp.color);
      doc.rect(20, yPosition, barLength, barWidth, 'F');
      
      doc.setTextColor(0);
      doc.text(`${comp.name}: ${comp.value.toFixed(1)} kg`, 25 + barLength, yPosition + 4);
      
      yPosition += 10;
    });
    
    // Recomendaciones
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('Recomendaciones', 20, yPosition + 20);
    doc.setFontSize(10);
    
    const recommendations = [
      "Considera apagar el equipo cuando no esté en uso",
      "Configura opciones de ahorro de energía",
      "Actualiza componentes antiguos por modelos más eficientes",
      "Considera usar hardware certificado como Energy Star",
      "Optimiza la ventilación para mejorar la eficiencia del sistema"
    ];
    
    recommendations.forEach((rec, i) => {
      doc.text(`✓ ${rec}`, 20, yPosition + 30 + (i * 7));
    });
    
    // Guardar PDF
    doc.save(`Reporte_Huella_Carbono_${new Date().toISOString().slice(0,10)}.pdf`);
    
    showToast("Reporte generado con éxito");
  }

  // Reiniciar calculadora
  function resetCalculator() {
    state.selectedComponents = [];
    componentCategory.value = '';
    componentSelect.innerHTML = '<option value="">Primero selecciona una categoría</option>';
    componentSelect.disabled = true;
    addComponentBtn.disabled = true;
    hoursInput.value = 4;
    hoursValue.textContent = '4';
    countrySelect.value = 'global';
    includeManufacturing.checked = true;
    
    updateSelectedComponentsList();
    calculateFootprint();
    
    showToast("Calculadora reiniciada");
    
    // Animación de reset
    gsap.from(".calculator-container", {
      y: 20,
      opacity: 0.7,
      duration: 0.5
    });
  }

  // Mostrar notificación toast
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    gsap.from(toast, {
      y: 20,
      opacity: 0,
      duration: 0.3
    });
    
    setTimeout(() => {
      gsap.to(toast, {
        y: -10,
        opacity: 0,
        duration: 0.3,
        onComplete: () => toast.remove()
      });
    }, 3000);
  }

  // Rellenar selector de países
  function populateCountrySelect() {
    countrySelect.innerHTML = '';
    
    const sortedCountries = Object.entries(countries)
      .sort((a, b) => a[0].localeCompare(b[0]));
    
    sortedCountries.forEach(([code, factor]) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = code === 'global' ? 'Promedio Global' : 
        `${code.toUpperCase()} (${(factor * 1000).toFixed(0)} gCO2/kWh)`;
      countrySelect.appendChild(option);
    });
    
    countrySelect.value = 'global';
  }
});