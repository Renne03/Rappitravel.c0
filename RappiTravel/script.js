// Datos de los destinos que aparecen en la página.
const destinations = {
  "Cartagena": {country:"Colombia", region:"Caribe", temperature:"30°", description:"Murallas históricas, calles coloridas y atardeceres frente al mar.", photo:"photo-cartagena", activity:"Descansar en la playa"},
  "Medellín": {country:"Colombia", region:"Antioquia", temperature:"24°", description:"Cultura, gastronomía y montañas en la ciudad de la eterna primavera.", photo:"photo-medellin", activity:"Explorar la ciudad"},
  "Santa Marta": {country:"Colombia", region:"Magdalena", temperature:"29°", description:"Playas, naturaleza y acceso a los paisajes del Parque Tayrona.", photo:"photo-santamarta", activity:"Aventura y naturaleza"},
  "Eje Cafetero": {country:"Colombia", region:"Región Andina", temperature:"21°", description:"Montañas verdes, fincas cafeteras y pueblos llenos de encanto.", photo:"photo-cafetero", activity:"Aventura y naturaleza"},
  "Ciudad de México": {country:"México", region:"Norteamérica", temperature:"23°", description:"Museos, historia, arquitectura y una gastronomía inolvidable.", photo:"photo-mexico", activity:"Gastronomía y cultura"},
  "Cusco": {country:"Perú", region:"Andes", temperature:"16°", description:"Historia ancestral, paisajes andinos y caminos llenos de aventura.", photo:"photo-cusco", activity:"Aventura y naturaleza"}
};

// Relaciona cada destino con el tipo de región para clasificarlo.
const regionMap = {"Cartagena":"playa","Medellín":"ciudad","Santa Marta":"playa","Eje Cafetero":"naturaleza","Ciudad de México":"ciudad","Cusco":"naturaleza"};
// Arreglos donde se guardan los favoritos y los viajes de esta sesión.
let favorites = [];
let trips = [];
let selectedDestination = "Cartagena";
let toastTimer;

// Atajos para buscar uno o varios elementos del HTML.
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];

// Muestra un aviso pequeño en pantalla durante unos segundos.
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

// Actualiza los números de favoritos y viajes en la interfaz.
function updateCounts() {
  $("#favoriteCount").textContent = favorites.length;
  $("#favoriteNavCount").textContent = favorites.length;
  $("#favStat").textContent = favorites.length;
  $("#tripStat").textContent = trips.length;
  $("#favoriteNavCount").classList.toggle("hidden", favorites.length === 0);
}

// Cambia el corazón de cada tarjeta según sea favorito o no.
function syncFavoriteButtons() {
  $$(".favorite-btn").forEach(button => {
    const active = favorites.includes(button.dataset.favorite);
    button.classList.toggle("is-favorite", active);
    button.setAttribute("aria-pressed", String(active));
    button.textContent = active ? "♥" : "♡";
  });
}

// Dibuja la lista de favoritos o un mensaje si está vacía.
function renderFavorites() {
  const list = $("#favoritesList");
  if (!favorites.length) {
    list.innerHTML = '<div class="empty-card"><span class="empty-icon">♡</span><h3>Aún no tienes favoritos</h3><p>Presiona el corazón de un destino para guardarlo aquí.</p><a class="text-button" href="#explorar">Explorar destinos ↗</a></div>';
    updateCounts();
    return;
  }
  list.innerHTML = favorites.map(name => {
    const d = destinations[name];
    return `<article class="favorite-item"><div class="favorite-thumb ${d.photo}"></div><div><h3>${name}</h3><p>${d.country} · ${d.temperature}</p><button class="text-button favorite-detail" data-destination="${name}">Ver destino</button></div><button class="remove-favorite" data-remove="${name}" aria-label="Quitar ${name} de favoritos">×</button></article>`;
  }).join("");
  updateCounts();
}

