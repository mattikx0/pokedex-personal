/**************************/
/*** Elementos del DOM ***/
/**************************/
const teamContainer = document.querySelector(".team-container");
const visualContainer = document.getElementById("pokedex-visual"); // Ya no usamos "visualGrid"

/****************************/
/*** Variables Globales   ***/
/****************************/
let equipoPokemon = [null, null, null, null, null, null];

const regiones = {
    "generation-i": "Kanto",
    "generation-ii": "Johto",
    "generation-iii": "Hoenn",
    "generation-iv": "Sinnoh",
    "generation-v": "Unova",
    "generation-vi": "Kalos",
    "generation-vii": "Alola",
    "generation-viii": "Galar",
    "generation-ix": "Paldea",
};
let pokemonsPorRegion = {};

// Crear los 6 cuadros estáticos al inicio
for (let i = 0; i < 6; i++) {
    const div = document.createElement("div");
    div.classList.add("team-slot");
    div.dataset.index = i;
    teamContainer.appendChild(div);
}


/**********************/
/*** Render Equipo   ***/
/**********************/
function renderTeam() {
    const slots = document.querySelectorAll('.team-slot');
    slots.forEach((slot, index) => {
        if (equipoPokemon[index]) {
        const poke = equipoPokemon[index];
        slot.innerHTML = `
            <img src="${poke.sprites.front_default}" alt="${poke.name}" title="${poke.name}">
            <button class="remove-btn" onclick="removeFromTeam(${index})">❌</button>
        `;
        } else {
        slot.innerHTML = ""; // Vacío si no hay Pokémon
        }
    });
}


function addToTeam(poke) {
    // Buscar la primera posición vacía
    const emptyIndex = equipoPokemon.indexOf(null);

    if (emptyIndex === -1) {
        alert("Tu equipo ya está completo (6 Pokémon).");
        return;
    }

    equipoPokemon[emptyIndex] = poke;
    renderTeam();
}


function removeFromTeam(index) {
    equipoPokemon[index] = null;
    renderTeam();
}


/***************************/
/*** Render Pokédex por región **/
/***************************/
function renderPokemonsPorRegion() {
    visualContainer.innerHTML = ""; // Limpiar

    Object.keys(pokemonsPorRegion).forEach(regionId => {
        const nombreRegion = regiones[regionId];

        const section = document.createElement("section");
        section.className = "region-section";

        const title = document.createElement("h3");
        title.textContent = `${nombreRegion} Region`;

        const grid = document.createElement("div");
        grid.className = "pokedex-grid";

        pokemonsPorRegion[regionId].forEach(poke => {
            const card = document.createElement("div");
            card.classList.add("pokemon-card");

            const img = document.createElement("img");
            img.src = poke.sprites.front_default;
            img.alt = poke.name;
            img.title = poke.name;

            card.appendChild(img);
            card.addEventListener("click", () => addToTeam(poke));
            grid.appendChild(card);
        });

        section.appendChild(title);
        section.appendChild(grid);
        visualContainer.appendChild(section);
    });
}

/**********************/
/*** Carga Inicial  ***/
/**********************/
async function cargarPokemonesVisual() {
    const promesas = [];

    for (let i = 1; i <= 251; i++) { // Kanto (1-151) + Johto (152-251)
        promesas.push(fetchPokemonConRegion(i));
    }

    try {
        const pokemons = await Promise.all(promesas);

        // Agrupar por generación
        pokemons.forEach(pokemon => {
            const region = pokemon.region;
            if (!pokemonsPorRegion[region]) pokemonsPorRegion[region] = [];
            pokemonsPorRegion[region].push(pokemon);
        });

        renderPokemonsPorRegion();
    } catch (error) {
        console.error("Error cargando Pokédex Visual:", error);
    }
}

/******************************/
/*** Fetch individual Pokémon con región **/
/******************************/
async function fetchPokemonConRegion(id) {
    const data = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(r => r.json());
    const species = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then(r => r.json());
    return {
        ...data,
        region: species.generation.name // Ej: "generation-i"
    };
}

cargarPokemonesVisual();
