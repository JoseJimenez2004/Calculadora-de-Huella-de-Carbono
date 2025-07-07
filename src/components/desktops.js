import { components, countries } from './data.js';
import { gsap } from 'gsap';

// Elementos del DOM
const DOM = {
  componentSearch: document.getElementById('componentSearch'),
  searchResults: document.getElementById('searchResults'),
  selectedComponentsList: document.querySelector('.selected-components .components-list'),
  componentsCount: document.getElementById('componentsCount'),
  tdpTotalSpan: document.getElementById('tdpTotal'),
  tdpGauge: document.getElementById('tdpGauge'),
  hoursInput: document.getElementById('hours'),
  hoursValue: document.getElementById('hoursValue'),
  countrySelect: document.getElementById('country'),
  includeManufacturing: document.getElementById('includeManufacturing'),
  co2Result: document.getElementById('co2Result'),
  equivalent: document.getElementById('equivalent'),
  chartContainer: document.getElementById('impactChart'),
  graphLegend: document.getElementById('graphLegend'),
  generateBtn: document.getElementById('generateReport'),
  resetBtn: document.getElementById('resetCalculator')
};

// Estado de la aplicación
const state = {
  selectedComponents: [],
  lifespan: 5, // años
  maxTDP: 800 // Valor máximo para la escala del medidor (ajustar según necesidad)
};

// Colores para gráficos
const chartColors = [
  '#2ECC71', '#3498DB', '#9B59B6', '#E74C3C', 
  '#F39C12', '#1ABC9C', '#34495E', '#E91E63'
];

// Inicialización
function init() {
  populateCountrySelect();
  setupEventListeners();
  animateElements();
  updateComponentsCount();
}

// Poblar select de países
function populateCountrySelect() {
  for (const country in countries) {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    DOM.countrySelect.appendChild(option);
  }
}

// Configurar event listeners
function setupEventListeners() {
  // Búsqueda de componentes
  DOM.componentSearch.addEventListener('input', () => searchComponents(DOM.componentSearch.value));
  DOM.searchResults.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => DOM.searchResults.classList.remove('active'));

  // Parámetros de uso
  DOM.hoursInput.addEventListener('input', updateHoursValue);
  DOM.countrySelect.addEventListener('change', calculateFootprint);
  DOM.includeManufacturing.addEventListener('change', calculateFootprint);
  
  // Botones de acción
  DOM.generateBtn.addEventListener('click', generatePDF);
  DOM.resetBtn.addEventListener('click', resetCalculator);
}

// Animaciones iniciales
function animateElements() {
  gsap.from('.calculator-header', {
    duration: 0.8,
    y: -50,
    opacity: 0,
    ease: "power2.out"
  });
  
  gsap.from('.navbar', {
    duration: 0.6,
    y: -100,
    opacity: 0,
    ease: "power2.out"
  });
}

// Buscar componentes
function searchComponents(query) {
  DOM.searchResults.innerHTML = '';
  
  if (!query) {
    DOM.searchResults.classList.remove('active');
    return;
  }
  
  const lowerQuery = query.toLowerCase();
  let hasResults = false;

  // Buscar en todas las categorías de componentes
  for (const [category, items] of Object.entries(components)) {
    for (const [name, data] of Object.entries(items)) {
      if (name.toLowerCase().includes(lowerQuery)) {
        addSearchResult(name, category.toUpperCase(), data.tdp);
        hasResults = true;
      }
    }
  }

  // Mostrar resultados o mensaje de no resultados
  if (hasResults) {
    DOM.searchResults.classList.add('active');
    animateSearchResults();
  } else {
    showNoResults();
  }
}

// Añadir resultado de búsqueda
function addSearchResult(name, type, tdp) {
  const resultItem = document.createElement('div');
  resultItem.className = 'result-item';
  resultItem.innerHTML = `
    <div class="item-name">${name}</div>
    <div class="item-details">
      <span>${type}</span>
      <span>${tdp}W</span>
    </div>
  `;
  
  resultItem.addEventListener('click', () => {
    addSelectedComponent(name, type, tdp);
    DOM.componentSearch.value = '';
    DOM.searchResults.classList.remove('active');
  });
  
  DOM.searchResults.appendChild(resultItem);
}

