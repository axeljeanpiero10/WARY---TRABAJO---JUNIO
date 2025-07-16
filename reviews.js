// Variables globales para almacenar reseñas y historial
let reviews = [];
let historyLog = [];
let editingReviewId = null; // Para saber si estamos editando una reseña existente

// Constantes para elementos del DOM
const reviewForm = document.getElementById('reviewForm');
const reviewerNameInput = document.getElementById('reviewerName');
const reviewCommentInput = document.getElementById('reviewComment');
const ratingInputs = document.querySelectorAll('input[name="rating"]'); // Radio buttons for stars
const reviewsContainer = document.getElementById('reviewsContainer');
const historyList = document.getElementById('historyList');
const submitReviewBtn = document.getElementById('submitReviewBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const reviewIdToEditInput = document.getElementById('reviewIdToEdit');

// Elementos para el resumen de calificaciones (barras y texto)
const overallRatingElement = document.getElementById('overallRating');
const totalReviewsElement = document.getElementById('totalReviews');
const bar5Stars = document.getElementById('bar5Stars');
const bar4Stars = document.getElementById('bar4Stars');
const bar3Stars = document.getElementById('bar3Stars');
const bar2Stars = document.getElementById('bar2Stars');
const bar1Star = document.getElementById('bar1Star');


// Genera un ID único para cada reseña
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Guarda las reseñas 
function saveReviews() {
    localStorage.setItem('wariReviews', JSON.stringify(reviews));
}

// Carga las reseñas 
function loadReviews() {
    const storedReviews = localStorage.getItem('wariReviews');
    if (storedReviews) {
        reviews = JSON.parse(storedReviews);
    }
}

// Guarda el historial 
function saveHistory() {
    localStorage.setItem('wariHistory', JSON.stringify(historyLog));
}

// Carga el historial 
function loadHistory() {
    const storedHistory = localStorage.getItem('wariHistory');
    if (storedHistory) {
        historyLog = JSON.parse(storedHistory);
    }
}

// Actualiza y muestra el historial de interacciones
function updateHistory(action, reviewData) {
    const timestamp = new Date().toLocaleString();
    const historyEntry = `${timestamp}: ${action} - ${reviewData.nombre || 'N/A'} (ID: ${reviewData.id.substring(0, 5)}...)`;
    historyLog.unshift(historyEntry); // Agrega al principio para ver lo más reciente primero
    saveHistory();
    renderHistory();
}

// Renderiza la lista de historial
function renderHistory() {
    historyList.innerHTML = ''; // Limpia el historial actual
    historyLog.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = entry;
        historyList.appendChild(listItem);
    });
}

// Renderiza todas las reseñas en el contenedor
function renderReviews() {
    reviewsContainer.innerHTML = ''; // Limpia el contenedor actual de reseñas

    if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<p style="color: grey;">Aún no hay reseñas. ¡Sé el primero en dejar una!</p>';
        updateOverallRating();
        return;
    }

    reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.classList.add('review-card');
        reviewCard.dataset.id = review.id; // Guarda el ID para fácil acceso

        // Genera estrellas HTML
        const starHTML = '★'.repeat(review.calificacion) + '☆'.repeat(5 - review.calificacion);

        reviewCard.innerHTML = `
            <strong>${review.nombre}</strong> - <span class="rating-stars">${starHTML}</span><br>
            <small>${new Date(review.fecha).toLocaleDateString()}</small>
            <p>${review.comentario}</p>
            <div class="review-buttons">
                <button class="edit-btn">Editar</button>
                <button class="delete-btn">Eliminar</button>
                <button>Útil</button>
                <button>Informar un abuso</button>
            </div>
        `;

        reviewsContainer.appendChild(reviewCard);
    });

    // Añadir event listeners a los nuevos botones de editar/eliminar
    addReviewButtonListeners();
    updateOverallRating(); // Actualiza el resumen de calificaciones
}

// Añade event listeners a los botones de editar y eliminar
function addReviewButtonListeners() {
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const reviewId = e.target.closest('.review-card').dataset.id;
            editReview(reviewId);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const reviewId = e.target.closest('.review-card').dataset.id;
            deleteReview(reviewId);
        });
    });
}

