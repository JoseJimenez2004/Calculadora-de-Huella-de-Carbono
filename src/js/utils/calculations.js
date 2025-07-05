const EMISSION_FACTORS = {
    electricity: 0.5, // kg CO2 per kWh
    gas: 2.0,        // kg CO2 per m3
    car: 2.31,       // kg CO2 per liter of gasoline
    flight: 90       // kg CO2 per short-haul flight
};

const DIET_FACTORS = {
    vegetarian: 1.7,
    vegan: 1.5,
    average: 2.5,
    meatHeavy: 3.3
};

function calculateFootprint(data) {
    // Calcular emisiones de hogar (convertir a toneladas)
    const electricityEmissions = (data.electricity * EMISSION_FACTORS.electricity * 12) / 1000;
    const gasEmissions = (data.gas * EMISSION_FACTORS.gas * 12) / 1000;
    const housing = electricityEmissions + gasEmissions;

    // Calcular emisiones de transporte
    const litersUsed = data.carMileage / data.carEfficiency;
    const carEmissions = (litersUsed * EMISSION_FACTORS.car) / 1000;
    const flightsEmissions = (data.flights * EMISSION_FACTORS.flight) / 1000;
    const transportation = carEmissions + flightsEmissions;

    // Calcular emisiones de dieta
    const food = (DIET_FACTORS[data.dietType] * 365) / 1000;

    // Total
    const total = housing + transportation + food;

    return {
        housing,
        transportation,
        food,
        total
    };
}