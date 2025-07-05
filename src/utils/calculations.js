import { EMISSION_FACTORS, DIET_FACTORS } from './constants.js';

export function calculateFootprint(data) {
  const electricityEmissions = (data.electricity * EMISSION_FACTORS.electricity * 12) / 1000;
  const gasEmissions = (data.gas * EMISSION_FACTORS.gas * 12) / 1000;
  const housing = electricityEmissions + gasEmissions;

  const litersUsed = data.carMileage / data.carEfficiency;
  const carEmissions = (litersUsed * EMISSION_FACTORS.car) / 1000;
  const flightsEmissions = (data.flights * EMISSION_FACTORS.flight) / 1000;
  const transportation = carEmissions + flightsEmissions;

  const food = (DIET_FACTORS[data.dietType] * 365) / 1000;

  return {
    housing,
    transportation,
    food,
    total: housing + transportation + food,
  };
}