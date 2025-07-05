export function Tips() {
  return `
    <section class="eco-card max-w-2xl mx-auto p-8">
      <div class="flex items-center mb-6">
        <svg class="w-8 h-8 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
        </svg>
        <h2 class="text-2xl font-semibold text-green-800">Cómo reducir tu huella</h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Tarjeta de consejo con SVG -->
        <div class="bg-green-50 p-5 rounded-lg border border-green-100">
          <div class="flex items-start">
            <svg class="w-6 h-6 mt-1 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <div>
              <h3 class="font-medium text-green-800 mb-2">🏠 En tu hogar</h3>
              <ul class="list-disc pl-5 space-y-1 text-green-700">
                <li>Usa bombillas LED</li>
                <li>Ajusta el termostato 1-2°C</li>
                <li>Desconecta dispositivos que no uses</li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Más tarjetas de consejos... -->
      </div>
      
      <!-- Gráfico SVG decorativo -->
      <div class="mt-8 text-center">
        <svg class="w-full h-32" viewBox="0 0 400 100">
          <path d="M20,50 Q100,10 180,50 T340,50" stroke="#2e8b57" stroke-width="2" fill="none"/>
          <circle cx="20" cy="50" r="5" fill="#2e8b57"/>
          <circle cx="100" cy="10" r="5" fill="#3aa76d"/>
          <circle cx="180" cy="50" r="5" fill="#2e8b57"/>
          <circle cx="260" cy="90" r="5" fill="#3aa76d"/>
          <circle cx="340" cy="50" r="5" fill="#2e8b57"/>
          <text x="20" y="70" text-anchor="middle" font-size="8" fill="#2e8b57">Hogar</text>
          <text x="100" y="30" text-anchor="middle" font-size="8" fill="#3aa76d">Transporte</text>
          <text x="180" y="70" text-anchor="middle" font-size="8" fill="#2e8b57">Dieta</text>
        </svg>
      </div>
    </section>
  `;
}