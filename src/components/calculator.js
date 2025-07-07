import { components, countries } from './data.js';

// Elementos del DOM
const componentSearch = document.getElementById('componentSearch');
const searchResults = document.getElementById('searchResults');
const selectedComponentsList = document.querySelector('.selected-components .components-list');
const tdpTotalSpan = document.getElementById('tdpTotal');
const hoursInput = document.getElementById('hours');
const hoursValue = document.getElementById('hoursValue');
const countrySelect = document.getElementById('country');
const includeManufacturing = document.getElementById('includeManufacturing');
const co2Result = document.getElementById('co2Result');
const equivalent = document.getElementById('equivalent');
const chartContainer = document.getElementById('impactChart');
const generateBtn = document.getElementById('generateReport');

let selectedComponents = [];
let lifespan = 5; // años

// Poblar select de países
function populateCountrySelect() {
  for (const country in countries) {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    countrySelect.appendChild(option);
  }
}

// Buscar componentes
function searchComponents(query) {
  searchResults.innerHTML = '';
  if (!query) {
    searchResults.classList.remove('active');
    return;
  }
  
  const lowerQuery = query.toLowerCase();
  let hasResults = false;
  
  // Buscar en CPUs
  for (const [name, data] of Object.entries(components.cpu)) {
    if (name.toLowerCase().includes(lowerQuery)) {
      addSearchResult(name, 'CPU', data.tdp);
      hasResults = true;
    }
  }
  
  // Buscar en GPUs
  for (const [name, data] of Object.entries(components.gpu)) {
    if (name.toLowerCase().includes(lowerQuery)) {
      addSearchResult(name, 'GPU', data.tdp);
      hasResults = true;
    }
  }
  
  // Mostrar resultados si hay coincidencias
  if (hasResults) {
    searchResults.classList.add('active');
  } else {
    searchResults.classList.remove('active');
    const noResults = document.createElement('div');
    noResults.className = 'result-item no-results';
    noResults.textContent = 'No se encontraron componentes';
    searchResults.appendChild(noResults);
    searchResults.classList.add('active');
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
    componentSearch.value = '';
    searchResults.classList.remove('active');
  });
  
  searchResults.appendChild(resultItem);
}

// Añadir componente seleccionado
function addSelectedComponent(name, type, tdp) {
  const componentId = `${type}-${name.replace(/\s+/g, '-')}`;
  
  // Verificar si ya está seleccionado
  if (selectedComponents.some(c => c.id === componentId)) return;
  
  const componentData = components[type.toLowerCase()][name];
  
  selectedComponents.push({
    id: componentId,
    name,
    type,
    tdp: componentData.tdp,
    co2Manufacturing: componentData.co2Manufacturing
  });
  
  updateSelectedComponentsList();
  calculateFootprint();
}

// Actualizar lista de componentes seleccionados
function updateSelectedComponentsList() {
  selectedComponentsList.innerHTML = '';
  
  if (selectedComponents.length === 0) {
    selectedComponentsList.innerHTML = '<p class="empty-message">No hay componentes seleccionados</p>';
    return;
  }
  
  selectedComponents.forEach(component => {
    const componentItem = document.createElement('div');
    componentItem.className = 'component-item';
    componentItem.innerHTML = `
      ${component.name} (${component.tdp}W)
      <span class="remove-item" data-id="${component.id}">×</span>
    `;
    
    selectedComponentsList.appendChild(componentItem);
  });
  
  // Añadir event listeners para eliminar
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      selectedComponents = selectedComponents.filter(c => c.id !== id);
      updateSelectedComponentsList();
      calculateFootprint();
    });
  });
}

// Calcular huella de carbono
function calculateFootprint() {
  const totalWatts = selectedComponents.reduce((sum, comp) => sum + comp.tdp, 0);
  tdpTotalSpan.textContent = totalWatts;
  
  const hours = parseFloat(hoursInput.value);
  const energyMixFactor = countries[countrySelect.value];
  
  // CO2 operacional (uso diario)
  const operationalCO2 = (totalWatts * hours * 365 / 1000) * energyMixFactor;
  
  // CO2 de fabricación (amortizado en la vida útil)
  let manufacturingCO2 = 0;
  if (includeManufacturing.checked) {
    manufacturingCO2 = selectedComponents.reduce((sum, comp) => sum + comp.co2Manufacturing, 0) / lifespan;
  }
  
  const totalCO2 = operationalCO2 + manufacturingCO2;
  
  // Actualizar UI
  co2Result.textContent = totalCO2.toFixed(1);
  
  // Calcular equivalencias
  const kmCar = (totalCO2 / 0.2).toFixed(0);
  const trees = (totalCO2 / 21.77).toFixed(1); // kg CO2 absorbidos por árbol al año
  
  equivalent.textContent = `Equivale a ${kmCar} km en auto o ${trees} árboles necesarios para absorberlo`;
  
  // Actualizar gráficos
  drawChart();
  updateComparison(totalCO2);
}

