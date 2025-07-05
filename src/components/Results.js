export function Results(data) {
  return `
    <section class="eco-card max-w-2xl mx-auto p-8 mb-10">
      <div class="flex items-center mb-6">
        <svg class="w-8 h-8 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        <h2 class="text-2xl font-semibold text-green-800">Tus Resultados</h2>
      </div>
      
      <!-- Gráfico circular SVG -->
      <div class="flex justify-center mb-8">
        <svg width="200" height="200" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="#f0f7f4" stroke="#e0f2e9" stroke-width="3"/>
          <path d="M50 5 A45 45 0 ${data.housing/data.total > 0.5 ? 1 : 0} 1 ${50 + 45 * Math.cos(2 * Math.PI * data.housing/data.total)} ${50 + 45 * Math.sin(2 * Math.PI * data.housing/data.total)}" 
                fill="#2e8b57" opacity="0.8"/>
          <path d="M50 5 A45 45 0 ${(data.housing+data.transportation)/data.total > 0.5 ? 1 : 0} 1 ${50 + 45 * Math.cos(2 * Math.PI * (data.housing+data.transportation)/data.total)} ${50 + 45 * Math.sin(2 * Math.PI * (data.housing+data.transportation)/data.total)}" 
                fill="#3aa76d" opacity="0.8" transform="rotate(${360 * data.housing/data.total} 50 50)"/>
          <circle cx="50" cy="50" r="15" fill="#f8fdfa"/>
          <text x="50" y="50" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="#2e8b57" font-weight="bold">${data.total.toFixed(1)}t</text>
        </svg>
      </div>
      
      <!-- Resto del contenido de resultados... -->
    </section>
  `;
}