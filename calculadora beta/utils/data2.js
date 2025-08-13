// src/data2.js
window.CalculatorData = {
  components: {
    cpu: {
      "Intel Xeon Platinum 8480+": { tdp: 350, co2Manufacturing: 1200 },
      "AMD EPYC 9654": { tdp: 360, co2Manufacturing: 1250 },
      "Intel Xeon Gold 6430": { tdp: 270, co2Manufacturing: 950 },
      "AMD EPYC 7773X": { tdp: 280, co2Manufacturing: 980 },
      "Amazon Graviton3": { tdp: 200, co2Manufacturing: 800 },
      "Ampere Altra Max": { tdp: 180, co2Manufacturing: 750 },
      "IBM Power10": { tdp: 400, co2Manufacturing: 1400 }
    },
    gpu: {
      "NVIDIA H100": { tdp: 700, co2Manufacturing: 1800 },
      "NVIDIA A100": { tdp: 400, co2Manufacturing: 1200 },
      "AMD Instinct MI250X": { tdp: 560, co2Manufacturing: 1500 },
      "Intel Ponte Vecchio": { tdp: 600, co2Manufacturing: 1600 },
      "NVIDIA T4": { tdp: 70, co2Manufacturing: 400 }
    },
    ram: {
      "64GB DDR4": { tdp: 15, co2Manufacturing: 120 },
      "128GB DDR4": { tdp: 30, co2Manufacturing: 200 },
      "256GB DDR4": { tdp: 45, co2Manufacturing: 300 },
      "512GB DDR4": { tdp: 60, co2Manufacturing: 400 },
      "64GB DDR5": { tdp: 12, co2Manufacturing: 150 },
      "128GB DDR5": { tdp: 25, co2Manufacturing: 250 },
      "256GB DDR5": { tdp: 40, co2Manufacturing: 350 },
      "512GB DDR5": { tdp: 55, co2Manufacturing: 450 }
    },
    storage: {
      "480GB SSD SATA": { tdp: 5, co2Manufacturing: 80 },
      "960GB SSD SATA": { tdp: 8, co2Manufacturing: 120 },
      "1.92TB SSD SATA": { tdp: 10, co2Manufacturing: 150 },
      "480GB SSD NVMe": { tdp: 7, co2Manufacturing: 100 },
      "960GB SSD NVMe": { tdp: 9, co2Manufacturing: 140 },
      "1.92TB SSD NVMe": { tdp: 12, co2Manufacturing: 180 },
      "3.84TB SSD NVMe": { tdp: 15, co2Manufacturing: 250 },
      "7.68TB SSD NVMe": { tdp: 20, co2Manufacturing: 350 },
      "10TB HDD": { tdp: 8, co2Manufacturing: 60 },
      "16TB HDD": { tdp: 10, co2Manufacturing: 80 },
      "20TB HDD": { tdp: 12, co2Manufacturing: 100 }
    },
    psu: {
      "800W Platinum": { tdp: 10, co2Manufacturing: 150 },
      "1200W Platinum": { tdp: 15, co2Manufacturing: 200 },
      "1600W Platinum": { tdp: 20, co2Manufacturing: 250 },
      "2000W Platinum": { tdp: 25, co2Manufacturing: 300 },
      "3000W Titanium": { tdp: 30, co2Manufacturing: 400 }
    },
    cooling: {
      "Air Cooling Standard": { tdp: 50, co2Manufacturing: 100 },
      "Air Cooling High Performance": { tdp: 80, co2Manufacturing: 150 },
      "Liquid Cooling Standard": { tdp: 30, co2Manufacturing: 200 },
      "Liquid Cooling High Performance": { tdp: 50, co2Manufacturing: 300 },
      "Immersion Cooling": { tdp: 20, co2Manufacturing: 500 }
    }
  },
  serverTypes: {
    "Rack Server 1U": { baseTdp: 100, baseCo2: 300 },
    "Rack Server 2U": { baseTdp: 150, baseCo2: 400 },
    "Rack Server 4U": { baseTdp: 200, baseCo2: 500 },
    "Blade Server": { baseTdp: 120, baseCo2: 350 },
    "Tower Server": { baseTdp: 180, baseCo2: 450 },
    "Hyperconverged System": { baseTdp: 300, baseCo2: 700 },
    "Storage Server": { baseTdp: 250, baseCo2: 600 }
  },
  countries: {
    "México": 0.45,
    "España": 0.22,
    "Portugal": 0.25,
    "Francia": 0.08,
    "Alemania": 0.40,
    "Italia": 0.35,
    "Reino Unido": 0.23,
    "Irlanda": 0.30,
    "Noruega": 0.05,
    "Suecia": 0.03,
    "Finlandia": 0.10,
    "Dinamarca": 0.15,
    "Países Bajos": 0.42,
    "Bélgica": 0.18,
    "Suiza": 0.12,
    "Austria": 0.20,
    "Polonia": 0.75,
    "Estados Unidos": 0.38,
    "Canadá": 0.12,
    "Brasil": 0.55,
    "Argentina": 0.40,
    "Chile": 0.35,
    "Colombia": 0.50,
    "Perú": 0.45,
    "China": 0.68,
    "India": 0.82,
    "Japón": 0.45,
    "Corea del Sur": 0.45,
    "Australia": 0.60,
    "Nueva Zelanda": 0.15,
    "Sudáfrica": 0.90,
    "Emiratos Árabes": 0.55,
    "Arabia Saudita": 0.65,
    "Rusia": 0.40,
    "Turquía": 0.50
  }
};