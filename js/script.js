/**************************/
/*** Elementos del DOM ***/
/************************/
const listaPokemon = document.querySelector("#listaPokemon");
const botonesHeader = document.querySelectorAll(".btn-header");
const tipoSelect = document.getElementById("tipo-select");
const generacionSelect = document.getElementById("generacion-select");
const nombreInput = document.getElementById("nombre-input");
const ordenarSelect = document.getElementById("ordenar-select");

// Modal
const modal = document.getElementById("modal");
const cerrarModalBtn = document.getElementById("cerrar-modal");
const modalPokemonImg = document.getElementById("modal-pokemon-img");
const modalPokemonName = document.getElementById("modal-pokemon-name");
const modalPokemonTypes = document.getElementById("modal-pokemon-types");
const modalPokemonDescription = document.getElementById("modal-pokemon-description");
const modalPokemonHeight = document.getElementById("modal-pokemon-height");
const modalPokemonWeight = document.getElementById("modal-pokemon-weight");


/****************************/
/*** Variables Globales  ***/
/**************************/
const URL = "https://pokeapi.co/api/v2/pokemon/";
let todosLosPokemon = [];
let indicePokemonActual = 0;


/*******************/
/*** Utilidades ***/
/*****************/
function hexToRGBA(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function ordenarPokemones(array, criterio) {
  switch (criterio) {
    case "id-asc": return array.sort((a, b) => a.id - b.id);
    case "id-desc": return array.sort((a, b) => b.id - a.id);
    case "nombre-asc": return array.sort((a, b) => a.name.localeCompare(b.name));
    case "nombre-desc": return array.sort((a, b) => b.name.localeCompare(a.name));
    default: return array;
  }
}


/**********************/
/*** Render en DOM ***/
/********************/
function mostrarPokemon(poke) {
  const tipos = poke.types
    .map(type => `<p class="${type.type.name} tipo">${type.type.name}</p>`)
    .join("");
  const pokeId = poke.id.toString().padStart(3, "0");

  const div = document.createElement("div");
  div.classList.add("pokemon");

  // Fondo según el tipo principal
  const tipoPrincipal = poke.types[0].type.name;
  const hex = getComputedStyle(document.documentElement)
    .getPropertyValue(`--type-${tipoPrincipal}`).trim();
  div.style.backgroundColor = hexToRGBA(hex, 0.3);

  div.innerHTML = `
    <p class="pokemon-id-back">#${pokeId}</p>
    <div class="pokemon-imagen">
      <img src="${poke.sprites.other["official-artwork"].front_default}" alt="${poke.name}">
    </div>
    <div class="pokemon-info">
      <div class="nombre-contenedor">
        <p class="pokemon-id">#${pokeId}</p>
        <h2 class="pokemon-nombre">${poke.name}</h2>
      </div>
      <div class="pokemon-tipos">${tipos}</div>
      <div class="pokemon-stats">
        <p class="stat">${poke.height}m</p>
        <p class="stat">${poke.weight}kg</p>
      </div>
    </div>
  `;

  div.addEventListener("click", () => mostrarModal(poke));
  listaPokemon.append(div);
}

function mostrarListaPokemones(lista) {
  listaPokemon.innerHTML = "";
  lista.forEach(mostrarPokemon);
}


/*************************/
/*** Filtrado & Orden ***/
/***********************/
function getListaFiltrada() {
  let filtrados = [...todosLosPokemon];

  // Filtro por tipo
  const tipo = tipoSelect.value;
  if (tipo !== "all") {
    filtrados = filtrados.filter(p => p.types.some(t => t.type.name === tipo));
  }

  // Filtro por nombre
  const nombre = nombreInput.value.toLowerCase().trim();
  if (nombre !== "") {
    filtrados = filtrados.filter(p => p.name.toLowerCase().includes(nombre));
  }

  // Filtro por generación (usa DOM para validar qué se está mostrando)
  const gen = generacionSelect.value;
  if (gen !== "all") {
    const genNombres = todosLosPokemon
      .filter(p => listaPokemon.contains(document.querySelector(`[alt="${p.name}"]`)))
      .map(p => p.name);
    filtrados = filtrados.filter(p => genNombres.includes(p.name));
  }

  // Orden
  return ordenarPokemones(filtrados, ordenarSelect.value);
}

function actualizarListaFiltrada(pokemones = todosLosPokemon) {
  let filtrados = [...pokemones];

  // Filtro tipo
  const tipo = tipoSelect.value;
  if (tipo !== "all") {
    filtrados = filtrados.filter(p => p.types.some(t => t.type.name === tipo));
  }

  // Filtro nombre
  const nombre = nombreInput.value.toLowerCase().trim();
  if (nombre !== "") {
    filtrados = filtrados.filter(p => p.name.toLowerCase().includes(nombre));
  }

  // Orden
  filtrados = ordenarPokemones(filtrados, ordenarSelect.value);

  mostrarListaPokemones(filtrados);
}


/**************/
/*** Modal ***/
/************/
function mostrarModal(poke) {
  modal.style.display = "flex";

  // Guardar índice actual
  const listaFiltrada = getListaFiltrada();
  indicePokemonActual = listaFiltrada.findIndex(p => p.id === poke.id);

  // Info
  modalPokemonImg.src = poke.sprites.other["official-artwork"].front_default;
  modalPokemonName.textContent = poke.name.toUpperCase();
  document.getElementById("modal-pokemon-id").textContent = `#${poke.id.toString().padStart(3, "0")}`;
  modalPokemonTypes.textContent = "Type(s): " + poke.types.map(t => t.type.name).join(", ");
  modalPokemonDescription.textContent = "Put a description here!";
  modalPokemonHeight.textContent = (poke.height / 10).toFixed(1);
  modalPokemonWeight.textContent = (poke.weight / 10).toFixed(1);
}

cerrarModalBtn.addEventListener("click", () => modal.style.display = "none");

document.getElementById("prev-btn").addEventListener("click", () => {
  const lista = getListaFiltrada();
  if (lista.length === 0) return;
  indicePokemonActual = (indicePokemonActual - 1 + lista.length) % lista.length;
  mostrarModal(lista[indicePokemonActual]);
});

document.getElementById("next-btn").addEventListener("click", () => {
  const lista = getListaFiltrada();
  if (lista.length === 0) return;
  indicePokemonActual = (indicePokemonActual + 1) % lista.length;
  mostrarModal(lista[indicePokemonActual]);
});

document.addEventListener("keydown", (event) => {
  if (modal.style.display === "flex") {
    const lista = getListaFiltrada();
    if (lista.length === 0) return;

    if (event.key === "ArrowRight") {
      indicePokemonActual = (indicePokemonActual + 1) % lista.length;
      mostrarModal(lista[indicePokemonActual]);
    } else if (event.key === "ArrowLeft") {
      indicePokemonActual = (indicePokemonActual - 1 + lista.length) % lista.length;
      mostrarModal(lista[indicePokemonActual]);
    } else if (event.key === "Escape") {
      modal.style.display = "none";
    }
  }
});


/****************************/
/*** Render Tipos/Debils ***/
/**************************/
function renderTipos(tipos) {
  const contenedor = document.getElementById("modal-pokemon-types");
  contenedor.innerHTML = "";
  tipos.forEach(tipo => {
    const btn = document.createElement("button");
    btn.className = `tipo-${tipo}`;
    btn.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    contenedor.appendChild(btn);
  });
}

function renderDebilidades(debilidades) {
  const contenedor = document.getElementById("modal-pokemon-weaknesses");
  contenedor.innerHTML = "";
  debilidades.forEach(tipo => {
    const btn = document.createElement("button");
    btn.className = `tipo-${tipo}`;
    btn.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    contenedor.appendChild(btn);
  });
}


/************************/
/*** Eventos Filtros ***/
/**********************/
tipoSelect.addEventListener("change", () => actualizarListaFiltrada());
nombreInput.addEventListener("input", () => actualizarListaFiltrada());
ordenarSelect.addEventListener("change", () => actualizarListaFiltrada());

generacionSelect.addEventListener("change", async (e) => {
  const gen = e.target.value;
  if (gen === "all") {
    actualizarListaFiltrada();
    return;
  }

  try {
    const url = `https://pokeapi.co/api/v2/generation/${gen}`;
    const res = await fetch(url);
    const data = await res.json();
    const nombres = data.pokemon_species.map(p => p.name);

    const filtrados = todosLosPokemon.filter(p => nombres.includes(p.name));
    actualizarListaFiltrada(filtrados);
  } catch (error) {
    console.error("Error al cargar generación:", error);
  }
});


/**********************/
/*** Carga Inicial ***/
/********************/
async function cargarPokemones() {
  const promesas = [];
  for (let i = 1; i <= 151; i++) {
    promesas.push(fetch(URL + i).then(res => res.json()));
  }

  try {
    const resultados = await Promise.all(promesas);
    todosLosPokemon = ordenarPokemones(resultados, "id-asc");
    mostrarListaPokemones(todosLosPokemon);
  } catch (error) {
    console.error("Error cargando pokemones:", error);
  }
}

// Iniciar
cargarPokemones();