// Animación para resultados de búsqueda
function animateSearchResults() {
  gsap.from('.result-item', {
    duration: 0.3,
    x: -10,
    opacity: 0,
    stagger: 0.05,
    ease: "power1.out"
  });
}

// Mostrar mensaje de no resultados
function showNoResults() {
  DOM.searchResults.classList.remove('active');
  const noResults = document.createElement('div');
  noResults.className = 'result-item no-results';
  noResults.textContent = 'No se encontraron componentes';
  DOM.searchResults.appendChild(noResults);
  DOM.searchResults.classList.add('active');
}

// Añadir componente seleccionado
function addSelectedComponent(name, type, tdp) {
  const componentId = `${type}-${name.replace(/\s+/g, '-')}`;
  
  // Evitar duplicados
  if (state.selectedComponents.some(c => c.id === componentId)) {
    showToast(`${name} ya está seleccionado`);
    return;
  }
  
  const category = type.toLowerCase();
  const componentData = components[category]?.[name];
  
  if (!componentData) return;
  
  state.selectedComponents.push({
    id: componentId,
    name,
    type: category,
    tdp: componentData.tdp,
    co2Manufacturing: componentData.co2Manufacturing
  });
  
  updateSelectedComponentsList();
  calculateFootprint();
  showToast(`${name} añadido`);
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
    duration: 0.3,
    ease: "power1.out"
  });
  
  setTimeout(() => {
    gsap.to(toast, {
      y: -10,
      opacity: 0,
      duration: 0.3,
      ease: "power1.in",
      onComplete: () => toast.remove()
    });
  }, 3000);
}

