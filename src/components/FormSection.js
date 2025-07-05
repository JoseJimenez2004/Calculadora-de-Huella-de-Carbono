import { calculateFootprint } from '../utils/calculations.js';
import { Results } from './Results.js';

export class FormSection {
  formData = {
    electricity: 0,
    gas: 0,
    carMileage: 0,
    carEfficiency: 0,
    flights: 0,
    dietType: 'average',
  };

  render() {
    return `
      <section class="eco-card max-w-2xl mx-auto p-8 mb-10">
        <div class="flex items-center mb-8">
          <svg class="w-8 h-8 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
          </svg>
          <h2 class="text-2xl font-semibold text-green-800">Ingresa tus datos</h2>
        </div>
        
        <form id="carbonForm" class="space-y-6">
          <!-- Electricidad -->
          <div class="form-group">
            <label for="electricity" class="block text-sm font-medium text-green-700 mb-2 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Consumo mensual de electricidad (kWh)
            </label>
            <input type="number" id="electricity" name="electricity" 
                   class="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                   placeholder="Ej: 150">
          </div>
          
          <!-- Gas Natural -->
          <div class="form-group">
            <label for="gas" class="block text-sm font-medium text-green-700 mb-2 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7l4-4m0 0l4 4m-4-4v18m-6-3h12a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"></path>
              </svg>
              Consumo mensual de gas natural (m³)
            </label>
            <input type="number" id="gas" name="gas" 
                   class="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                   placeholder="Ej: 20">
          </div>
          
          <!-- Transporte -->
          <div class="border-t border-green-100 pt-6 mt-6">
            <div class="flex items-center mb-4">
              <svg class="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
              </svg>
              <h3 class="text-lg font-medium text-green-800">Transporte</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="carMileage" class="block text-sm font-medium text-green-700 mb-2">Kilómetros anuales en auto</label>
                <input type="number" id="carMileage" name="carMileage" 
                       class="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                       placeholder="Ej: 10000">
              </div>
              
              <div>
                <label for="carEfficiency" class="block text-sm font-medium text-green-700 mb-2">Eficiencia del auto (km/l)</label>
                <input type="number" id="carEfficiency" name="carEfficiency" 
                       class="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                       placeholder="Ej: 12">
              </div>
            </div>
            
            <div class="mt-4">
              <label for="flights" class="block text-sm font-medium text-green-700 mb-2">Vuelos de corta distancia al año</label>
              <input type="number" id="flights" name="flights" 
                     class="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                     placeholder="Ej: 2">
            </div>
          </div>
          
          <!-- Dieta -->
          <div class="border-t border-green-100 pt-6 mt-6">
            <div class="flex items-center mb-4">
              <svg class="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <h3 class="text-lg font-medium text-green-800">Alimentación</h3>
            </div>
            
            <label for="dietType" class="block text-sm font-medium text-green-700 mb-2">Tipo de dieta</label>
            <select id="dietType" name="dietType" 
                    class="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition">
              <option value="vegetarian">Vegetariana</option>
              <option value="vegan">Vegana</option>
              <option value="average" selected>Promedio</option>
              <option value="meatHeavy">Alto consumo de carne</option>
            </select>
          </div>
          
          <button type="submit" class="eco-btn w-full flex justify-center items-center mt-8">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Calcular Huella de Carbono
          </button>
        </form>
      </section>
    `;
  }

  setupEventListeners() {
    const form = document.getElementById('carbonForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.getFormData();
        const results = calculateFootprint(this.formData);
        this.showResults(results);
        
        // Desplazamiento suave a los resultados
        document.getElementById('resultsSection')?.scrollIntoView({ 
          behavior: 'smooth' 
        });
      });
    }
  }

  getFormData() {
    this.formData = {
      electricity: parseFloat(document.getElementById('electricity').value) || 0,
      gas: parseFloat(document.getElementById('gas').value) || 0,
      carMileage: parseFloat(document.getElementById('carMileage').value) || 0,
      carEfficiency: parseFloat(document.getElementById('carEfficiency').value) || 0,
      flights: parseFloat(document.getElementById('flights').value) || 0,
      dietType: document.getElementById('dietType').value,
    };
  }

  showResults(results) {
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
      resultsSection.innerHTML = Results(results);
      resultsSection.classList.add('fade-in');
    }
  }
}