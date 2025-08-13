document.addEventListener('DOMContentLoaded', function() {
  // Accedemos a los datos desde el objeto global
  const { components, serverTypes, countries } = window.CalculatorData;
  const { jsPDF } = window.jspdf;

  // Elementos del DOM
  const serverTypeSelect = document.getElementById('serverType');
  const serverCountInput = document.getElementById('serverCount');
  const componentCategory = document.getElementById('componentCategory');
  const componentSelect = document.getElementById('componentSelect');
  const addComponentBtn = document.getElementById('addComponent');
  const selectedComponentsList = document.querySelector('.selected-components .components-list');
  const tdpTotalSpan = document.getElementById('tdpTotal');
  const tdpGauge = document.getElementById('tdpGauge');
  const uptimeInput = document.getElementById('uptime');
  const uptimeValue = document.getElementById('uptimeValue');
  const utilizationInput = document.getElementById('utilization');
  const utilizationValue = document.getElementById('utilizationValue');
  const countrySelect = document.getElementById('country');
  const includeManufacturing = document.getElementById('includeManufacturing');
  const includeCooling = document.getElementById('includeCooling');
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
    serverType: null,
    serverCount: 1,
    lifespan: 5, // años (vida útil típica de un servidor)
    maxTDP: 2000 // Para el medidor visual (ajustado para servidores)
  };

  // Mapeo de nombres de categorías
  const categoryNames = {
    cpu: "Procesador",
    gpu: "GPU",
    ram: "RAM",
    storage: "Almacenamiento",
    psu: "Fuente de Poder",
    cooling: "Refrigeración"
  };

  // Colores para gráficos
  const chartColors = [
    '#2ECC71', '#3498DB', '#9B59B6', '#E74C3C', 
    '#F39C12', '#1ABC9C', '#34495E', '#E91E63'
  ];

  // Inicialización
  init();

  function init() {
    populateServerTypeSelect();
    populateCountrySelect();
    setupEventListeners();
    updateComponentsCount();
  }

  function setupEventListeners() {
    // Selector de tipo de servidor
    serverTypeSelect.addEventListener('change', updateServerType);
    
    // Cantidad de servidores
    serverCountInput.addEventListener('input', function() {
      state.serverCount = parseInt(this.value) || 1;
      calculateFootprint();
    });
    
    // Selector de categoría
    componentCategory.addEventListener('change', updateComponentSelect);
    
    // Selector de componente
    componentSelect.addEventListener('change', function() {
      addComponentBtn.disabled = !this.value;
    });
    
    // Botón añadir componente
    addComponentBtn.addEventListener('click', addSelectedComponent);
    
    // Parámetros de uso
    uptimeInput.addEventListener('input', updateUptimeValue);
    utilizationInput.addEventListener('input', updateUtilizationValue);
    countrySelect.addEventListener('change', calculateFootprint);
    includeManufacturing.addEventListener('change', calculateFootprint);
    includeCooling.addEventListener('change', calculateFootprint);
    
    // Botones de acción
    generateBtn.addEventListener('click', generatePDF);
    resetBtn.addEventListener('click', resetCalculator);
  }

  // Rellenar selector de tipos de servidor
  function populateServerTypeSelect() {
    serverTypeSelect.innerHTML = '<option value="">Selecciona un tipo de servidor</option>';
    
    Object.entries(serverTypes).forEach(([name, data]) => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      option.dataset.baseTdp = data.baseTdp;
      option.dataset.baseCo2 = data.baseCo2;
      serverTypeSelect.appendChild(option);
    });
  }

  // Actualizar tipo de servidor seleccionado
  function updateServerType() {
    const selectedOption = serverTypeSelect.options[serverTypeSelect.selectedIndex];
    if (!selectedOption.value) {
      state.serverType = null;
      return;
    }
    
    state.serverType = {
      name: selectedOption.text,
      baseTdp: parseFloat(selectedOption.dataset.baseTdp),
      baseCo2: parseFloat(selectedOption.dataset.baseCo2)
    };
    
    calculateFootprint();
  }

  // Rellenar selector de países
  function populateCountrySelect() {
    countrySelect.innerHTML = '';
    
    const sortedCountries = Object.entries(countries)
      .sort((a, b) => a[0].localeCompare(b[0]));
    
    sortedCountries.forEach(([name, factor]) => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = `${name} (${(factor * 1000).toFixed(0)} gCO2/kWh)`;
      countrySelect.appendChild(option);
    });
    
    // Establecer un valor por defecto
    countrySelect.value = 'México';
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

  // Actualizar valor de uptime
  function updateUptimeValue() {
    uptimeValue.textContent = uptimeInput.value;
    gsap.from(uptimeValue, {
      scale: 1.3,
      duration: 0.3,
      ease: "elastic.out(1, 0.5)"
    });
    calculateFootprint();
  }

  // Actualizar valor de utilización
  function updateUtilizationValue() {
    utilizationValue.textContent = utilizationInput.value;
    gsap.from(utilizationValue, {
      scale: 1.3,
      duration: 0.3,
      ease: "elastic.out(1, 0.5)"
    });
    calculateFootprint();
  }

  // Calcular huella de carbono para servidores
  function calculateFootprint() {
    // Calcular TDP base del tipo de servidor
    const serverBaseTDP = state.serverType ? state.serverType.baseTdp : 0;
    
    // Calcular TDP de los componentes seleccionados
    const componentsTDP = state.selectedComponents.reduce((sum, comp) => sum + comp.tdp, 0);
    
    // TDP total (incluyendo base y componentes)
    const totalWatts = serverBaseTDP + componentsTDP;
    updateTDPDisplay(totalWatts);
    
    // Parámetros de uso
    const uptime = parseFloat(uptimeInput.value) || 24;
    const utilization = parseFloat(utilizationInput.value) || 70;
    const energyMixFactor = countries[countrySelect.value] || 0.5;
    
    // Factor de utilización (los servidores no consumen el 100% incluso a máxima carga)
    const utilizationFactor = 0.7 * (utilization / 100); // Ajuste para servidores
    
    // CO2 operacional (uso diario)
    const operationalCO2 = (totalWatts * utilizationFactor * uptime * 365 / 1000) * energyMixFactor;
    
    // CO2 de fabricación (amortizado en la vida útil)
    let manufacturingCO2 = 0;
    if (includeManufacturing.checked) {
      const serverBaseCO2 = state.serverType ? state.serverType.baseCo2 : 0;
      const componentsCO2 = state.selectedComponents.reduce((sum, comp) => sum + comp.co2Manufacturing, 0);
      manufacturingCO2 = (serverBaseCO2 + componentsCO2) / state.lifespan;
    }
    
    // CO2 de refrigeración (aproximado como 50% del consumo energético)
    let coolingCO2 = 0;
    if (includeCooling.checked) {
      coolingCO2 = operationalCO2 * 0.5;
    }
    
    const totalCO2 = (operationalCO2 + manufacturingCO2 + coolingCO2) * state.serverCount;
    
    updateResultsDisplay(totalCO2);
    updateComparisonChart(totalCO2);
    drawPieChart(totalCO2, operationalCO2, manufacturingCO2, coolingCO2);
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
    const kmCar = (totalCO2 / 0.12).toFixed(1); // 0.12 kg CO2 por km en auto
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
    const avgCO2 = 2100; // kg CO2 promedio anual para servidor
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
  function drawPieChart(totalCO2, operationalCO2, manufacturingCO2, coolingCO2) {
    chartContainer.innerHTML = '';
    graphLegend.innerHTML = '';
    
    if (!totalCO2 || totalCO2 <= 0) {
      chartContainer.innerHTML = '<p class="empty-message">No hay datos para mostrar</p>';
      return;
    }
    
    // Crear categorías para el gráfico
    const categories = [
      {
        name: "Consumo energético",
        value: operationalCO2 * state.serverCount,
        color: '#3498DB'
      }
    ];
    
    if (includeManufacturing.checked) {
      categories.push({
        name: "Fabricación",
        value: manufacturingCO2 * state.serverCount,
        color: '#E74C3C'
      });
    }
    
    if (includeCooling.checked) {
      categories.push({
        name: "Refrigeración",
        value: coolingCO2 * state.serverCount,
        color: '#2ECC71'
      });
    }
    
    // Crear leyenda
    categories.forEach((cat, index) => {
      const percent = (cat.value / totalCO2) * 100;
      if (percent < 0.1) return;
      
      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';
      legendItem.innerHTML = `
        <span class="legend-color" style="background: ${cat.color}"></span>
        <span class="legend-name">${cat.name}</span>
        <span class="legend-value">${cat.value.toFixed(1)} kg (${percent.toFixed(1)}%)</span>
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
    
    categories.forEach(cat => {
      const percent = (cat.value / totalCO2) * 100;
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
      path.setAttribute("fill", cat.color);
      path.setAttribute("stroke", "#fff");
      path.setAttribute("stroke-width", "0.5");
      
      // Tooltip
      path.setAttribute("data-tooltip", `${cat.name}: ${cat.value.toFixed(1)} kg (${percent.toFixed(1)}%)`);
      
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
    if (!state.serverType && state.selectedComponents.length === 0) {
      showToast("Configura el servidor para generar el reporte");
      return;
    }
    
    const doc = new jsPDF();
    
    // Configuración inicial
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(24);
    doc.setTextColor(44, 62, 80);
    doc.text('Reporte de Huella de Carbono', 105, 20, { align: 'center' });
    
    // Logo o icono
    doc.setFontSize(40);
    doc.setTextColor(46, 204, 113);
    doc.text('🖥️', 105, 35, { align: 'center' });
    
    // Fecha
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, 105, 45, { align: 'center' });
    
    // Configuración del servidor
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('Configuración del Servidor', 20, 60);
    
    doc.setFontSize(10);
    let yPosition = 70;
    
    if (state.serverType) {
      doc.text(`• Tipo: ${state.serverType.name}`, 20, yPosition);
      yPosition += 7;
    }
    
    doc.text(`• Cantidad: ${state.serverCount}`, 20, yPosition);
    yPosition += 7;
    
    // Componentes
    if (state.selectedComponents.length > 0) {
      yPosition += 5;
      doc.setFontSize(12);
      doc.text('Componentes:', 20, yPosition);
      doc.setFontSize(10);
      yPosition += 7;
      
      state.selectedComponents.forEach(comp => {
        doc.text(`• ${comp.typeName}: ${comp.name} (${comp.tdp}W)`, 20, yPosition);
        yPosition += 7;
      });
    }
    
    // Parámetros de uso
    yPosition += 5;
    doc.setFontSize(12);
    doc.text('Parámetros de Uso:', 20, yPosition);
    doc.setFontSize(10);
    yPosition += 7;
    
    doc.text(`• Uptime: ${uptimeInput.value} horas/día`, 20, yPosition);
    yPosition += 7;
    doc.text(`• Utilización: ${utilizationInput.value}%`, 20, yPosition);
    yPosition += 7;
    doc.text(`• Ubicación: ${countrySelect.options[countrySelect.selectedIndex].text}`, 20, yPosition);
    yPosition += 7;
    doc.text(`• Incluye fabricación: ${includeManufacturing.checked ? 'Sí' : 'No'}`, 20, yPosition);
    yPosition += 7;
    doc.text(`• Incluye refrigeración: ${includeCooling.checked ? 'Sí' : 'No'}`, 20, yPosition);
    
    // Resultados
    doc.setFontSize(16);
    doc.text('Resultados de Huella de Carbono', 20, yPosition + 15);
    doc.setFontSize(12);
    
    const totalCO2 = parseFloat(co2Result.textContent);
    doc.text(`Huella anual estimada: ${totalCO2.toFixed(1)} kg CO₂eq`, 20, yPosition + 25);
    
    const kmCar = (totalCO2 / 0.12).toFixed(1);
    doc.text(`Equivalente a ${kmCar} km recorridos en automóvil`, 20, yPosition + 35);
    
    // Gráfico de barras para categorías
    yPosition += 50;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Distribución por categoría:", 20, yPosition);
    
    yPosition += 10;
    const barWidth = 5;
    const maxBarLength = 100;
    
    const categories = [
      { name: "Consumo energético", value: (operationalCO2 * state.serverCount), color: [52, 152, 219] },
      { name: "Fabricación", value: (manufacturingCO2 * state.serverCount), color: [231, 76, 60] },
      { name: "Refrigeración", value: (coolingCO2 * state.serverCount), color: [46, 204, 113] }
    ].filter(cat => cat.value > 0);
    
    const maxValue = Math.max(...categories.map(c => c.value));
    
    categories.forEach((cat, i) => {
      const barLength = (cat.value / maxValue) * maxBarLength;
      
      doc.setFillColor(cat.color[0], cat.color[1], cat.color[2]);
      doc.rect(20, yPosition, barLength, barWidth, 'F');
      
      doc.setTextColor(0);
      doc.text(`${cat.name}: ${cat.value.toFixed(1)} kg`, 25 + barLength, yPosition + 4);
      
      yPosition += 10;
    });
    
    // Recomendaciones para servidores
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('Recomendaciones', 20, yPosition + 20);
    doc.setFontSize(10);
    
    const recommendations = [
      "Optimiza la utilización de los servidores con virtualización",
      "Considera servidores más eficientes energéticamente",
      "Implementa estrategias de refrigeración eficiente",
      "Consolida cargas de trabajo para reducir el número de servidores",
      "Actualiza hardware antiguo por modelos más eficientes",
      "Implementa políticas de apagado automático para servidores inactivos",
      "Considera la ubicación del data center para aprovechar energías renovables"
    ];
    
    recommendations.forEach((rec, i) => {
      doc.text(`✓ ${rec}`, 20, yPosition + 30 + (i * 7));
    });
    
    // Guardar PDF
    doc.save(`Reporte_Huella_Carbono_Servidor_${new Date().toISOString().slice(0,10)}.pdf`);
    
    showToast("Reporte generado con éxito");
  }

  // Reiniciar calculadora
  function resetCalculator() {
    state.selectedComponents = [];
    state.serverType = null;
    serverTypeSelect.value = '';
    serverCountInput.value = 1;
    state.serverCount = 1;
    componentCategory.value = '';
    componentSelect.innerHTML = '<option value="">Primero selecciona una categoría</option>';
    componentSelect.disabled = true;
    addComponentBtn.disabled = true;
    uptimeInput.value = 24;
    uptimeValue.textContent = '24';
    utilizationInput.value = 70;
    utilizationValue.textContent = '70';
    countrySelect.value = 'México';
    includeManufacturing.checked = true;
    includeCooling.checked = true;
    
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
});