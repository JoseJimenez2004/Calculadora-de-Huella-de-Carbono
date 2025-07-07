// src/data.js
window.CalculatorData = {
  components: {
    cpu: {
      "Intel i9-13900K": { tdp: 125, co2Manufacturing: 200 },
      "AMD Ryzen 7 5800X": { tdp: 105, co2Manufacturing: 180 },
      "Intel i5-12400": { tdp: 65, co2Manufacturing: 120 },
      "AMD Ryzen 5 5600G": { tdp: 65, co2Manufacturing: 110 }
    },
    gpu: {
      "NVIDIA RTX 4090": { tdp: 450, co2Manufacturing: 400 },
      "AMD RX 7900 XT": { tdp: 355, co2Manufacturing: 350 },
      "NVIDIA GTX 1660": { tdp: 120, co2Manufacturing: 150 },
      "AMD RX 6600": { tdp: 132, co2Manufacturing: 140 }
    },
    ram: {
      "8GB DDR4": { tdp: 4, co2Manufacturing: 20 },
      "16GB DDR4": { tdp: 8, co2Manufacturing: 35 },
      "32GB DDR5": { tdp: 10, co2Manufacturing: 50 }
    },
    storage: {
      "SSD 512GB": { tdp: 3, co2Manufacturing: 30 },
      "HDD 1TB": { tdp: 6, co2Manufacturing: 50 },
      "SSD NVMe 1TB": { tdp: 5, co2Manufacturing: 45 }
    },
    psu: {
      "500W Bronze": { tdp: 10, co2Manufacturing: 60 },
      "650W Gold": { tdp: 12, co2Manufacturing: 70 },
      "750W Platinum": { tdp: 15, co2Manufacturing: 80 }
    }
  },
  countries: {
    "México": 0.45,
    "España": 0.22,
    "Estados Unidos": 0.38,
    "Alemania": 0.40,
    "Noruega": 0.05,
    "China": 0.68
  }
};