// Selección de elementos del DOM
const listaPokemon = document.querySelector("#listaPokemon");
const botonesHeader = document.querySelectorAll(".btn-header");
const tipoSelect = document.getElementById("tipo-select");
const generacionSelect = document.getElementById("generacion-select");
const nombreInput = document.getElementById("nombre-input");
const ordenarSelect = document.getElementById("ordenar-select");

// URL base de la API
const URL = "https://pokeapi.co/api/v2/pokemon/";

// Array global para guardar los Pokémon cargados
let todosLosPokemon = [];

/**
 * Convierte un color HEX a RGBA con opacidad
 * @param {string} hex - Código de color HEX (e.g. "#ff0000")
 * @param {number} opacity - Opacidad entre 0 y 1
 * @returns {string} Color en formato rgba()
 */
function hexToRGBA(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Muestra un Pokémon individual en el DOM
 * @param {Object} poke - Objeto Pokémon con info de la API
 */
function mostrarPokemon(poke) {
    const tipos = poke.types
        .map(type => `<p class="${type.type.name} tipo">${type.type.name}</p>`)
        .join('');
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

/**
 * Limpia y muestra la lista completa de Pokémon
 * @param {Array} lista - Array de objetos Pokémon
 */
function mostrarListaPokemones(lista) {
    listaPokemon.innerHTML = '';
    lista.forEach(mostrarPokemon);
}

/**
 * Ordena un array de Pokémon según criterio dado
 * @param {Array} array - Array de Pokémon
 * @param {string} criterio - Criterio de orden ('id-asc', 'id-desc', 'nombre-asc', 'nombre-desc')
 * @returns {Array} Array ordenado
 */
function ordenarPokemones(array, criterio) {
    switch (criterio) {
        case 'id-asc':
            return array.sort((a, b) => a.id - b.id);
        case 'id-desc':
            return array.sort((a, b) => b.id - a.id);
        case 'nombre-asc':
            return array.sort((a, b) => a.name.localeCompare(b.name));
        case 'nombre-desc':
            return array.sort((a, b) => b.name.localeCompare(a.name));
        default:
            return array;
    }
}

/**
 * Aplica filtros (tipo, nombre) y ordena la lista, luego muestra
 * @param {Array} pokemones - Array de Pokémon a filtrar y mostrar (por defecto todos)
 */
function actualizarListaFiltrada(pokemones = todosLosPokemon) {
    let filtrados = [...pokemones];

    // Filtrar por tipo
    const tipo = tipoSelect.value;
    if (tipo !== "all") {
        filtrados = filtrados.filter(p =>
            p.types.some(t => t.type.name === tipo)
        );
    }

    // Filtrar por nombre
    const nombre = nombreInput.value.toLowerCase().trim();
    if (nombre !== "") {
        filtrados = filtrados.filter(p =>
            p.name.toLowerCase().includes(nombre)
        );
    }

    // Ordenar
    const orden = ordenarSelect.value;
    filtrados = ordenarPokemones(filtrados, orden);

    // Mostrar resultado
    mostrarListaPokemones(filtrados);
}

/**
 * Filtra por generación usando fetch para obtener especies
 */
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

        // Filtrar los Pokémon ya cargados por nombre
        const filtrados = todosLosPokemon.filter(p =>
            nombres.includes(p.name)
        );

        actualizarListaFiltrada(filtrados);
    } catch (error) {
        console.error("Error al cargar generación:", error);
    }
});

// Eventos para filtros y orden
tipoSelect.addEventListener("change", () => actualizarListaFiltrada());
nombreInput.addEventListener("input", () => actualizarListaFiltrada());
ordenarSelect.addEventListener("change", () => actualizarListaFiltrada());

/**
 * Carga inicial de los 151 Pokémon con fetch simultáneo
 */
async function cargarPokemones() {
    const promesas = [];
    for (let i = 1; i <= 151; i++) {
        promesas.push(fetch(URL + i).then(res => res.json()));
    }

    try {
        const resultados = await Promise.all(promesas);
        todosLosPokemon = resultados;

        // Ordenar inicialmente por ID ascendente
        todosLosPokemon = ordenarPokemones(todosLosPokemon, 'id-asc');

        // Mostrar todos
        mostrarListaPokemones(todosLosPokemon);
    } catch (error) {
        console.error('Error cargando pokemones:', error);
    }
}

// Ejecutar la carga al iniciar la página
cargarPokemones();





















//Pruebaaaaaaaaaaaas






const modal = document.getElementById("modal");
const cerrarModalBtn = document.getElementById("cerrar-modal");
const modalPokemonImg = document.getElementById("modal-pokemon-img");
const modalPokemonName = document.getElementById("modal-pokemon-name");
const modalPokemonTypes = document.getElementById("modal-pokemon-types");
const modalPokemonDescription = document.getElementById("modal-pokemon-description");
const modalPokemonHeight = document.getElementById("modal-pokemon-height");
const modalPokemonWeight = document.getElementById("modal-pokemon-weight");

function mostrarModal(poke) {
  modal.style.display = "flex";
  modalPokemonImg.src = poke.sprites.other["official-artwork"].front_default;
  modalPokemonName.textContent = poke.name.toUpperCase();

  modalPokemonTypes.textContent = "Type(s): " + poke.types.map(t => t.type.name).join(", ");
  modalPokemonDescription.textContent = "Put a description here!";
  modalPokemonHeight.textContent = (poke.height / 10).toFixed(1);
  modalPokemonWeight.textContent = (poke.weight / 10).toFixed(1);
}

cerrarModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