// Actualiza las estadísticas de calificación (promedio y barras)
function updateOverallRating() {
    if (reviews.length === 0) {
        overallRatingElement.textContent = '0 de 5';
        totalReviewsElement.textContent = 'Basado en 0 valoraciones globales';
        bar5Stars.style.width = '0%';
        bar4Stars.style.width = '0%';
        bar3Stars.style.width = '0%';
        bar2Stars.style.width = '0%';
        bar1Star.style.width = '0%';
        return;
    }

    let totalStars = 0;
    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    reviews.forEach(review => {
        totalStars += review.calificacion;
        starCounts[review.calificacion]++;
    });

    const averageRating = (totalStars / reviews.length).toFixed(1);
    overallRatingElement.textContent = `${averageRating} de 5`;
    totalReviewsElement.textContent = `Basado en ${reviews.length} valoraciones globales`;

    // Actualizar barras de estrellas
    bar5Stars.style.width = `${(starCounts[5] / reviews.length) * 100}%`;
    bar4Stars.style.width = `${(starCounts[4] / reviews.length) * 100}%`;
    bar3Stars.style.width = `${(starCounts[3] / reviews.length) * 100}%`;
    bar2Stars.style.width = `${(starCounts[2] / reviews.length) * 100}%`;
    bar1Star.style.width = `${(starCounts[1] / reviews.length) * 100}%`;
}


// --- Funciones CRUD ---

// Maneja el envío del formulario (agregar o editar)
reviewForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Previene la recarga de la página

    const name = reviewerNameInput.value.trim();
    const comment = reviewCommentInput.value.trim();
    const rating = document.querySelector('input[name="rating"]:checked')?.value; // Obtiene el valor de la estrella seleccionada

    if (!name || !comment || !rating) {
        alert('Por favor, completa todos los campos y selecciona una calificación.');
        return;
    }

    const newReviewData = {
        nombre: name,
        comentario: comment,
        calificacion: parseInt(rating),
        fecha: new Date().toISOString() // Guarda la fecha en formato ISO
    };

    if (editingReviewId) {
        // Modo edición
        const reviewIndex = reviews.findIndex(r => r.id === editingReviewId);
        if (reviewIndex !== -1) {
            reviews[reviewIndex] = { ...reviews[reviewIndex], ...newReviewData };
            updateHistory('Reseña editada', reviews[reviewIndex]);
        }
        editingReviewId = null; // Resetear el modo edición
        reviewIdToEditInput.value = ''; // Limpiar el campo oculto
        submitReviewBtn.textContent = 'Enviar reseña';
        cancelEditBtn.style.display = 'none';
    } else {
        // Modo agregar nueva reseña
        const newReview = {
            id: generateUniqueId(),
            ...newReviewData
        };
        reviews.push(newReview);
        updateHistory('Nueva reseña agregada', newReview);
    }

    saveReviews();
    renderReviews();
    reviewForm.reset(); // Limpia el formulario
    // Deseleccionar estrellas si el formulario no las resetea bien
    ratingInputs.forEach(input => input.checked = false);
});

// Función para editar una reseña
function editReview(id) {
    const reviewToEdit = reviews.find(review => review.id === id);
    if (reviewToEdit) {
        reviewerNameInput.value = reviewToEdit.nombre;
        reviewCommentInput.value = reviewToEdit.comentario;
        // Seleccionar la estrella correcta
        ratingInputs.forEach(input => {
            if (parseInt(input.value) === reviewToEdit.calificacion) {
                input.checked = true;
            } else {
                input.checked = false; // Desmarcar otras
            }
        });

        editingReviewId = id; // Establece el ID de la reseña que se está editando
        reviewIdToEditInput.value = id; // También guardar en un campo oculto si se necesita

        // Cambiar texto del botón y mostrar cancelar
        submitReviewBtn.textContent = 'Guardar Cambios';
        cancelEditBtn.style.display = 'inline-block';

        // Scroll al formulario para que el usuario pueda editar
        reviewForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Función para cancelar la edición
cancelEditBtn.addEventListener('click', () => {
    editingReviewId = null;
    reviewIdToEditInput.value = '';
    reviewForm.reset();
    ratingInputs.forEach(input => input.checked = false);
    submitReviewBtn.textContent = 'Enviar reseña';
    cancelEditBtn.style.display = 'none';
});


// Función para eliminar una reseña
function deleteReview(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
        const reviewToDelete = reviews.find(r => r.id === id);
        reviews = reviews.filter(review => review.id !== id);
        saveReviews();
        renderReviews();
        if (reviewToDelete) {
            updateHistory('Reseña eliminada', reviewToDelete);
        }
    }
}


// --- Inicialización al cargar la página ---
document.addEventListener('DOMContentLoaded', () => {
    loadReviews(); // Cargar reseñas existentes
    loadHistory(); // Cargar historial existente
    renderReviews(); // Renderizar las reseñas en el DOM
    renderHistory(); // Renderizar el historial
    updateOverallRating(); // Asegurar que las estadísticas se actualicen al inicio
});