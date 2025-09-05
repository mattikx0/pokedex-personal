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
const modalPokemonCategory = document.getElementById("modal-pokemon-category");
const modalPokemonAbility = document.getElementById("modal-pokemon-ability");
const modalPokemonGender = document.getElementById("modal-pokemon-gender");




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

function traducirTipo(tipo) {
    const traducciones = {
        normal: "Normal",
        fire: "Fuego",
        water: "Agua",
        electric: "Eléctrico",
        grass: "Planta",
        ice: "Hielo",
        fighting: "Lucha",
        poison: "Veneno",
        ground: "Tierra",
        flying: "Volador",
        psychic: "Psíquico",
        bug: "Bicho",
        rock: "Roca",
        ghost: "Fantasma",
        dragon: "Dragón",
        dark: "Siniestro",
        steel: "Acero",
        fairy: "Hada"
    };
    return traducciones[tipo] || tipo;
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
async function mostrarModal(poke) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    const modalPokemonImg = document.getElementById("modal-pokemon-img");
    const btnShiny = document.getElementById("btn-shiny");
    const btnCry = document.getElementById("btn-cry");

    // Estado para saber si está shiny o no
    let isShiny = false;

    // Inicializar imagen e icono shiny
    modalPokemonImg.src = poke.sprites.other["official-artwork"].front_default;
    btnShiny.textContent = "⭐";

    const listaFiltrada = getListaFiltrada();
    indicePokemonActual = listaFiltrada.findIndex(p => p.id === poke.id);

    // Nombre y ID
    modalPokemonName.textContent = poke.name.toUpperCase();
    document.getElementById("modal-pokemon-id").textContent = `#${poke.id.toString().padStart(3, "0")}`;

    // Tipos
    modalPokemonTypes.innerHTML = "";
    poke.types.forEach(t => {
        const tipoNombre = t.type.name;
        const boton = document.createElement("button");
        boton.className = `tipo-${tipoNombre}`;
        boton.textContent = traducirTipo(tipoNombre);
        modalPokemonTypes.appendChild(boton);
    });

    // Altura y peso
    modalPokemonHeight.textContent = (poke.height / 10).toFixed(1);
    modalPokemonWeight.textContent = (poke.weight / 10).toFixed(1);

    // Habilidad principal
    const habilidad = poke.abilities.find(h => !h.is_hidden);
    if (habilidad) {
        try {
            const resHab = await fetch(habilidad.ability.url);
            const dataHab = await resHab.json();
            const nombreHabES = dataHab.names.find(n => n.language.name === "es")?.name;
            modalPokemonAbility.textContent = nombreHabES || habilidad.ability.name;
        } catch (err) {
            console.error("Error obteniendo habilidad:", err);
            modalPokemonAbility.textContent = habilidad.ability.name;
        }
    } else {
        modalPokemonAbility.textContent = "Desconocida";
    }

    // Info adicional especie
    try {
        const res = await fetch(poke.species.url);
        const data = await res.json();

        // Evoluciones
        await cargarYMostrarEvoluciones(data.evolution_chain.url);

        // Descripción
        const descripcion = data.flavor_text_entries.find(entry => entry.language.name === "es");
        modalPokemonDescription.textContent = descripcion
            ? descripcion.flavor_text.replace(/\f/g, " ")
            : "Sin descripción.";

        // Categoría
        const categoriaCompleta = data.genera.find(g => g.language.name === "es")?.genus || "Desconocida";
        modalPokemonCategory.textContent = categoriaCompleta.replace(/^Pokémon\s+/i, "");

        // Debilidades
        const debilidades = await obtenerDebilidades(poke);
        renderDebilidades(debilidades);

        // Género
        if (data.gender_rate === -1) {
            modalPokemonGender.textContent = "Sin género";
        } else {
            const tieneMacho = data.gender_rate < 8;
            const tieneHembra = data.gender_rate > 0;
            modalPokemonGender.textContent = `${tieneMacho ? "♂" : ""} ${tieneHembra ? "♀" : ""}`;
        }
    } catch (error) {
        console.error("Error obteniendo información de especie:", error);
    }

    // Botón para escuchar el grito
    btnCry.onclick = () => {
        const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${poke.id}.ogg`);
        audio.volume = 0.1;
        audio.play().catch(err => console.error("Error al reproducir el grito:", err));
    };

    // Botón para cambiar a shiny
    btnShiny.onclick = () => {
        if (!isShiny) {
            if (poke.sprites.other["official-artwork"].front_shiny) {
                modalPokemonImg.src = poke.sprites.other["official-artwork"].front_shiny;
                isShiny = true;
                btnShiny.textContent = "✨";
            } else {
                alert("Este Pokémon no tiene forma shiny disponible.");
            }
        } else {
            modalPokemonImg.src = poke.sprites.other["official-artwork"].front_default;
            isShiny = false;
            btnShiny.textContent = "⭐";
        }
    };
}


async function cargarYMostrarEvoluciones(url) {
    try {
        const resEvo = await fetch(url);
        const dataEvo = await resEvo.json();

        function extraerEvoluciones(chain) {
            const evoluciones = [];

            function recorrer(nodo) {
                evoluciones.push(nodo.species.name);
                if (nodo.evolves_to.length > 0) {
                    nodo.evolves_to.forEach(siguiente => recorrer(siguiente));
                }
            }

            recorrer(chain);
            return evoluciones;
        }

        const nombresEvoluciones = extraerEvoluciones(dataEvo.chain);

        const evolucionesConDatos = await Promise.all(
            nombresEvoluciones.map(async (nombre) => {
                const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);
                const dataPoke = await res.json();
                return {
                    name: dataPoke.name,
                    id: dataPoke.id,
                    img: dataPoke.sprites.other["official-artwork"].front_default,
                    types: dataPoke.types.map(t => t.type.name)
                };
            })
        );

        const evoContainer = document.getElementById("modal-pokemon-evolutions");
        evoContainer.innerHTML = "";

        evolucionesConDatos.forEach((evo, idx) => {
            const div = document.createElement("div");
            div.classList.add("evo-item");
            div.title = evo.name;

            const img = document.createElement("img");
            img.src = evo.img;
            img.alt = evo.name;

            const pName = document.createElement("p");
            pName.classList.add("evo-name");
            // Capitalizar primera letra
            pName.textContent = evo.name.charAt(0).toUpperCase() + evo.name.slice(1);

            const pNumber = document.createElement("p");
            pNumber.classList.add("evo-number");
            // Cambiar '#' por 'N°'
            pNumber.textContent = `N°${evo.id.toString().padStart(4, '0')}`;

            const tiposDiv = document.createElement("div");
            tiposDiv.classList.add("evo-types");

            evo.types.forEach(tipo => {
                const span = document.createElement("span");
                span.className = `type tipo-${tipo}`;  // ✅ Aplica tu clase tipo-xxx
                span.textContent = traducirTipo(tipo); // ✅ Si tienes función para traducir, úsala
                tiposDiv.appendChild(span);
            });


            div.appendChild(img);
            div.appendChild(pName);
            div.appendChild(pNumber);
            div.appendChild(tiposDiv);
            // Agregar evento de clic para cargar esa evolución
            div.addEventListener("click", async () => {
                try {
                    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${evo.name}`);
                    const newPokeData = await res.json();
                    mostrarModal(newPokeData); // Reutiliza tu función principal del modal
                } catch (error) {
                    console.error("Error al cargar evolución:", error);
                }
            });

