    const origen = localStorage.getItem("origen")?.toLowerCase();
                const destino = localStorage.getItem("destino")?.toLowerCase();
                const fecha = localStorage.getItem("fecha") || "Sin fecha";

                const empresas = ["Aduaperu Express", "GlobalCarga SAC", "RedAduanas", "LogistiMundo", "Andina Express", "Cargas El Cóndor", "Agencia Aduanera Titan", "MegaExport"];
                const horarios = ["08:00 AM", "11:30 AM", "01:00 PM", "04:45 PM", "06:20 PM", "09:10 PM"];
                const duraciones = ["2 días", "3 días", "4 días", "5 días"];
                const precios = [120, 150, 180, 200, 230, 260];

                const resultados = [];

                for (let i = 0; i < 6; i++)// Generar 6 resultados aleatorios
                resultados.push({
                    empresa: empresas[i],
                    salida: horarios[Math.floor(Math.random() * horarios.length)],// Seleccionar un horario aleatorio
                    llegada: horarios[Math.floor(Math.random() * horarios.length)],// Seleccionar un horario aleatorio
                    duracion: duraciones[Math.floor(Math.random() * duraciones.length)],// Seleccionar una duración aleatoria
                    precio: precios[Math.floor(Math.random() * precios.length)],// Seleccionar un precio aleatorio
                    origen: origen?.charAt(0).toUpperCase() + origen?.slice(1),// Capitalizar la primera letra del origen
                    destino: destino?.charAt(0).toUpperCase() + destino?.slice(1),// Capitalizar la primera letra del destino
                    fecha: fecha
                });
                

                const contenedor = document.getElementById("resultados");

                resultados.forEach(r => {// Crear un div para cada resultado
                const div = document.createElement("div");
                div.classList.add("resultado");
                div.innerHTML = `
                    <div class="empresa">${r.empresa}</div>// Mostrar el nombre de la empresa
                    <div class="info">
                    <div><strong>Origen:</strong> ${r.origen}</div>
                    <div><strong>Destino:</strong> ${r.destino}</div>
                    </div>
                    <div class="info">
                    <div><strong>Salida:</strong> ${r.salida}</div>
                    <div><strong>Llegada:</strong> ${r.llegada}</div>
                    <div><strong>Duración:</strong> ${r.duracion}</div>
                    </div>
                    <div class="info">
                    <div class="tag">Costo: S/ ${r.precio}</div>
                    <div class="tag">Fecha: ${r.fecha}</div>
                    </div>
                `;
                contenedor.appendChild(div);// Añadir el div al contenedor principal
                });