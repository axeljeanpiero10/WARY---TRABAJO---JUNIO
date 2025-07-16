    const origen = localStorage.getItem("origen");// Obtener el origen 
    const destino = localStorage.getItem("destino");// Obtener el destino 
    const fecha = localStorage.getItem("fecha");// Obtener la fecha 

    document.getElementById("resumenBusqueda").textContent = `Desde: ${origen} | Hasta: ${destino} | Fecha: ${fecha}`;

    // Lista de empresas simuladas
    const agencias = [
      { empresa: "Perú Cargo Express", origen: "Lima", destino: "Arequipa", horario: "08:00 AM", costo: 150, tiempo: "2 días" },
      { empresa: "Aduana Rápida SAC", origen: "Lima", destino: "Cusco", horario: "10:00 AM", costo: 180, tiempo: "3 días" },
      { empresa: "Jet Aduanas", origen: "Lima", destino: "Arequipa", horario: "03:00 PM", costo: 130, tiempo: "1.5 días" },
      { empresa: "Andina Logística", origen: "Tacna", destino: "Lima", horario: "07:00 AM", costo: 200, tiempo: "2.5 días" },
    ];

    const resultados = agencias.filter(a =>
      a.origen.toLowerCase() === origen.toLowerCase() &&
      a.destino.toLowerCase() === destino.toLowerCase()
    );// Filtrar agencias según origen y destino

    const contenedor = document.getElementById("resultados");

    if (resultados.length > 0) {
      resultados.forEach(a => {
        contenedor.innerHTML += `
          <div class="empresa">
            <h2>${a.empresa}</h2>
            <p>Horario de salida: ${a.horario}</p>
            <p>Costo estimado: S/.${a.costo}</p>
            <p>Tiempo de envío estimado: ${a.tiempo}</p>
          </div>
        `;
      });// Mostrar resultados de las agencias encontradas
    } else {
      contenedor.innerHTML = `<p>No se encontraron agencias para el origen y destino seleccionados.</p>`;
    }