evoContainer.appendChild(div);


            if (idx < evolucionesConDatos.length - 1) {
                const flecha = document.createElement("div");
                flecha.classList.add("flecha");
                flecha.textContent = "→";
                evoContainer.appendChild(flecha);
            }
        });

    } catch (error) {
        console.error("Error cargando evoluciones:", error);
    }
}





// Evento cerrar modal
cerrarModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    document.body.style.overflow = ""; // Rehabilitar scroll al cerrar
});

// Navegación botones
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

// Navegación teclado y cierre con ESC
document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("hidden")) { // Solo si modal está visible
        const lista = getListaFiltrada();
        if (lista.length === 0) return;

        if (event.key === "ArrowRight") {
            indicePokemonActual = (indicePokemonActual + 1) % lista.length;
            mostrarModal(lista[indicePokemonActual]);
        } else if (event.key === "ArrowLeft") {
            indicePokemonActual = (indicePokemonActual - 1 + lista.length) % lista.length;
            mostrarModal(lista[indicePokemonActual]);
        } else if (event.key === "Escape") {
            modal.classList.add("hidden");
            document.body.style.overflow = "";
        }
    }
});

// Opcional: cerrar modal al hacer clic fuera del contenido
modal.addEventListener("click", (e) => {
    const contenido = document.querySelector(".modal-content");
    if (!contenido.contains(e.target)) {
        modal.classList.add("hidden");
        document.body.style.overflow = "";
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
        btn.textContent = traducirTipo(tipo);
        contenedor.appendChild(btn);
    });
}


async function obtenerDebilidades(poke) {
    const tipos = poke.types.map(t => t.type.name);
    const debilidadesSet = new Set();

    for (let tipo of tipos) {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
        const data = await res.json();

        data.damage_relations.double_damage_from.forEach(weakness => {
            debilidadesSet.add(weakness.name);
        });
    }

    return Array.from(debilidadesSet);
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

function mostrarPokemonsVisual(pokemonList) {
    const grid = document.getElementById("visual-grid");
    grid.innerHTML = ""; // Limpiar antes de renderizar

    pokemonList.forEach(poke => {
        const img = document.createElement("img");
        img.src = poke.sprites.front_default; // Usa sprite simple
        img.alt = poke.name;
        img.title = poke.name;

        // Clic abre el modal del Pokémon
        img.addEventListener("click", () => {
        mostrarModal(poke);
        });

        grid.appendChild(img);
    });
}


async function iniciarApp() {
    await cargarPokemones();
    mostrarPokemonsVisual(todosLosPokemon);
    console.log("Pokémon cargados:", todosLosPokemon);

}


// Iniciar
iniciarApp();