// Actualizar comparación
function updateComparison(userCO2) {
  const avgCO2 = 300; // Valor promedio de ejemplo
  const userPercentage = Math.min((userCO2 / avgCO2) * 100, 100);
  
  document.querySelector('.your-bar .bar-fill').style.width = `${userPercentage}%`;
  document.querySelector('.avg-bar .bar-fill').style.width = '100%';
}

// Dibujar gráfico
function drawChart() {
  chartContainer.innerHTML = '';
  const total = selectedComponents.reduce((sum, c) => sum + c.tdp, 0);
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
  
  // Colores para los segmentos
  const colors = ['#2ECC71', '#3498DB', '#9B59B6', '#E74C3C', '#F39C12', '#1ABC9C'];
  
  selectedComponents.forEach((comp, index) => {
    const sliceAngle = (comp.tdp / total) * 360;
    const endAngle = startAngle + sliceAngle;
    
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
    path.setAttribute('fill', colors[index % colors.length]);
    path.setAttribute('stroke', 'white');
    path.setAttribute('stroke-width', '2');
    svg.appendChild(path);
    
    // Añadir etiqueta
    const labelAngle = startAngle + sliceAngle / 2;
    const labelRadius = radius + 20;
    const labelX = centerX + labelRadius * Math.cos((Math.PI / 180) * (labelAngle - 90));
    const labelY = centerY + labelRadius * Math.sin((Math.PI / 180) * (labelAngle - 90));
    
    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', labelX);
    text.setAttribute('y', labelY);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '10');
    text.setAttribute('fill', '#2C3E50');
    text.textContent = comp.name.split(' ')[0];
    svg.appendChild(text);
    
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
  
  chartContainer.appendChild(svg);
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
  
  selectedComponents.forEach(comp => {
    doc.text(`- ${comp.name}: ${comp.tdp}W`, 25, yPos);
    yPos += 7;
  });
  
  // Parámetros
  yPos += 5;
  doc.text(`Horas de uso diario: ${hoursInput.value}`, 20, yPos);
  yPos += 7;
  doc.text(`País: ${countrySelect.value}`, 20, yPos);
  yPos += 7;
  doc.text(`Incluir fabricación: ${includeManufacturing.checked ? 'Sí' : 'No'}`, 20, yPos);
  
  // Resultados
  yPos += 15;
  doc.setFontSize(16);
  doc.setTextColor(46, 204, 113);
  doc.text('Resultados:', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Huella anual estimada: ${co2Result.textContent} kg CO₂eq`, 20, yPos);
  yPos += 7;
  doc.text(equivalent.textContent, 20, yPos);
  
  // Gráfico (simplificado)
  yPos += 15;
  doc.setDrawColor(46, 204, 113);
  doc.setFillColor(46, 204, 113);
  doc.rect(20, yPos, 170, 80, 'FD');
  doc.setTextColor(255, 255, 255);
  doc.text('Distribución de consumo por componente', 105, yPos + 10, { align: 'center' });
  
  // Guardar PDF
  if ('showSaveFilePicker' in window) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: 'reporte-huella-carbono.pdf',
        types: [{
          description: 'PDF Document',
          accept: { 'application/pdf': ['.pdf'] },
        }]
      });
      
      const writable = await fileHandle.createWritable();
      const pdfBlob = doc.output('blob');
      await writable.write(pdfBlob);
      await writable.close();
    } catch (err) {
      console.error('Guardado cancelado o error:', err);
      doc.save('reporte-huella-carbono.pdf');
    }
  } else {
    doc.save('reporte-huella-carbono.pdf');
  }
}

// Event listeners
componentSearch.addEventListener('input', () => searchComponents(componentSearch.value));
searchResults.addEventListener('click', (e) => e.stopPropagation());
document.addEventListener('click', () => searchResults.classList.remove('active'));

hoursInput.addEventListener('input', () => {
  hoursValue.textContent = hoursInput.value;
  calculateFootprint();
});

[countrySelect, includeManufacturing].forEach(el => el.addEventListener('change', calculateFootprint));
generateBtn.addEventListener('click', generatePDF);

// Inicialización
populateCountrySelect();
updateSelectedComponentsList();
calculateFootprint();