// Actualizar lista de componentes seleccionados
function updateSelectedComponentsList() {
  DOM.selectedComponentsList.innerHTML = '';
  
  if (state.selectedComponents.length === 0) {
    DOM.selectedComponentsList.innerHTML = '<p class="empty-message">No hay componentes seleccionados</p>';
    updateComponentsCount();
    return;
  }
  
  state.selectedComponents.forEach((component, index) => {
    const componentItem = document.createElement('div');
    componentItem.className = 'component-item';
    componentItem.innerHTML = `
      <span class="component-name">${component.name}</span>
      <span class="component-tdp">${component.tdp}W</span>
      <span class="remove-item" data-id="${component.id}">×</span>
    `;
    
    // Animación al añadir
    gsap.from(componentItem, {
      x: -20,
      opacity: 0,
      duration: 0.3,
      delay: index * 0.05
    });
    
    DOM.selectedComponentsList.appendChild(componentItem);
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
  DOM.componentsCount.textContent = state.selectedComponents.length;
  
  // Animación
  gsap.from(DOM.componentsCount, {
    scale: 1.5,
    duration: 0.3,
    ease: "elastic.out(1, 0.5)"
  });
}

// Actualizar valor de horas de uso
function updateHoursValue() {
  DOM.hoursValue.textContent = DOM.hoursInput.value;
  
  // Animación
  gsap.from(DOM.hoursValue, {
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
  
  const hours = parseFloat(DOM.hoursInput.value);
  const energyMixFactor = countries[DOM.countrySelect.value] || 0.5;
  
  // CO2 operacional (uso diario)
  const operationalCO2 = (totalWatts * hours * 365 / 1000) * energyMixFactor;
  
  // CO2 de fabricación (amortizado en la vida útil)
  let manufacturingCO2 = 0;
  if (DOM.includeManufacturing.checked) {
    manufacturingCO2 = state.selectedComponents.reduce((sum, comp) => sum + comp.co2Manufacturing, 0) / state.lifespan;
  }
  
  const totalCO2 = operationalCO2 + manufacturingCO2;
  
  updateResultsDisplay(totalCO2);
  updateComparisonChart(totalCO2);
  drawPieChart();
}

// Actualizar visualización de TDP
function updateTDPDisplay(totalWatts) {
  DOM.tdpTotalSpan.textContent = totalWatts;
  
  // Actualizar medidor visual
  const percentage = Math.min((totalWatts / state.maxTDP) * 100, 100);
  DOM.tdpGauge.style.background = `conic-gradient(${getGaugeColor(percentage)} ${percentage}%, ${getGaugeColor(percentage, true)} ${percentage}%)`;
  DOM.tdpGauge.textContent = `${percentage.toFixed(0)}%`;
  
  // Animación
  gsap.from(DOM.tdpTotalSpan, {
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
  DOM.co2Result.textContent = totalCO2.toFixed(1);
  
  // Calcular equivalencias
  const kmCar = (totalCO2 / 0.2).toFixed(0);
  const trees = (totalCO2 / 21.77).toFixed(1);
  
  DOM.equivalent.innerHTML = `<i class="fas fa-leaf"></i><span>Equivale a ${kmCar} km en auto o ${trees} árboles necesarios para absorberlo</span>`;
  
  // Animación
  gsap.from(DOM.co2Result, {
    scale: 1.3,
    duration: 0.3,
    ease: "elastic.out(1, 0.5)"
  });
  
  gsap.from(DOM.equivalent, {
    y: 10,
    opacity: 0,
    duration: 0.4,
    delay: 0.2
  });
}

// Actualizar gráfico de comparación
function updateComparisonChart(userCO2) {
  const avgCO2 = 300; // Valor promedio de ejemplo
  const userPercentage = Math.min((userCO2 / avgCO2) * 100, 100);
  
  // Animar las barras
  gsap.to('.your-bar .bar-fill', {
    width: `${userPercentage}%`,
    duration: 1,
    ease: "elastic.out(1, 0.5)"
  });
  
  // Actualizar valor numérico
  document.querySelector('.your-bar .bar-value').textContent = `${userCO2.toFixed(1)} kg`;
}

// Dibujar gráfico circular
function drawPieChart() {
  DOM.chartContainer.innerHTML = '';
  DOM.graphLegend.innerHTML = '';
  
  const total = state.selectedComponents.reduce((sum, c) => sum + c.tdp, 0);
  if (total === 0) return;
  
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', '0 0 200 200');
  
  const centerX = 100;
  const centerY = 100;
  const radius = 80;
  let startAngle = 0;
  
  // Crear segmentos del gráfico
  state.selectedComponents.forEach((comp, index) => {
    const sliceAngle = (comp.tdp / total) * 360;
    const endAngle = startAngle + sliceAngle;
    
    // Solo dibujar segmentos significativos (> 5%)
    if (sliceAngle > 5) {
      const startRadians = (Math.PI / 180) * (startAngle - 90);
      const endRadians = (Math.PI / 180) * (endAngle - 90);
      
      const x1 = centerX + radius * Math.cos(startRadians);
      const y1 = centerY + radius * Math.sin(startRadians);
      const x2 = centerX + radius * Math.cos(endRadians);
      const y2 = centerY + radius * Math.sin(endRadians);
      
      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', chartColors[index % chartColors.length]);
      path.setAttribute('stroke', 'white');
      path.setAttribute('stroke-width', '2');
      svg.appendChild(path);
      
      // Añadir leyenda
      addLegendItem(comp.name, chartColors[index % chartColors.length], `${((comp.tdp / total) * 100).toFixed(1)}%`);
      
      // Añadir etiqueta si el segmento es lo suficientemente grande
      if (sliceAngle > 15) {
        const labelAngle = startAngle + sliceAngle / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + labelRadius * Math.cos((Math.PI / 180) * (labelAngle - 90));
        const labelY = centerY + labelRadius * Math.sin((Math.PI / 180) * (labelAngle - 90));
        
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', labelX);
        text.setAttribute('y', labelY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '10');
        text.setAttribute('fill', 'white');
        text.setAttribute('font-weight', 'bold');
        text.textContent = `${((comp.tdp / total) * 100).toFixed(0)}%`;
        svg.appendChild(text);
      }
    }
    
    startAngle += sliceAngle;
  });
  
  // Añadir título en el centro
  const title = document.createElementNS(svgNS, 'text');
  title.setAttribute('x', centerX);
  title.setAttribute('y', centerY);
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('dominant-baseline', 'middle');
  title.setAttribute('font-size', '14');
  title.setAttribute('font-weight', 'bold');
  title.setAttribute('fill', '#2C3E50');
  title.textContent = `${total}W`;
  svg.appendChild(title);
  
  DOM.chartContainer.appendChild(svg);
  
  // Animación del gráfico
  gsap.from(svg.querySelectorAll('path'), {
    scale: 0,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "elastic.out(1, 0.5)",
    transformOrigin: "center center"
  });
}

// Añadir ítem a la leyenda
function addLegendItem(name, color, percentage) {
  const legendItem = document.createElement('div');
  legendItem.className = 'legend-item';
  legendItem.innerHTML = `
    <span class="legend-color" style="background: ${color}"></span>
    <span class="legend-name">${name}</span>
    <span class="legend-percentage">${percentage}</span>
  `;
  
  DOM.graphLegend.appendChild(legendItem);
}

// Generar reporte PDF
async function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Encabezado
  doc.setFontSize(20);
  doc.setTextColor(46, 204, 113);
  doc.text('Reporte de Huella de Carbono', 105, 20, { align: 'center' });
  
  // Logo o imagen
  // doc.addImage(logoData, 'PNG', 80, 30, 50, 50);
  
  // Detalles
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  let yPos = 40;
  
  // Componentes seleccionados
  doc.setFontSize(14);
  doc.text('Componentes seleccionados:', 20, yPos);
  yPos += 10;
  
  state.selectedComponents.forEach(comp => {
    doc.text(`- ${comp.name}: ${comp.tdp}W`, 25, yPos);
    yPos += 7;
  });
  
  // Parámetros
  yPos += 5;
  doc.text(`Horas de uso diario: ${DOM.hoursInput.value}`, 20, yPos);
  yPos += 7;
  doc.text(`País: ${DOM.countrySelect.value}`, 20, yPos);
  yPos += 7;
  doc.text(`Incluir fabricación: ${DOM.includeManufacturing.checked ? 'Sí' : 'No'}`, 20, yPos);
  
  // Resultados
  yPos += 15;
  doc.setFontSize(16);
  doc.setTextColor(46, 204, 113);
  doc.text('Resultados:', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Huella anual estimada: ${DOM.co2Result.textContent} kg CO₂eq`, 20, yPos);
  yPos += 7;
  doc.text(DOM.equivalent.textContent.replace(/<[^>]*>/g, ''), 20, yPos);
  
  // Gráfico (simplificado)
  yPos += 15;
  doc.setDrawColor(46, 204, 113);
  doc.setFillColor(46, 204, 113);
  doc.rect(20, yPos, 170, 80, 'FD');
  doc.setTextColor(255, 255, 255);
  doc.text('Distribución de consumo por componente', 105, yPos + 10, { align: 'center' });
  
  // Guardar PDF
  try {
    if ('showSaveFilePicker' in window) {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: 'reporte-huella-carbono-desktop.pdf',
        types: [{
          description: 'PDF Document',
          accept: { 'application/pdf': ['.pdf'] },
        }]
      });
      
      const writable = await fileHandle.createWritable();
      const pdfBlob = doc.output('blob');
      await writable.write(pdfBlob);
      await writable.close();
      
      showToast('Reporte guardado exitosamente');
    } else {
      doc.save('reporte-huella-carbono-desktop.pdf');
    }
  } catch (err) {
    console.error('Error al guardar PDF:', err);
    showToast('Error al guardar el reporte');
  }
}

// Reiniciar calculadora
function resetCalculator() {
  state.selectedComponents = [];
  DOM.componentSearch.value = '';
  DOM.hoursInput.value = '4';
  DOM.hoursValue.textContent = '4';
  DOM.includeManufacturing.checked = false;
  
  updateSelectedComponentsList();
  calculateFootprint();
  
  showToast('Calculadora reiniciada');
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', init);