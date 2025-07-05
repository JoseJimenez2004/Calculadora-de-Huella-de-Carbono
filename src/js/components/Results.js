function Results(data) {
    const total = data.total.toFixed(2);
    const comparison = (data.total / 4.8).toFixed(1);

    return `
        <section>
            <h2>Tus Resultados</h2>
            
            <div class="results-container">
                <p>Tu huella de carbono anual es de <strong>${total} toneladas</strong> de CO₂.</p>
            </div>
            
            <div class="results-grid">
                <div>
                    <h3>Desglose por categoría</h3>
                    <ul>
                        <li>Hogar (electricidad y gas): <strong>${data.housing.toFixed(2)} ton</strong></li>
                        <li>Transporte (auto y vuelos): <strong>${data.transportation.toFixed(2)} ton</strong></li>
                        <li>Dieta: <strong>${data.food.toFixed(2)} ton</strong></li>
                    </ul>
                </div>
                
                <div>
                    <h3>Comparación</h3>
                    <p>Tu huella de carbono es ${comparison}x el promedio mundial (4.8 ton/año).</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${Math.min(100, (data.total / 4.8) * 50)}%"></div>
                    </div>
                </div>
            </div>
        </section>
    `;
}