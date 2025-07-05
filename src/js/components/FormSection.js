class FormSection {
    constructor() {
        this.formData = {
            electricity: 0,
            gas: 0,
            carMileage: 0,
            carEfficiency: 0,
            flights: 0,
            dietType: 'average'
        };
    }

    render() {
        return `
            <section>
                <h2>Ingresa tus datos</h2>
                <form id="carbonForm" class="carbon-form">
                    <div class="form-group">
                        <label for="electricity">Consumo mensual de electricidad (kWh)</label>
                        <input type="number" id="electricity" name="electricity">
                    </div>
                    
                    <div class="form-group">
                        <label for="gas">Consumo mensual de gas natural (m³)</label>
                        <input type="number" id="gas" name="gas">
                    </div>
                    
                    <div class="form-group">
                        <label>Transporte</label>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="carMileage">Kilómetros anuales en auto</label>
                                <input type="number" id="carMileage" name="carMileage">
                            </div>
                            
                            <div class="form-group">
                                <label for="carEfficiency">Eficiencia del auto (km/l)</label>
                                <input type="number" id="carEfficiency" name="carEfficiency">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="flights">Vuelos de corta distancia al año</label>
                            <input type="number" id="flights" name="flights">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="dietType">Tipo de dieta</label>
                        <select id="dietType" name="dietType">
                            <option value="vegetarian">Vegetariana</option>
                            <option value="vegan">Vegana</option>
                            <option value="average" selected>Promedio</option>
                            <option value="meatHeavy">Alto consumo de carne</option>
                        </select>
                    </div>
                    
                    <button type="submit">Calcular Huella de Carbono</button>
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
            dietType: document.getElementById('dietType').value
        };
    }

    showResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.innerHTML = Results(results);
        }
    }
}