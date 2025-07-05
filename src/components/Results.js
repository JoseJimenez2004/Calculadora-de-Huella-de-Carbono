export function Results(data) {
  const total = data.total.toFixed(2);
  const comparison = (data.total / 4.8).toFixed(1);

  return `
    <section id="results" class="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Tus Resultados</h2>
      <div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
        <p class="text-lg font-medium text-green-800">
          Tu huella de carbono anual es de <span class="font-bold">${total} toneladas</span> de CO₂.
        </p>
      </div>
      <!-- Resto del contenido... -->
    </section>
  `;
}