// Agrega un destino a favoritos o lo elimina si ya estaba guardado.
function toggleFavorite(name) {
  if (favorites.includes(name)) {
    favorites = favorites.filter(item => item !== name);
    showToast(`${name} se quitó de favoritos.`);
  } else {
    favorites.push(name);
    showToast(`${name} se guardó en favoritos.`);
  }
  syncFavoriteButtons();
  renderFavorites();
}

// Filtra las tarjetas por nombre y por región seleccionada.
function filterDestinations(event) {
  if (event) event.preventDefault();
  // Lee el texto de búsqueda y lo pasa a minúsculas para comparar mejor.
  const query = $("#destinationSearch").value.trim().toLocaleLowerCase("es");
  const region = $("#regionFilter").value;
  let visible = 0;
  $$(".destination-card").forEach(card => {
    const name = card.dataset.name.toLocaleLowerCase("es");
    const match = name.includes(query) && (region === "todos" || card.dataset.region === region);
    card.classList.toggle("hidden", !match);
    if (match) visible++;
  });
  $("#resultCount").textContent = `${visible} ${visible === 1 ? "destino" : "destinos"}`;
  $("#emptySearch").classList.toggle("hidden", visible !== 0);
}

// Abre una ventana con información del destino seleccionado.
function openDestination(name) {
  const d = destinations[name];
  if (!d) return;
  selectedDestination = name;
  $("#dialogTitle").textContent = name;
  $("#dialogDescription").textContent = d.description;
  $("#dialogPhoto").className = `dialog-photo ${d.photo}`;
  $("#dialogFacts").innerHTML = `<span>⌖ ${d.region}</span><span>☀ ${d.temperature}</span><span>🌎 ${d.country}</span>`;
  $("#dialogFavorite").textContent = favorites.includes(name) ? "♥ Quitar de favoritos" : "♡ Guardar favorito";
  const dialog = $("#destinationDialog");
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}

// Cierra la ventana con los detalles del destino.
function closeDestination() {
  const dialog = $("#destinationDialog");
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

// Muestra los viajes guardados en el formulario.
function renderTrips() {
  const container = $("#savedTrips");
  if (!trips.length) {
    container.innerHTML = '<p class="muted-text">Todavía no has guardado ningún viaje.</p>';
    updateCounts();
    return;
  }
  container.innerHTML = trips.map((trip, index) => {
    const budget = trip.budget ? new Intl.NumberFormat("es-CO", {style:"currency",currency:"COP",maximumFractionDigits:0}).format(Number(trip.budget)) : "Sin presupuesto definido";
    return `<article class="saved-trip"><div><h4>${escapeHTML(trip.name)}</h4><p>⌖ ${escapeHTML(trip.destination)} · ${trip.travelers} viajero(s)</p><p>📅 ${trip.startDate} al ${trip.endDate}</p><p>💰 ${budget}</p><p>Actividad: ${escapeHTML(trip.activity)}</p>${trip.comments ? `<p>${escapeHTML(trip.comments)}</p>` : ""}</div><button class="delete-trip" data-trip-index="${index}" aria-label="Eliminar viaje ${escapeHTML(trip.name)}">Eliminar</button></article>`;
  }).join("");
  updateCounts();
}

// Evita que el texto ingresado se interprete como código HTML.
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}

// Abre o cierra el menú cuando se pulsa el botón de navegación.
$("#menuToggle").addEventListener("click", () => {
  const open = $("#mainNav").classList.toggle("open");
  $("#menuToggle").setAttribute("aria-expanded", String(open));
  $("#menuToggle").textContent = open ? "×" : "☰";
});

// Al elegir una sección, marca el enlace y cierra el menú móvil.
$$(".nav-link").forEach(link => link.addEventListener("click", () => {
  $$(".nav-link").forEach(item => item.classList.toggle("active", item === link));
  $("#mainNav").classList.remove("open");
  $("#menuToggle").setAttribute("aria-expanded", "false");
  $("#menuToggle").textContent = "☰";
}));

