    document.addEventListener('DOMContentLoaded', function() {
      const { facilities, countries } = window.CalculatorData;
      const { jsPDF } = window.jspdf;

      // Elementos del DOM
      const facilityTypeSelect = document.getElementById('facilityType');
      const facilitySizeInput = document.getElementById('facilitySize');
      const employeeCountInput = document.getElementById('employeeCount');
      const powerSourceSelect = document.getElementById('powerSource');
      const monthlyConsumptionInput = document.getElementById('monthlyConsumption');
      const consumptionValue = document.getElementById('consumptionValue');
      const coolingSystemSelect = document.getElementById('coolingSystem');
      const hasRenewable = document.getElementById('hasRenewable');
      const waterSourceSelect = document.getElementById('waterSource');
      const monthlyWaterInput = document.getElementById('monthlyWater');
      const waterValue = document.getElementById('waterValue');
      const hasWaterRecycling = document.getElementById('hasWaterRecycling');
      const networkTypeSelect = document.getElementById('networkType');
      const monthlyDataInput = document.getElementById('monthlyData');
      const dataValue = document.getElementById('dataValue');
      const regionSelect = document.getElementById('region');
      const co2Result = document.getElementById('co2Result');
      const equivalent = document.getElementById('equivalent');
      const chartContainer = document.getElementById('impactChart');
      const graphLegend = document.getElementById('graphLegend');
      const generateBtn = document.getElementById('generateReport');
      const resetBtn = document.getElementById('resetCalculator');

      // Estado de la aplicación
      const state = {
        facilityType: 'dataCenter',
        facilitySize: 100,
        employeeCount: 10,
        powerSource: null,
        monthlyConsumption: 5000,
        coolingSystem: null,
        hasRenewable: true,
        waterSource: null,
        monthlyWater: 50,
        hasWaterRecycling: false,
        networkType: null,
        monthlyData: 5,
        region: null
      };

      // Inicialización
      init();

      function init() {
        populatePowerSourceSelect();
        populateCoolingSystemSelect();
        populateWaterSourceSelect();
        populateNetworkTypeSelect();
        populateRegionSelect();
        setupEventListeners();
        calculateFootprint();
      }

      function setupEventListeners() {
        // Inputs básicos
        facilityTypeSelect.addEventListener('change', function() {
          state.facilityType = this.value;
          calculateFootprint();
        });
        
        facilitySizeInput.addEventListener('input', function() {
          state.facilitySize = parseInt(this.value) || 100;
          calculateFootprint();
        });
        
        employeeCountInput.addEventListener('input', function() {
          state.employeeCount = parseInt(this.value) || 10;
          calculateFootprint();
        });
        
        // Configuración energética
        powerSourceSelect.addEventListener('change', function() {
          state.powerSource = this.value;
          calculateFootprint();
        });
        
        monthlyConsumptionInput.addEventListener('input', updateConsumptionValue);
        coolingSystemSelect.addEventListener('change', function() {
          state.coolingSystem = this.value;
          calculateFootprint();
        });
        hasRenewable.addEventListener('change', calculateFootprint);
        
        // Configuración de agua
        waterSourceSelect.addEventListener('change', function() {
          state.waterSource = this.value;
          calculateFootprint();
        });
        monthlyWaterInput.addEventListener('input', updateWaterValue);
        hasWaterRecycling.addEventListener('change', calculateFootprint);
        
        // Configuración de red
        networkTypeSelect.addEventListener('change', function() {
          state.networkType = this.value;
          calculateFootprint();
        });
        monthlyDataInput.addEventListener('input', updateDataValue);
        regionSelect.addEventListener('change', calculateFootprint);
        
        // Botones de acción
        generateBtn.addEventListener('click', generatePDF);
        resetBtn.addEventListener('click', resetCalculator);
      }

      // Rellenar selectores con datos de facilities
      function populatePowerSourceSelect() {
        powerSourceSelect.innerHTML = '';
        Object.entries(facilities.power).forEach(([name, data]) => {
          const option = document.createElement('option');
          option.value = name;
          option.textContent = `${name} (${data.co2PerKwh.toFixed(3)} kgCO2/kWh)`;
          powerSourceSelect.appendChild(option);
        });
        state.powerSource = powerSourceSelect.value;
      }

      function populateCoolingSystemSelect() {
        coolingSystemSelect.innerHTML = '';
        Object.entries(facilities.coolingSystems).forEach(([name, data]) => {
          const option = document.createElement('option');
          option.value = name;
          option.textContent = `${name} (${(data.waterUsagePerKw * 1000).toFixed(1)} L/kWh)`;
          coolingSystemSelect.appendChild(option);
        });
        state.coolingSystem = coolingSystemSelect.value;
      }

      function populateWaterSourceSelect() {
        waterSourceSelect.innerHTML = '';
        Object.entries(facilities.waterSources).forEach(([name, data]) => {
          const option = document.createElement('option');
          option.value = name;
          option.textContent = `${name} (${data.co2PerLiter.toFixed(4)} kgCO2/L)`;
          waterSourceSelect.appendChild(option);
        });
        state.waterSource = waterSourceSelect.value;
      }

      function populateNetworkTypeSelect() {
        networkTypeSelect.innerHTML = '';
        Object.entries(facilities.networkInfrastructure).forEach(([name, data]) => {
          const option = document.createElement('option');
          option.value = name;
          option.textContent = `${name} (${data.powerPerGbps.toFixed(1)} W/Gbps)`;
          networkTypeSelect.appendChild(option);
        });
        state.networkType = networkTypeSelect.value;
      }

      function populateRegionSelect() {
        regionSelect.innerHTML = '';
        Object.entries(countries).forEach(([name, data]) => {
          const option = document.createElement('option');
          option.value = name;
          option.textContent = `${name} (${data.electricityCo2.toFixed(2)} kgCO2/kWh)`;
          regionSelect.appendChild(option);
        });
        state.region = regionSelect.value;
      }

      // Actualizar valores de sliders
      function updateConsumptionValue() {
        state.monthlyConsumption = parseFloat(this.value);
        consumptionValue.textContent = state.monthlyConsumption;
        calculateFootprint();
      }

      function updateWaterValue() {
        state.monthlyWater = parseFloat(this.value);
        waterValue.textContent = state.monthlyWater;
        calculateFootprint();
      }

      function updateDataValue() {
        state.monthlyData = parseFloat(this.value);
        dataValue.textContent = state.monthlyData;
        calculateFootprint();
      }

      // Calcular huella de carbono
      function calculateFootprint() {
        if (!state.region) {
          updateResultsDisplay(0);
          return;
        }
        
        const regionData = countries[state.region];
        
        // 1. Cálculo de energía
        const powerData = facilities.power[state.powerSource] || facilities.power["Grid Electricity"];
        let energyCO2 = state.monthlyConsumption * 12 * powerData.co2PerKwh;
        
        // Ajustar por región si es energía de red
        if (state.powerSource === "Grid Electricity") {
          energyCO2 = state.monthlyConsumption * 12 * regionData.electricityCo2;
        }
        
        // Ajustar por energía renovable
        if (hasRenewable.checked) {
          energyCO2 *= 0.7; // Reducción del 30% por energía renovable
        }
        
        // 2. Cálculo de agua
        const waterData = facilities.waterSources[state.waterSource] || facilities.waterSources["Municipal Water"];
        let waterCO2 = state.monthlyWater * 12 * 1000 * waterData.co2PerLiter; // Convertir m³ a litros
        
        // Agua para refrigeración
        const coolingData = facilities.coolingSystems[state.coolingSystem] || facilities.coolingSystems["Chilled Water"];
        const coolingWater = state.monthlyConsumption * coolingData.waterUsagePerKw;
        waterCO2 += coolingWater * 12 * 1000 * waterData.co2PerLiter;
        
        // Ajustar por reciclaje de agua
        if (hasWaterRecycling.checked) {
          waterCO2 *= 0.5; // Reducción del 50% por reciclaje
        }
        
        // 3. Cálculo de red
        const networkData = facilities.networkInfrastructure[state.networkType] || facilities.networkInfrastructure["Fiber Optic"];
        const networkEnergy = (state.monthlyData * 1000 * networkData.powerPerGbps) / 1000; // Convertir a kWh
        const networkCO2 = networkEnergy * 12 * regionData.networkCarbonIntensity;
        
        // CO2 total
        const totalCO2 = energyCO2 + waterCO2 + networkCO2;
        
        updateResultsDisplay(totalCO2, energyCO2, waterCO2, networkCO2);
        updateResourceBreakdown(energyCO2, waterCO2, networkCO2, totalCO2);
        drawPieChart(totalCO2, energyCO2, waterCO2, networkCO2);
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
      }

      // Actualizar desglose de recursos
      function updateResourceBreakdown(energyCO2, waterCO2, networkCO2, totalCO2) {
        // Energía
        const energyPercent = totalCO2 > 0 ? (energyCO2 / totalCO2 * 100) : 0;
        document.getElementById('energyMeter').style.width = `${energyPercent}%`;
        document.getElementById('energyCo2').textContent = `${energyCO2.toFixed(1)} kg`;
        document.getElementById('energyPercent').textContent = `${energyPercent.toFixed(1)}%`;
        
        const powerData = facilities.power[state.powerSource] || facilities.power["Grid Electricity"];
        document.getElementById('energyDetails').textContent = 
          `${state.monthlyConsumption * 12} kWh @ ${powerData.co2PerKwh.toFixed(3)} kg/kWh`;
        
        // Agua
        const waterPercent = totalCO2 > 0 ? (waterCO2 / totalCO2 * 100) : 0;
        document.getElementById('waterMeter').style.width = `${waterPercent}%`;
        document.getElementById('waterCo2').textContent = `${waterCO2.toFixed(1)} kg`;
        document.getElementById('waterPercent').textContent = `${waterPercent.toFixed(1)}%`;
        
        const waterData = facilities.waterSources[state.waterSource] || facilities.waterSources["Municipal Water"];
        document.getElementById('waterDetails').textContent = 
          `${state.monthlyWater * 12} m³ @ ${(waterData.co2PerLiter * 1000).toFixed(1)} g/L`;
        
        // Red
        const networkPercent = totalCO2 > 0 ? (networkCO2 / totalCO2 * 100) : 0;
        document.getElementById('networkMeter').style.width = `${networkPercent}%`;
        document.getElementById('networkCo2').textContent = `${networkCO2.toFixed(1)} kg`;
        document.getElementById('networkPercent').textContent = `${networkPercent.toFixed(1)}%`;
        
        const networkData = facilities.networkInfrastructure[state.networkType] || facilities.networkInfrastructure["Fiber Optic"];
        document.getElementById('networkDetails').textContent = 
          `${state.monthlyData * 12} TB @ ${(regionData.networkCarbonIntensity * 1000).toFixed(1)} g/kWh`;
      }

      // Dibujar gráfico de pastel
      function drawPieChart(totalCO2, energyCO2, waterCO2, networkCO2) {
        chartContainer.innerHTML = '';
        graphLegend.innerHTML = '';
        
        if (!totalCO2 || totalCO2 <= 0) {
          chartContainer.innerHTML = '<p class="empty-message">No hay datos para mostrar</p>';
          return;
        }
        
        // Crear categorías para el gráfico
        const categories = [
          { name: "Energía", value: energyCO2, color: '#3498DB' },
          { name: "Agua", value: waterCO2, color: '#2ECC71' },
          { name: "Red", value: networkCO2, color: '#9B59B6' }
        ].filter(cat => cat.value > 0);
        
        // Crear leyenda
        categories.forEach((cat, index) => {
          const percent = (cat.value / totalCO2) * 100;
          
          const legendItem = document.createElement('div');
          legendItem.className = 'legend-item';
          legendItem.innerHTML = `
            <span class="legend-color" style="background: ${cat.color}"></span>
            <span class="legend-name">${cat.name}</span>
            <span class="legend-value">${cat.value.toFixed(1)} kg (${percent.toFixed(1)}%)</span>
          `;
          graphLegend.appendChild(legendItem);
        });
        
        // Crear gráfico de pastel con SVG
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.setAttribute("class", "pie-chart");
        
        let cumulativePercent = 0;
        
        categories.forEach(cat => {
          const percent = (cat.value / totalCO2) * 100;
          
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
          path.setAttribute("data-tooltip", `${cat.name}: ${cat.value.toFixed(1)} kg (${percent.toFixed(1)}%)`);
          
          svg.appendChild(path);
        });
        
        chartContainer.appendChild(svg);
      }

      // Generar reporte PDF
      function generatePDF() {
        const doc = new jsPDF();
        
        // Configuración inicial
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(24);
        doc.setTextColor(44, 62, 80);
        doc.text('Reporte de Huella de Carbono - Instalaciones Físicas', 105, 20, { align: 'center' });
        
        // Logo o icono
        doc.setFontSize(40);
        doc.setTextColor(52, 152, 219);
        doc.text('🏢', 105, 35, { align: 'center' });
        
        // Fecha
        doc.setFontSize(10);
        doc.setTextColor(127, 140, 141);
        doc.text(`Generado: ${new Date().toLocaleDateString()}`, 105, 45, { align: 'center' });
        
        // Configuración de la instalación
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.text('Configuración de la Instalación', 20, 60);
        
        doc.setFontSize(10);
        let yPosition = 70;
        
        doc.text(`• Tipo: ${facilityTypeSelect.options[facilityTypeSelect.selectedIndex].text}`, 20, yPosition);
        yPosition += 7;
        doc.text(`• Tamaño: ${state.facilitySize} m²`, 20, yPosition);
        yPosition += 7;
        doc.text(`• Empleados: ${state.employeeCount}`, 20, yPosition);
        yPosition += 7;
        doc.text(`• Ubicación: ${regionSelect.options[regionSelect.selectedIndex].text}`, 20, yPosition);
        
        // Resultados
        doc.setFontSize(16);
        doc.text('Resultados de Huella de Carbono', 20, yPosition + 15);
        doc.setFontSize(12);
        
        const totalCO2 = parseFloat(co2Result.textContent);
        doc.text(`Huella anual estimada: ${totalCO2.toFixed(1)} kg CO₂eq`, 20, yPosition + 25);
        
        const kmCar = (totalCO2 / 0.12).toFixed(1);
        doc.text(`Equivalente a ${kmCar} km recorridos en automóvil`, 20, yPosition + 35);
        
        // Recomendaciones
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.text('Recomendaciones', 20, yPosition + 50);
        doc.setFontSize(10);
        
        const recommendations = [
          "Implementar sistemas de eficiencia energética",
          "Considerar fuentes de energía renovable",
          "Optimizar sistemas de refrigeración",
          "Implementar sistemas de recolección de agua de lluvia",
          "Mejorar el aislamiento térmico del edificio",
          "Automatizar sistemas de iluminación y climatización",
          "Considerar certificaciones de edificios sostenibles"
        ];
        
        recommendations.forEach((rec, i) => {
          doc.text(`✓ ${rec}`, 20, yPosition + 60 + (i * 7));
        });
        
        // Guardar PDF
        doc.save(`Reporte_Huella_Carbono_Instalacion_${new Date().toISOString().slice(0,10)}.pdf`);
        
        showToast("Reporte generado con éxito");
      }

      // Reiniciar calculadora
      function resetCalculator() {
        facilityTypeSelect.value = 'dataCenter';
        state.facilityType = 'dataCenter';
        facilitySizeInput.value = 100;
        state.facilitySize = 100;
        employeeCountInput.value = 10;
        state.employeeCount = 10;
        powerSourceSelect.value = 'Grid Electricity';
        state.powerSource = 'Grid Electricity';
        monthlyConsumptionInput.value = 5000;
        state.monthlyConsumption = 5000;
        consumptionValue.textContent = '5000';
        coolingSystemSelect.value = 'Chilled Water';
        state.coolingSystem = 'Chilled Water';
        hasRenewable.checked = true;
        waterSourceSelect.value = 'Municipal Water';
        state.waterSource = 'Municipal Water';
        monthlyWaterInput.value = 50;
        state.monthlyWater = 50;
        waterValue.textContent = '50';
        hasWaterRecycling.checked = false;
        networkTypeSelect.value = 'Fiber Optic';
        state.networkType = 'Fiber Optic';
        monthlyDataInput.value = 5;
        state.monthlyData = 5;
        dataValue.textContent = '5';
        regionSelect.value = 'Estados Unidos';
        state.region = 'Estados Unidos';
        
        calculateFootprint();
        showToast("Calculadora reiniciada");
      }

      // Mostrar notificación toast
      function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.remove();
        }, 3000);
      }
    });
 