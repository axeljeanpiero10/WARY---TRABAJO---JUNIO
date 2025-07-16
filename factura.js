// Constantes y variables globales
const IGV_RATE = 0.18; // 18%

let invoiceItems = []; // Array para almacenar los ítems de la factura
let invoiceNumberCounter = 1; // Para generar números de factura simples

// Referencias a elementos del DOM
const itemsTableBody = document.getElementById('itemsTableBody');
const addItemBtn = document.getElementById('addItemBtn');
const subTotalSpan = document.getElementById('subTotalSpan');
const igvSpan = document.getElementById('igvSpan');
const totalSpan = document.getElementById('totalSpan');
const totalInWordsSpan = document.getElementById('totalInWords');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const clientNameInput = document.getElementById('clientName');
const clientIdInput = document.getElementById('clientId');
const invoiceDateSpan = document.getElementById('invoiceDate');
const invoiceNumberSpan = document.getElementById('invoiceNumber');

// --- Funciones principales ---

// Inicializa la factura al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadInvoiceData();
    updateInvoiceDate();
    updateInvoiceNumber();
    renderInvoiceItems();
});

// Actualiza la fecha actual de la factura
function updateInvoiceDate() {
    const today = new Date();
    invoiceDateSpan.textContent = today.toLocaleDateString('es-ES');
}

// Actualiza el número de factura (simple, solo incrementa)
function updateInvoiceNumber() {
    // Puedes cargar esto de localStorage si quieres que persista en el tiempo
    let currentNumber = parseInt(localStorage.getItem('invoiceNumberCounter') || '1');
    invoiceNumberCounter = currentNumber;
    invoiceNumberSpan.textContent = `001-${String(invoiceNumberCounter).padStart(6, '0')}`;
}

// Guarda los datos de la factura en localStorage
function saveInvoiceData() {
    const invoiceData = {
        items: invoiceItems,
        clientName: clientNameInput.value,
        clientId: clientIdInput.value,
        invoiceNumber: invoiceNumberCounter // Guardar el contador si quieres persistencia
    };
    localStorage.setItem('simpleInvoiceData', JSON.stringify(invoiceData));
    localStorage.setItem('invoiceNumberCounter', invoiceNumberCounter.toString());
}

// Carga los datos de la factura desde localStorage
function loadInvoiceData() {
    const savedData = localStorage.getItem('simpleInvoiceData');
    if (savedData) {
        const data = JSON.parse(savedData);
        invoiceItems = data.items || [];
        clientNameInput.value = data.clientName || '';
        clientIdInput.value = data.clientId || '';
        invoiceNumberCounter = data.invoiceNumber || 1;
    }
}

// Renderiza los ítems en la tabla
function renderInvoiceItems() {
    itemsTableBody.innerHTML = ''; // Limpia la tabla existente

    if (invoiceItems.length === 0) {
        // Opcional: Mostrar un mensaje si no hay ítems
        // itemsTableBody.innerHTML = '<tr><td colspan="5">No hay ítems en la factura.</td></tr>';
    }

    invoiceItems.forEach(item => {
        const row = itemsTableBody.insertRow();
        row.dataset.id = item.id;

        row.innerHTML = `
            <td><input type="number" class="item-qty" value="${item.quantity}" min="0.01" step="0.01"></td>
            <td><input type="text" class="item-description" value="${item.description}"></td>
            <td><input type="text" class="item-unit-price" value="S/. ${item.unitPrice.toFixed(2)}"></td>
            <td><input type="text" class="item-total-value" value="S/. ${(item.quantity * item.unitPrice).toFixed(2)}" readonly></td>
            <td><button class="btn danger btn-sm delete-item-btn">Eliminar</button></td>
        `;

        // Añadir event listeners para cambios en esta fila
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => {
            if (!input.readOnly) {
                input.addEventListener('change', handleItemInputChange);
                input.addEventListener('input', handleItemInputChange);
            }
        });

        // Event listener para el botón eliminar
        row.querySelector('.delete-item-btn').addEventListener('click', deleteItem);
    });

    calculateTotals(); // Recalcular totales después de renderizar
    saveInvoiceData(); // Guardar cambios automáticamente
}

// Maneja los cambios en los inputs de los ítems de la tabla
function handleItemInputChange(event) {
    const input = event.target;
    const row = input.closest('tr');
    const itemId = row.dataset.id;
    const itemIndex = invoiceItems.findIndex(item => item.id === itemId);

    if (itemIndex > -1) {
        let value = input.value;

        // Limpiar "S/." y convertir a número si es un campo numérico
        if (input.classList.contains('item-unit-price')) {
            value = value.replace('S/.', '').trim();
            invoiceItems[itemIndex].unitPrice = parseFloat(value) || 0;
        } else if (input.classList.contains('item-qty')) {
            invoiceItems[itemIndex].quantity = parseFloat(value) || 0;
        } else if (input.classList.contains('item-description')) {
            invoiceItems[itemIndex].description = value;
        }

        // Recalcular el valor total del ítem
        invoiceItems[itemIndex].totalValue = invoiceItems[itemIndex].quantity * invoiceItems[itemIndex].unitPrice;

        renderInvoiceItems(); // Vuelve a renderizar para actualizar UI y totales
    }
}

// Añadir un nuevo ítem
function addNewItem() {
    const newItem = {
        id: generateUniqueId(),
        quantity: 100,
        description: 'Nuevo Producto',
        unitPrice: 1000,
        totalValue: 1000
    };
    invoiceItems.push(newItem);
    renderInvoiceItems();
}

// Eliminar un ítem
function deleteItem(event) {
    const row = event.target.closest('tr');
    const itemId = row.dataset.id;
    invoiceItems = invoiceItems.filter(item => item.id !== itemId);
    renderInvoiceItems();
}

// Calcula los totales de la factura
function calculateTotals() {
    let subTotal = 0;
    invoiceItems.forEach(item => {
        subTotal += item.quantity * item.unitPrice;
    });

    const igv = subTotal * IGV_RATE;
    const totalAmount = subTotal + igv;

    subTotalSpan.textContent = subTotal.toFixed(2);
    igvSpan.textContent = igv.toFixed(2);
    totalSpan.textContent = totalAmount.toFixed(2);
    totalInWordsSpan.textContent = convertNumberToWords(totalAmount);
}

// Genera un ID único simple para los ítems
function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Convierte un número a palabras (Función de ejemplo, necesitas tu implementación completa)
function convertNumberToWords(amount) {
    // Aquí iría tu lógica para convertir el número a letras
    // Esta es una versión muy simplificada para el ejemplo.
    if (isNaN(amount) || amount === 0) return "Cero y 00/100 Soles";
    const integerPart = Math.floor(amount);
    const decimalPart = Math.round((amount - integerPart) * 100);
    return `${integerPart} y ${decimalPart.toString().padStart(2, '0')}/100 Soles`;
}


// --- Event Listeners ---
addItemBtn.addEventListener('click', addNewItem);
clientNameInput.addEventListener('change', saveInvoiceData);
clientIdInput.addEventListener('change', saveInvoiceData);
downloadPdfBtn.addEventListener('click', convertToPdf); // Asume que tienes esta función

// --- Función para convertir a PDF (simplificada) ---
function convertToPdf() {
    invoiceNumberCounter++; // Incrementar el contador al generar PDF
    saveInvoiceData(); // Guardar el nuevo número

    const element = document.querySelector('.container'); // Contenedor de la factura
    const opt = {
        margin: 0.5,
        filename: `Factura_${invoiceNumberSpan.textContent.replace('001-', '')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}