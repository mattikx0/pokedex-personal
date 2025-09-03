const listaPokemon = document.querySelector("#listaPokemon");
const botonesHeader = document.querySelectorAll(".btn-header");
let URL = "https://pokeapi.co/api/v2/pokemon/";

let todosLosPokemon = [];   // Variable global para guardar los 151 Pokémon

// Función auxiliar para convertir color hex a rgba con opacidad
function hexToRGBA(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}


// Obtener los 151 Pokémon al cargar la página
for (let i = 1; i <= 151; i++) {
    fetch(URL + i)
        .then((response) => response.json())
        .then(data => {
            todosLosPokemon.push(data);    // Guardar en array global
            mostrarPokemon(data);         // Mostrar todos al inicio
        });
}

// Función para mostrar un Pokémon individual
function mostrarPokemon(poke) {
    let tipos = poke.types.map((type) => `<p class="${type.type.name} tipo">${type.type.name}</p>`);
    tipos = tipos.join('');

    let pokeId = poke.id.toString().padStart(3, "0");

    const div = document.createElement("div");
    div.classList.add("pokemon");

    // Fondo coloreado suavemente con el tipo principal
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
            <div class="pokemon-tipos">
                ${tipos}
            </div>
            <div class="pokemon-stats">
                <p class="stat">${poke.height}m</p>
                <p class="stat">${poke.weight}kg</p>
            </div>
        </div>
    `;

    listaPokemon.append(div);
}

// Evento para los botones de tipo (filtros)
botonesHeader.forEach(boton => boton.addEventListener("click", (event) => {
    const botonId = event.currentTarget.id;
    listaPokemon.innerHTML = "";

    const pokemonesFiltrados = (botonId === "ver-todos")
        ? todosLosPokemon
        : todosLosPokemon.filter(poke =>
            poke.types.some(type => type.type.name === botonId)
        );

    pokemonesFiltrados.forEach(poke => mostrarPokemon(poke));
}));


