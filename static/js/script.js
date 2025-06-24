    // Cambiar entre pestañas
    function changeTab(tabId) {
      // Ocultar todos los contenidos de pestañas
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      // Desactivar todas las pestañas
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });
      
      // Activar la pestaña seleccionada
      document.getElementById(tabId).classList.add('active');
      
      // Activar el tab correspondiente
      document.querySelectorAll('.tab').forEach(tab => {
        if (tab.textContent.toLowerCase().includes(tabId)) {
          tab.classList.add('active');
        }
      });
      
      // Manejo especial para servidores (mostrar/ocultar campos según tipo)
      if (tabId === 'servidor') {
        document.getElementById('tipoServidor').dispatchEvent(new Event('change'));
      }
    }
    
    // Manejar cambio de tipo de servidor
    document.getElementById('tipoServidor').addEventListener('change', function() {
      const tipo = this.value;
      if (tipo === 'fisico') {
        document.getElementById('servidorFisicoGroup').style.display = 'block';
        document.getElementById('servidorNubeGroup').style.display = 'none';
      } else {
        document.getElementById('servidorFisicoGroup').style.display = 'none';
        document.getElementById('servidorNubeGroup').style.display = 'block';
      }
    });
    
    // Función principal de cálculo
    function calcularHuella() {
      // Determinar qué pestaña está activa
      const activeTab = document.querySelector('.tab-content.active').id;
      let total = 0;
      let descripcion = '';
      let detalles = '';
      let recomendaciones = '';
      
      // Factores de emisión (kg CO₂/kWh)
      const factorCFE = 0.43; // Promedio nacional CFE
      const factorRenovable = 0.05; // Estimado para energía renovable
      const factorMixto = 0.25; // Estimado para energía mixta
      
      if (activeTab === 'movil') {
        // Cálculo para dispositivos móviles
        const tipo = document.getElementById('tipoMovil').value;
        const cantidad = parseInt(document.getElementById('cantidadMovil').value);
        const vidaUtil = parseFloat(document.getElementById('vidaUtilMovil').value);
        const consumo = parseFloat(document.getElementById('consumoMovil').value);
        const cargas = parseInt(document.getElementById('cargasMovil').value);
        const energia = document.getElementById('energiaMovil').value;
        
        // Determinar factor de energía
        let factorEnergia;
        switch(energia) {
          case 'cfe': factorEnergia = factorCFE; break;
          case 'renovable': factorEnergia = factorRenovable; break;
          case 'mixta': factorEnergia = factorMixto; break;
          default: factorEnergia = factorCFE;
        }
        
        // Emisiones operacionales (uso)
        const consumoAnual = (consumo * cargas * 52) / 1000; // kWh/año
        const emisionesUso = consumoAnual * factorEnergia;
        
        // Emisiones incorporadas (manufactura)
        let emisionesManufactura;
        switch(tipo) {
          case 'basico': emisionesManufactura = 30; break;
          case 'smart': emisionesManufactura = 80; break;
          case 'gama_alta': emisionesManufactura = 120; break;
          default: emisionesManufactura = 80;
        }
        
        // Distribuir emisiones de manufactura por años de vida útil
        const emisionesAnualesManufactura = emisionesManufactura / vidaUtil;
        
        // Total por dispositivo
        const totalPorDispositivo = emisionesUso + emisionesAnualesManufactura;
        total = totalPorDispositivo * cantidad;
        
        // Descripción
        descripcion = `Dispositivos móviles (${cantidad}x ${getTipoMovilTexto(tipo)})`;
        detalles = `
          <ul>
            <li>Consumo anual: ${consumoAnual.toFixed(2)} kWh</li>
            <li>Emisiones por uso: ${emisionesUso.toFixed(2)} kg CO₂e</li>
            <li>Emisiones por manufactura (anualizadas): ${emisionesAnualesManufactura.toFixed(2)} kg CO₂e</li>
            <li>Fuente de energía: ${getEnergiaTexto(energia)} (factor: ${factorEnergia} kg CO₂/kWh)</li>
          </ul>
        `;
        
        recomendaciones = `
          <p><strong>Recomendaciones para reducir la huella:</strong></p>
          <ul>
            <li>Extender la vida útil del dispositivo más allá de ${vidaUtil} años</li>
            <li>Usar cargadores eficientes y desconectarlos cuando no estén en uso</li>
            <li>Considerar energía renovable para la carga</li>
            ${tipo !== 'basico' ? '<li>Reducir el uso de funciones energéticas intensivas (ej. streaming en alta calidad)</li>' : ''}
          </ul>
        `;
        
      } else if (activeTab === 'pc') {
        // Cálculo para computadoras
        const tipo = document.getElementById('tipoPC').value;
        const potencia = parseFloat(document.getElementById('potenciaPC').value);
        const horas = parseFloat(document.getElementById('horasPC').value);
        const dias = parseFloat(document.getElementById('diasPC').value);
        const cantidad = parseInt(document.getElementById('cantidadPC').value);
        const vidaUtil = parseFloat(document.getElementById('vidaUtilPC').value);
        
        // Consumo energético anual (kWh)
        const consumoAnual = (potencia * horas * dias) / 1000;
        
        // Emisiones operacionales (asumimos CFE como fuente)
        const emisionesUso = consumoAnual * factorCFE;
        
        // Emisiones incorporadas (manufactura)
        let emisionesManufactura;
        if (tipo === 'laptop') {
          emisionesManufactura = 200; // kg CO₂e para laptops
        } else {
          emisionesManufactura = 350; // kg CO₂e para equipos de escritorio
        }
        
        // Distribuir emisiones de manufactura por años de vida útil
        const emisionesAnualesManufactura = emisionesManufactura / vidaUtil;
        
        // Total por equipo
        const totalPorEquipo = emisionesUso + emisionesAnualesManufactura;
        total = totalPorEquipo * cantidad;
        
        // Descripción
        descripcion = `Computadoras (${cantidad}x ${tipo === 'laptop' ? 'Laptop' : 'Escritorio'})`;
        detalles = `
          <ul>
            <li>Consumo anual: ${consumoAnual.toFixed(2)} kWh</li>
            <li>Emisiones por uso: ${emisionesUso.toFixed(2)} kg CO₂e</li>
            <li>Emisiones por manufactura (anualizadas): ${emisionesAnualesManufactura.toFixed(2)} kg CO₂e</li>
            <li>Factor de emisión eléctrica: ${factorCFE} kg CO₂/kWh (CFE)</li>
          </ul>
        `;
        
        recomendaciones = `
          <p><strong>Recomendaciones para reducir la huella:</strong></p>
          <ul>
            <li>Configurar modos de ahorro de energía en los equipos</li>
            <li>Apagar equipos cuando no estén en uso, especialmente por la noche</li>
            <li>Extender la vida útil más allá de ${vidaUtil} años</li>
            <li>Considerar equipos con certificación ENERGY STAR</li>
            ${tipo === 'escritorio' ? '<li>Para escritorios, considerar monitores más eficientes y reducir tarjetas gráficas potentes si no son necesarias</li>' : ''}
          </ul>
        `;
        
      } else if (activeTab === 'servidor') {
        // Cálculo para servidores
        const tipo = document.getElementById('tipoServidor').value;
        
        if (tipo === 'fisico') {
          // Servidores físicos
          const potencia = parseFloat(document.getElementById('potenciaServidor').value);
          const pue = parseFloat(document.getElementById('pue').value);
          const cantidad = parseInt(document.getElementById('cantidadServidor').value);
          
          // Consumo energético anual (kWh) - 24/7 operación
          const consumoAnual = (potencia * pue * 24 * 365) / 1000;
          
          // Emisiones operacionales (asumimos CFE)
          const emisionesUso = consumoAnual * factorCFE;
          
          // Emisiones incorporadas (manufactura)
          const emisionesManufactura = 1500; // kg CO₂e por servidor físico
          const vidaUtil = 5; // años
          const emisionesAnualesManufactura = emisionesManufactura / vidaUtil;
          
          // Total por servidor
          const totalPorServidor = emisionesUso + emisionesAnualesManufactura;
          total = totalPorServidor * cantidad;
          
          // Descripción
          descripcion = `Servidores físicos (${cantidad}x)`;
          detalles = `
            <ul>
              <li>Consumo anual: ${consumoAnual.toFixed(2)} kWh</li>
              <li>PUE (eficiencia del centro de datos): ${pue.toFixed(1)}</li>
              <li>Emisiones por uso: ${emisionesUso.toFixed(2)} kg CO₂e</li>
              <li>Emisiones por manufactura (anualizadas): ${emisionesAnualesManufactura.toFixed(2)} kg CO₂e</li>
              <li>Factor de emisión eléctrica: ${factorCFE} kg CO₂/kWh (CFE)</li>
            </ul>
          `;
          
          recomendaciones = `
            <p><strong>Recomendaciones para reducir la huella:</strong></p>
            <ul>
              <li>Mejorar el PUE del centro de datos (ideal <1.5)</li>
              <li>Implementar estrategias de virtualización y consolidación</li>
              <li>Considerar enfriamiento más eficiente (free cooling, pasillos fríos/calientes)</li>
              <li>Actualizar a hardware más eficiente energéticamente</li>
              <li>Considerar migración parcial a la nube para cargas variables</li>
            </ul>
          `;
          
        } else {
          // Servidores en la nube
          const proveedor = document.getElementById('proveedorNube').value;
          const tipoInstancia = document.getElementById('tipoInstancia').value;
          const cantidad = parseInt(document.getElementById('cantidadInstancias').value);
          
          // Factores de emisión por proveedor (estimados basados en reportes de sostenibilidad)
          let factorProveedor;
          switch(proveedor) {
            case 'aws': factorProveedor = 0.35; break; // AWS tiene regiones con energías renovables
            case 'azure': factorProveedor = 0.4; break;
            case 'google': factorProveedor = 0.3; break; // Google tiene compromisos muy fuertes con renovables
            default: factorProveedor = 0.45;
          }
          
          // Consumo estimado por tipo de instancia (kWh/año)
          let consumoAnual;
          switch(tipoInstancia) {
            case 'pequena': consumoAnual = 500; break;
            case 'mediana': consumoAnual = 1000; break;
            case 'grande': consumoAnual = 2000; break;
            default: consumoAnual = 1000;
          }
          
          // Emisiones totales
          total = consumoAnual * factorProveedor * cantidad;
          
          // Descripción
          descripcion = `Servidores en la nube (${cantidad}x ${getTipoInstanciaTexto(tipoInstancia)})`;
          detalles = `
            <ul>
              <li>Proveedor: ${getProveedorTexto(proveedor)}</li>
              <li>Consumo estimado anual: ${consumoAnual} kWh por instancia</li>
              <li>Factor de emisión del proveedor: ${factorProveedor} kg CO₂/kWh</li>
              <li>Nota: Los proveedores de nube publican sus factores de emisión específicos por región</li>
            </ul>
          `;
          
          recomendaciones = `
            <p><strong>Recomendaciones para reducir la huella:</strong></p>
            <ul>
              <li>Seleccionar regiones con mayor porcentaje de energía renovable</li>
              <li>Implementar autoescalado para reducir instancias ociosas</li>
              <li>Optimizar arquitectura para reducir necesidades computacionales</li>
              <li>Considerar servicios serverless para cargas variables</li>
              <li>Revisar reportes de sostenibilidad del proveedor para opciones específicas</li>
            </ul>
          `;
        }
        
      } else if (activeTab === 'instalacion') {
        // Cálculo para instalaciones
        const kwh = parseFloat(document.getElementById('kwh').value);
        const personas = parseInt(document.getElementById('personasInstalacion').value);
        const energia = document.getElementById('tipoEnergia').value;
        const temporada = document.getElementById('temporada').value;
        
        // Determinar factor de energía
        let factorEnergia;
        switch(energia) {
          case 'cfe': factorEnergia = factorCFE; break;
          case 'renovable': factorEnergia = factorRenovable; break;
          case 'mixta': factorEnergia = factorMixto; break;
          default: factorEnergia = factorCFE;
        }
        
        // Ajuste por temporada
        let factorTemporada = 1;
        if (temporada === 'verano') factorTemporada = 1.2;
        else if (temporada === 'invierno') factorTemporada = 0.9;
        
        // Consumo anual (kWh)
        const consumoAnual = kwh * 12 * factorTemporada;
        
        // Emisiones totales
        total = consumoAnual * factorEnergia;
        
        // Normalización por persona
        const totalPorPersona = total / personas;
        
        // Descripción
        descripcion = `Instalaciones eléctricas`;
        detalles = `
          <ul>
            <li>Consumo anual estimado: ${consumoAnual.toFixed(2)} kWh</li>
            <li>Factor de emisión: ${factorEnergia} kg CO₂/kWh (${getEnergiaTexto(energia)})</li>
            <li>Ajuste por temporada: ${temporada} (factor: ${factorTemporada})</li>
            <li>Huella total: ${total.toFixed(2)} kg CO₂e</li>
            <li>Huella por persona: ${totalPorPersona.toFixed(2)} kg CO₂e</li>
          </ul>
        `;
        
        recomendaciones = `
          <p><strong>Recomendaciones para reducir la huella:</strong></p>
          <ul>
            <li>Implementar medidas de eficiencia energética (iluminación LED, equipos eficientes)</li>
            <li>Considerar sistemas de energía renovable (paneles solares)</li>
            <li>Mejorar aislamiento térmico para reducir necesidades de climatización</li>
            <li>Implementar políticas de apagado automático de equipos</li>
            <li>Monitorear consumos con medidores inteligentes para identificar oportunidades</li>
          </ul>
        `;
      }
      
      // Mostrar resultados
      const resultado = document.getElementById('resultado');
      resultado.innerHTML = `
        <h3>Resultados para ${descripcion}</h3>
        <p><strong>Huella estimada: ${total.toFixed(2)} kg CO₂e por año</strong></p>
        ${detalles}
        ${recomendaciones}
        <p class="info-text">* Los cálculos consideran tanto emisiones operacionales como incorporadas (embedded emissions).</p>
      `;
    }
    
    // Funciones auxiliares para texto descriptivo
    function getTipoMovilTexto(tipo) {
      switch(tipo) {
        case 'basico': return 'Teléfono básico';
        case 'smart': return 'Smartphone gama media';
        case 'gama_alta': return 'Smartphone gama alta';
        default: return tipo;
      }
    }
    
    function getEnergiaTexto(energia) {
      switch(energia) {
        case 'cfe': return 'CFE (red eléctrica nacional)';
        case 'renovable': return 'Energía renovable';
        case 'mixta': return 'Energía mixta';
        default: return energia;
      }
    }
    
    function getProveedorTexto(proveedor) {
      switch(proveedor) {
        case 'aws': return 'Amazon Web Services';
        case 'azure': return 'Microsoft Azure';
        case 'google': return 'Google Cloud';
        default: return proveedor;
      }
    }
    
    function getTipoInstanciaTexto(tipo) {
      switch(tipo) {
        case 'pequena': return 'Instancia pequeña';
        case 'mediana': return 'Instancia mediana';
        case 'grande': return 'Instancia grande';
        default: return tipo;
      }
    }
    
    // Inicializar eventos
    document.addEventListener('DOMContentLoaded', function() {
      // Configurar evento para servidores
      document.getElementById('tipoServidor').addEventListener('change', function() {
        const tipo = this.value;
        if (tipo === 'fisico') {
          document.getElementById('servidorFisicoGroup').style.display = 'block';
          document.getElementById('servidorNubeGroup').style.display = 'none';
        } else {
          document.getElementById('servidorFisicoGroup').style.display = 'none';
          document.getElementById('servidorNubeGroup').style.display = 'block';
        }
      });
    });
  