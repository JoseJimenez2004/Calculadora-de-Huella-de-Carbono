document.addEventListener('DOMContentLoaded', function() {
  // Accedemos a los datos desde el objeto global
  const { cloudProviders, countries } = window.CalculatorData;
  const { jsPDF } = window.jspdf;

  // Elementos del DOM
  const cloudProviderSelect = document.getElementById('cloudProvider');
  const instanceTypeSelect = document.getElementById('instanceType');
  const instanceCountInput = document.getElementById('instanceCount');
  const vcpuCountInput = document.getElementById('vcpuCount');
  const memoryGBInput = document.getElementById('memoryGB');
  const storageGBInput = document.getElementById('storageGB');
  const uptimeInput = document.getElementById('uptime');
  const uptimeValue = document.getElementById('uptimeValue');
  const utilizationInput = document.getElementById('utilization');
  const utilizationValue = document.getElementById('utilizationValue');
  const regionSelect = document.getElementById('region');
  const includeEmbodied = document.getElementById('includeEmbodied');
  const includeNetworking = document.getElementById('includeNetworking');
  const co2Result = document.getElementById('co2Result');
  const equivalent = document.getElementById('equivalent');
  const chartContainer = document.getElementById('impactChart');
  const graphLegend = document.getElementById('graphLegend');
  const generateBtn = document.getElementById('generateReport');
  const resetBtn = document.getElementById('resetCalculator');

  // Estado de la aplicación
  const state = {
    cloudProvider: null,
    instanceType: null,
    instanceCount: 1,
    vcpuCount: 2,
    memoryGB: 8,
    storageGB: 50,
    lifespan: 4, // años (vida útil típica de hardware en la nube)
    maxTDP: 1000 // Para cálculos de eficiencia
  };

  // Inicialización
  init();

  function init() {
    populateCloudProviderSelect();
    populateRegionSelect();
    setupEventListeners();
    calculateFootprint();
  }

  function setupEventListeners() {
    // Selector de proveedor de nube
    cloudProviderSelect.addEventListener('change', updateCloudProvider);
    
    // Selector de tipo de instancia
    instanceTypeSelect.addEventListener('change', updateInstanceType);
    
    // Inputs de configuración
    instanceCountInput.addEventListener('input', function() {
      state.instanceCount = parseInt(this.value) || 1;
      calculateFootprint();
    });
    
    vcpuCountInput.addEventListener('input', function() {
      state.vcpuCount = parseInt(this.value) || 2;
      calculateFootprint();
    });
    
    memoryGBInput.addEventListener('input', function() {
      state.memoryGB = parseInt(this.value) || 8;
      calculateFootprint();
    });
    
    storageGBInput.addEventListener('input', function() {
      state.storageGB = parseInt(this.value) || 50;
      calculateFootprint();
    });
    
    // Parámetros de uso
    uptimeInput.addEventListener('input', updateUptimeValue);
    utilizationInput.addEventListener('input', updateUtilizationValue);
    regionSelect.addEventListener('change', calculateFootprint);
    includeEmbodied.addEventListener('change', calculateFootprint);
    includeNetworking.addEventListener('change', calculateFootprint);
    
    // Botones de acción
    generateBtn.addEventListener('click', generatePDF);
    resetBtn.addEventListener('click', resetCalculator);
  }

  // Rellenar selector de proveedores de nube
  function populateCloudProviderSelect() {
    cloudProviderSelect.innerHTML = '<option value="">Selecciona un proveedor</option>';
    
    Object.entries(cloudProviders).forEach(([name, data]) => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      option.dataset.sharedFactor = data.sharedResourceFactor;
      cloudProviderSelect.appendChild(option);
    });
  }

  // Actualizar proveedor de nube seleccionado
  function updateCloudProvider() {
    const selectedOption = cloudProviderSelect.options[cloudProviderSelect.selectedIndex];
    if (!selectedOption.value) {
      state.cloudProvider = null;
      instanceTypeSelect.innerHTML = '<option value="">Selecciona un proveedor primero</option>';
      instanceTypeSelect.disabled = true;
      return;
    }
    
    state.cloudProvider = {
      name: selectedOption.text,
      sharedFactor: parseFloat(selectedOption.dataset.sharedFactor)
    };
    
    // Actualizar tipos de instancia
    populateInstanceTypeSelect();
    calculateFootprint();
  }

  // Rellenar selector de tipos de instancia
  function populateInstanceTypeSelect() {
    instanceTypeSelect.innerHTML = '<option value="">Selecciona un tipo de instancia</option>';
    instanceTypeSelect.disabled = false;
    
    // Tipos genéricos basados en categorías comunes
    const instanceTypes = [
      { name: "General Purpose", tdp: 200, co2Manufacturing: 400 },
      { name: "Compute Optimized", tdp: 350, co2Manufacturing: 600 },
      { name: "Memory Optimized", tdp: 300, co2Manufacturing: 550 },
      { name: "Storage Optimized", tdp: 250, co2Manufacturing: 500 },
      { name: "GPU Instances", tdp: 500, co2Manufacturing: 800 },
      { name: "High Performance", tdp: 400, co2Manufacturing: 700 }
    ];
    
    instanceTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type.name;
      option.textContent = type.name;
      option.dataset.tdp = type.tdp;
      option.dataset.co2 = type.co2Manufacturing;
      instanceTypeSelect.appendChild(option);
    });
  }

  // Actualizar tipo de instancia seleccionado
  function updateInstanceType() {
    const selectedOption = instanceTypeSelect.options[instanceTypeSelect.selectedIndex];
    if (!selectedOption.value) {
      state.instanceType = null;
      return;
    }
    
    state.instanceType = {
      name: selectedOption.text,
      tdp: parseFloat(selectedOption.dataset.tdp),
      co2Manufacturing: parseFloat(selectedOption.dataset.co2)
    };
    
    calculateFootprint();
  }

  // Rellenar selector de regiones
  function populateRegionSelect() {
    regionSelect.innerHTML = '';
    
    const sortedCountries = Object.entries(countries)
      .sort((a, b) => a[0].localeCompare(b[0]));
    
    sortedCountries.forEach(([name, factor]) => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = `${name} (${(factor * 1000).toFixed(0)} gCO2/kWh)`;
      regionSelect.appendChild(option);
    });
    
    // Establecer un valor por defecto
    regionSelect.value = 'Estados Unidos';
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

  // Calcular huella de carbono para la nube
  function calculateFootprint() {
    if (!state.cloudProvider || !state.instanceType) {
      updateResultsDisplay(0);
      return;
    }
    
    // Parámetros de uso
    const uptime = parseFloat(uptimeInput.value) || 24;
    const utilization = parseFloat(utilizationInput.value) || 70;
    const energyMixFactor = countries[regionSelect.value] || 0.5;
    
    // Factor de utilización ajustado para la nube
    const utilizationFactor = 0.8 * (utilization / 100);
    
    // CO2 operacional (uso diario)
    // Ajustamos por el factor de recursos compartidos en la nube
    const operationalCO2 = (state.instanceType.tdp * utilizationFactor * uptime * 365 / 1000) * 
                          energyMixFactor * (1 - state.cloudProvider.sharedFactor);
    
    // CO2 de fabricación (amortizado en la vida útil)
    let embodiedCO2 = 0;
    if (includeEmbodied.checked) {
      embodiedCO2 = (state.instanceType.co2Manufacturing / state.lifespan) * 
                   (1 - state.cloudProvider.sharedFactor);
    }
    
    // CO2 de red (aproximado como 15% del consumo energético)
    let networkingCO2 = 0;
    if (includeNetworking.checked) {
      networkingCO2 = operationalCO2 * 0.15;
    }
    
    // CO2 de almacenamiento (aproximado)
    const storageCO2 = (state.storageGB * 0.0005 * 365) * energyMixFactor;
    
    // CO2 total considerando múltiples instancias
    const totalCO2 = (operationalCO2 + embodiedCO2 + networkingCO2 + storageCO2) * state.instanceCount;
    
    updateResultsDisplay(totalCO2);
    updateComparisonChart(totalCO2);
    drawPieChart(totalCO2, operationalCO2, embodiedCO2, networkingCO2, storageCO2);
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
    // Estimación de servidor físico equivalente
    const physicalServerCO2 = totalCO2 * 1.5; // La nube suele ser más eficiente
    
    const yourPercentage = Math.min((totalCO2 / physicalServerCO2) * 100, 100);
    
    // Actualizar barras
    document.querySelector('.your-bar .bar-fill').style.width = `${yourPercentage}%`;
    document.querySelector('.your-bar .bar-value').textContent = `${totalCO2.toFixed(1)} kg`;
    document.querySelector('.avg-bar .bar-value').textContent = `${physicalServerCO2.toFixed(1)} kg`;
    
    // Animación
    gsap.from('.your-bar .bar-fill', {
      scaleX: 0,
      duration: 1,
      ease: "power3.out"
    });
  }

  // Dibujar gráfico de pastel
  function drawPieChart(totalCO2, operationalCO2, embodiedCO2, networkingCO2, storageCO2) {
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
        value: operationalCO2 * state.instanceCount,
        color: '#3498DB'
      }
    ];
    
    if (includeEmbodied.checked) {
      categories.push({
        name: "Fabricación",
        value: embodiedCO2 * state.instanceCount,
        color: '#E74C3C'
      });
    }
    
    if (includeNetworking.checked) {
      categories.push({
        name: "Red",
        value: networkingCO2 * state.instanceCount,
        color: '#9B59B6'
      });
    }
    
    categories.push({
      name: "Almacenamiento",
      value: storageCO2 * state.instanceCount,
      color: '#2ECC71'
    });
    
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
    
    // Añadir tooltips (código igual que en la versión anterior)
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
    if (!state.cloudProvider || !state.instanceType) {
      showToast("Configura la instancia en la nube para generar el reporte");
      return;
    }
    
    const doc = new jsPDF();
    
    // Configuración inicial
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(24);
    doc.setTextColor(44, 62, 80);
    doc.text('Reporte de Huella de Carbono en la Nube', 105, 20, { align: 'center' });
    
    // Logo o icono
    doc.setFontSize(40);
    doc.setTextColor(52, 152, 219);
    doc.text('☁️', 105, 35, { align: 'center' });
    
    // Fecha
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, 105, 45, { align: 'center' });
    
    // Configuración de la nube
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('Configuración de la Nube', 20, 60);
    
    doc.setFontSize(10);
    let yPosition = 70;
    
    doc.text(`• Proveedor: ${state.cloudProvider.name}`, 20, yPosition);
    yPosition += 7;
    doc.text(`• Tipo de instancia: ${state.instanceType.name}`, 20, yPosition);
    yPosition += 7;
    doc.text(`• Cantidad: ${state.instanceCount}`, 20, yPosition);
    yPosition += 7;
    doc.text(`• vCPUs por instancia: ${state.vcpuCount}`, 20, yPosition);
    yPosition += 7;
    doc.text(`• Memoria por instancia: ${state.memoryGB} GB`, 20, yPosition);
    yPosition += 7;
    doc.text(`• Almacenamiento por instancia: ${state.storageGB} GB`, 20, yPosition);
    yPosition += 7;
    
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
    doc.text(`• Región: ${regionSelect.options[regionSelect.selectedIndex].text}`, 20, yPosition);
    yPosition += 7;
    doc.text(`• Incluye huella incorporada: ${includeEmbodied.checked ? 'Sí' : 'No'}`, 20, yPosition);
    yPosition += 7;
    doc.text(`• Incluye huella de red: ${includeNetworking.checked ? 'Sí' : 'No'}`, 20, yPosition);
    
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
    
   const operationalCO2 = (
  state.instanceType.tdp *
  (0.8 * (utilizationInput.value / 100)) *
  (uptimeInput.value * 365 / 1000) *
  (countries[regionSelect.value] || 0.5) *
  (1 - state.cloudProvider.sharedFactor) *
  state.instanceCount
);

    
    const embodiedCO2 = includeEmbodied.checked ? 
                       (state.instanceType.co2Manufacturing / state.lifespan) * 
                       (1 - state.cloudProvider.sharedFactor) * 
                       state.instanceCount : 0;
    
    const networkingCO2 = includeNetworking.checked ? operationalCO2 * 0.15 : 0;
    const storageCO2 = (state.storageGB * 0.0005 * 365) * (countries[regionSelect.value] || 0.5) * state.instanceCount;
    
    const categories = [
      { name: "Consumo energético", value: operationalCO2, color: [52, 152, 219] },
      { name: "Fabricación", value: embodiedCO2, color: [231, 76, 60] },
      { name: "Red", value: networkingCO2, color: [155, 89, 182] },
      { name: "Almacenamiento", value: storageCO2, color: [46, 204, 113] }
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
    
    // Recomendaciones para la nube
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('Recomendaciones', 20, yPosition + 20);
    doc.setFontSize(10);
    
    const recommendations = [
      "Optimiza el tamaño de las instancias según la carga de trabajo",
      "Implementa autoescalado para ajustar recursos según demanda",
      "Programa instancias para que se apaguen cuando no se necesiten",
      "Considera regiones con menor intensidad de carbono",
      "Consolida cargas de trabajo en menos instancias más grandes",
      "Utiliza tipos de instancia más eficientes energéticamente",
      "Implementa arquitecturas serverless para cargas variables"
    ];
    
    recommendations.forEach((rec, i) => {
      doc.text(`✓ ${rec}`, 20, yPosition + 30 + (i * 7));
    });
    
    // Guardar PDF
    doc.save(`Reporte_Huella_Carbono_Nube_${new Date().toISOString().slice(0,10)}.pdf`);
    
    showToast("Reporte generado con éxito");
  }

  // Reiniciar calculadora
  function resetCalculator() {
    state.cloudProvider = null;
    state.instanceType = null;
    cloudProviderSelect.value = '';
    instanceTypeSelect.innerHTML = '<option value="">Selecciona un proveedor primero</option>';
    instanceTypeSelect.disabled = true;
    instanceCountInput.value = 1;
    state.instanceCount = 1;
    vcpuCountInput.value = 2;
    state.vcpuCount = 2;
    memoryGBInput.value = 8;
    state.memoryGB = 8;
    storageGBInput.value = 50;
    state.storageGB = 50;
    uptimeInput.value = 24;
    uptimeValue.textContent = '24';
    utilizationInput.value = 70;
    utilizationValue.textContent = '70';
    regionSelect.value = 'Estados Unidos';
    includeEmbodied.checked = true;
    includeNetworking.checked = true;
    
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