$("#profileShortcut").addEventListener("click", () => $("#perfil").scrollIntoView({behavior:"smooth"}));
$("#searchForm").addEventListener("submit", filterDestinations);
$("#destinationSearch").addEventListener("input", filterDestinations);
$("#regionFilter").addEventListener("change", filterDestinations);

// Maneja clics en favoritos, detalles y eliminación de viajes.
document.addEventListener("click", event => {
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) toggleFavorite(favoriteButton.dataset.favorite);

  const detailButton = event.target.closest("[data-destination]");
  if (detailButton) openDestination(detailButton.dataset.destination);

  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) toggleFavorite(removeButton.dataset.remove);

  const deleteButton = event.target.closest("[data-trip-index]");
  if (deleteButton) {
    const index = Number(deleteButton.dataset.tripIndex);
    const removed = trips.splice(index, 1)[0];
    renderTrips();
    showToast(`Se eliminó el viaje "${removed.name}".`);
  }
});

$("#closeDialog").addEventListener("click", closeDestination);
$("#destinationDialog").addEventListener("click", event => {
  if (event.target === $("#destinationDialog")) closeDestination();
});
$("#dialogFavorite").addEventListener("click", () => {
  toggleFavorite(selectedDestination);
  $("#dialogFavorite").textContent = favorites.includes(selectedDestination) ? "♥ Quitar de favoritos" : "♡ Guardar favorito";
});
$("#addToTrip").addEventListener("click", () => {
  $("#tripDestination").value = selectedDestination;
  $("#activity").value = destinations[selectedDestination].activity;
  closeDestination();
  $("#itinerario").scrollIntoView({behavior:"smooth"});
  $("#tripName").focus({preventScroll:true});
  showToast(`${selectedDestination} se añadió al formulario de viaje.`);
});

$("#startDate").addEventListener("change", () => {
  $("#endDate").min = $("#startDate").value;
  if ($("#endDate").value && $("#endDate").value < $("#startDate").value) $("#endDate").value = "";
});

// Valida los datos y guarda el viaje cuando se envía el formulario.
$("#tripForm").addEventListener("submit", event => {
  event.preventDefault();
  const startDate = $("#startDate").value;
  const endDate = $("#endDate").value;
  const message = $("#tripMessage");
  if (endDate < startDate) {
    message.textContent = "La fecha de regreso no puede ser anterior a la fecha de salida.";
    message.classList.remove("success");
    $("#endDate").focus();
    return;
  }
  // Recoge los valores escritos por el usuario en el formulario.
  const trip = {
    name: $("#tripName").value.trim(),
    destination: $("#tripDestination").value.trim(),
    travelers: Number($("#travelers").value),
    startDate,
    endDate,
    budget: $("#budget").value,
    activity: $("#activity").value,
    comments: $("#comments").value.trim()
  };
  if (!trip.name || !trip.destination || !trip.startDate || !trip.endDate || trip.travelers < 1) {
    message.textContent = "Completa los campos obligatorios con datos válidos.";
    message.classList.remove("success");
    return;
  }
  // Añade el nuevo viaje a la lista y actualiza lo que se ve en pantalla.
  trips.push(trip);
  renderTrips();
  message.textContent = "¡Tu viaje se guardó correctamente en esta sesión!";
  message.classList.add("success");
  $("#tripForm").reset();
  $("#travelers").value = 2;
  $("#endDate").min = "";
  showToast("¡Viaje guardado!");
});

$("#tipsToggle").addEventListener("change", event => showToast(event.target.checked ? "Consejos de viaje activados." : "Consejos de viaje desactivados."));
$("#prefsToggle").addEventListener("change", event => showToast(event.target.checked ? "Preferencias activadas para esta sesión." : "Preferencias desactivadas para esta sesión."));

// Establece como fecha mínima de salida el día de hoy.
const today = new Date();
const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0,10);
$("#startDate").min = localDate;
$("#endDate").min = localDate;
// Inicializa la página con los contadores y las listas actualizadas.
syncFavoriteButtons();
renderFavorites();
renderTrips();
updateCounts();
