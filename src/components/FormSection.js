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
      <section class="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Ingresa tus datos</h2>
        <form id="carbonForm" class="space-y-6">
          <!-- Campos del formulario... -->
          <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-300">
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
    }
  }
}