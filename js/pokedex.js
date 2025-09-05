// ===============================
// Variables globales
// ===============================
const listaPokemon = document.getElementById("listaPokemon");
const modal = document.getElementById("modal");
const cerrarModalBtn = document.getElementById("cerrar-modal");
const modalPokemonImg = document.getElementById("modal-pokemon-img");
const modalPokemonName = document.getElementById("modal-pokemon-name");
const modalPokemonId = document.getElementById("modal-pokemon-id");
const modalPokemonDescription = document.getElementById("modal-pokemon-description");
const modalPokemonHeight = document.getElementById("modal-pokemon-height");
const modalPokemonWeight = document.getElementById("modal-pokemon-weight");
const modalPokemonCategory = document.getElementById("modal-pokemon-category");
const modalPokemonAbility = document.getElementById("modal-pokemon-ability");
const modalPokemonGender = document.getElementById("modal-pokemon-gender");
const modalPokemonTypes = document.getElementById("modal-pokemon-types");
const modalPokemonWeaknesses = document.getElementById("modal-pokemon-weaknesses");
const modalPokemonEvolutions = document.getElementById("modal-pokemon-evolutions");
const btnCry = document.getElementById("btn-cry");
const btnShiny = document.getElementById("btn-shiny");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

let visiblePokemons = [];   // lista actualmente mostrada en pantalla


// Filtros
const nombreInput = document.getElementById("nombre-input");
const tipoSelect = document.getElementById("tipo-select");
const generacionSelect = document.getElementById("generacion-select");
const ordenarSelect = document.getElementById("ordenar-select");

// Data cache
let pokemons = [];
let currentPokemonIndex = 0;
let isShiny = false;

// ===============================
// Utilidades
// ===============================
function hexToRGBA(hex, opacity) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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

async function obtenerDebilidades(poke) {
    const tipos = poke.tipos;
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


// ===============================
// Renderizado de tarjetas
// ===============================
function renderPokemons(lista) {
    visiblePokemons = lista.slice();   // <-- guarda lo que se está mostrando

    listaPokemon.innerHTML = "";
    lista.forEach((pokemon) => {
        const div = document.createElement("div");
        div.classList.add("pokemon");
        div.innerHTML = `
        <p class="pokemon-id-back">#${String(pokemon.id).padStart(3, "0")}</p>
        <div class="pokemon-imagen">
            <img src="${pokemon.imagen}" alt="${pokemon.nombre}" />
        </div>
        <div class="pokemon-info">
            <div class="nombre-contenedor">
            <p class="pokemon-id">#${String(pokemon.id).padStart(3, "0")}</p>
            <h2 class="pokemon-nombre">${pokemon.nombre}</h2>
            </div>
            <div class="pokemon-tipos">
            ${pokemon.tipos.map(tipo => `<p class="${tipo} tipo">${tipo.toUpperCase()}</p>`).join("")}
            </div>
            <div class="pokemon-stats">
            <p class="stat">${pokemon.altura} m</p>
            <p class="stat">${pokemon.peso} kg</p>
            </div>
        </div>
        `;

        // IMPORTANTÍSIMO: convertir a índice del arreglo global "pokemons"
        const globalIndex = pokemons.findIndex(p => p.id === pokemon.id);
        div.addEventListener("click", () => abrirModal(globalIndex));

        listaPokemon.appendChild(div);
    });
}

function renderDebilidades(debilidades) {
    modalPokemonWeaknesses.innerHTML = "";
    debilidades.forEach(tipo => {
        const btn = document.createElement("button");
        btn.className = `type ${tipo}`;
        btn.textContent = traducirTipo(tipo);
        modalPokemonWeaknesses.appendChild(btn);
    });
}



// ===============================
// Función para cargar y mostrar evoluciones
// ===============================
async function cargarYMostrarEvoluciones(url) {
    try {
        const resEvo = await fetch(url);
        const dataEvo = await resEvo.json();

        // Extraer todos los nombres en la cadena de evoluciones (recursivo)
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

        // Obtener los datos completos de cada Pokémon en la cadena evolutiva
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
        evoContainer.innerHTML = ""; // limpiar antes de mostrar

        evolucionesConDatos.forEach((evo, idx) => {
            const div = document.createElement("div");
            div.classList.add("evo-item");
            div.title = evo.name;

            const img = document.createElement("img");
            img.src = evo.img;
            img.alt = evo.name;

            const pName = document.createElement("p");
            pName.classList.add("evo-name");
            pName.textContent = evo.name.charAt(0).toUpperCase() + evo.name.slice(1);

            const pNumber = document.createElement("p");
            pNumber.classList.add("evo-number");
            pNumber.textContent = `N°${String(evo.id).padStart(3, "0")}`;

            const tiposDiv = document.createElement("div");
            tiposDiv.classList.add("evo-types");
            evo.types.forEach(tipo => {
                const btn = document.createElement("button");
                btn.className = `tipo-${tipo}`;  // Cambiar aquí
                btn.textContent = traducirTipo(tipo);
                tiposDiv.appendChild(btn);
            });





            div.appendChild(img);
            div.appendChild(pName);
            div.appendChild(pNumber);
            div.appendChild(tiposDiv);

            // Opcional: agregar evento click para abrir modal de esa evolución
            div.addEventListener("click", async () => {
                const idxGlobal = pokemons.findIndex(p => p.id === evo.id);
                if (idxGlobal >= 0) {
                    abrirModal(idxGlobal);
                } else {
                    // Si no está en la lista, puedes cargar y mostrar directamente:
                    try {
                        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${evo.name}`);
                        const data = await res.json();
                        // Puedes implementar mostrarModal(data) si quieres o abrirModal con el nuevo pokémon añadido a pokemons
                        alert(`Pokémon ${evo.name} no está cargado en la lista.`);
                    } catch (e) {
                        console.error(e);
                    }
                }
            });

            evoContainer.appendChild(div);

            // Flecha entre evoluciones salvo la última
            if (idx < evolucionesConDatos.length - 1) {
                const flecha = document.createElement("div");
                flecha.classList.add("flecha");
                flecha.textContent = "→";
                evoContainer.appendChild(flecha);
            }
        });

    } catch (error) {
        console.error("Error cargando evoluciones:", error);
        const evoContainer = document.getElementById("modal-pokemon-evolutions");
        evoContainer.innerHTML = "<p>Error al cargar evoluciones</p>";
    }
}



// ===============================
// Modal
// ===============================
async function abrirModal(index) {
    currentPokemonIndex = index;
    const pokemon = pokemons[index];
    isShiny = false;
    modal.classList.remove("hidden");

    modalPokemonImg.src = pokemon.imagen;
    modalPokemonName.textContent = pokemon.nombre;
    modalPokemonId.textContent = `#${String(pokemon.id).padStart(3, "0")}`;
    modalPokemonDescription.textContent = pokemon.descripcion || "Sin descripción.";
    modalPokemonHeight.textContent = pokemon.altura;
    modalPokemonWeight.textContent = pokemon.peso;
    modalPokemonCategory.textContent = pokemon.categoria || "N/A";
    modalPokemonAbility.textContent = pokemon.habilidad || "N/A";
    modalPokemonGender.textContent = pokemon.genero || "♂ ♀";

    modalPokemonTypes.innerHTML = pokemon.tipos
        .map(tipo => `<button class="type ${tipo}">${traducirTipo(tipo)}</button>`)
        .join("");


    modalPokemonWeaknesses.innerHTML = "<p>Cargando debilidades...</p>";
        obtenerDebilidades(pokemon).then(debilidades => {
            if (debilidades.length > 0) {
                renderDebilidades(debilidades);
            } else {
                modalPokemonWeaknesses.innerHTML = "<p>Sin debilidades encontradas.</p>";
            }
        }).catch(() => {
            modalPokemonWeaknesses.innerHTML = "<p>Error cargando debilidades.</p>";
        });


    // Aquí vaciamos inicialmente evoluciones para que no quede info vieja
    modalPokemonEvolutions.innerHTML = "<p>Cargando evoluciones...</p>";

    // Ahora cargamos las evoluciones dinámicamente
    try {
        if (pokemon.speciesUrl) {
            const speciesRes = await fetch(pokemon.speciesUrl);
            const speciesData = await speciesRes.json();

            if (speciesData.evolution_chain?.url) {
                await cargarYMostrarEvoluciones(speciesData.evolution_chain.url);
            } else {
                modalPokemonEvolutions.innerHTML = "<p>Sin evoluciones</p>";
            }
        } else {
            modalPokemonEvolutions.innerHTML = "<p>Sin evoluciones</p>";
        }
    } catch (error) {
        console.error("Error cargando evoluciones:", error);
        modalPokemonEvolutions.innerHTML = "<p>Error al cargar evoluciones</p>";
    }
}


function cerrarModal() {
    modal.classList.add("hidden");
}

// ===============================
// Eventos modal
// ===============================
cerrarModalBtn.addEventListener("click", cerrarModal);

btnShiny.addEventListener("click", () => {
    const pokemon = pokemons[currentPokemonIndex];
    isShiny = !isShiny;
    modalPokemonImg.src = isShiny ? pokemon.shiny : pokemon.imagen;
});

btnCry.addEventListener("click", () => {
    const pokemon = pokemons[currentPokemonIndex];
    if (pokemon.cry) {
        const audio = new Audio(pokemon.cry);
        audio.play();
    }
});

prevBtn.addEventListener("click", () => {
    if (!visiblePokemons.length) return;

    // índice del Pokémon abierto dentro de la lista visible
    const iVisible = visiblePokemons.findIndex(p => p.id === pokemons[currentPokemonIndex].id);

    // moverse al anterior con wrap-around
    const j = (iVisible - 1 + visiblePokemons.length) % visiblePokemons.length;

    // convertir el elegido (visible) a índice en el arreglo global
    const newGlobalIndex = pokemons.findIndex(p => p.id === visiblePokemons[j].id);

    abrirModal(newGlobalIndex);
    });

    nextBtn.addEventListener("click", () => {
    if (!visiblePokemons.length) return;

    const iVisible = visiblePokemons.findIndex(p => p.id === pokemons[currentPokemonIndex].id);
    const j = (iVisible + 1) % visiblePokemons.length;

    const newGlobalIndex = pokemons.findIndex(p => p.id === visiblePokemons[j].id);

    abrirModal(newGlobalIndex);
});

// Opcional: cerrar modal al hacer clic fuera del contenido
modal.addEventListener("click", function (e) {
    const modalContent = document.querySelector(".modal-content");
    const modalButtons = document.querySelector(".modal-buttons");

    if (
        !modalContent.contains(e.target) &&
        !modalButtons.contains(e.target)
    ) {
        modal.classList.add("hidden");
        document.body.style.overflow = "";
    }
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

// Navegación teclado y cierre con ESC
document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("hidden")) {
        if (!visiblePokemons.length) return;

        const iVisible = visiblePokemons.findIndex(p => p.id === pokemons[currentPokemonIndex].id);

        if (event.key === "ArrowRight") {
            const j = (iVisible + 1) % visiblePokemons.length;
            const newGlobalIndex = pokemons.findIndex(p => p.id === visiblePokemons[j].id);
            abrirModal(newGlobalIndex);
        } else if (event.key === "ArrowLeft") {
            const j = (iVisible - 1 + visiblePokemons.length) % visiblePokemons.length;
            const newGlobalIndex = pokemons.findIndex(p => p.id === visiblePokemons[j].id);
            abrirModal(newGlobalIndex);
        } else if (event.key === "Escape") {
            modal.classList.add("hidden");
            document.body.style.overflow = "";
        }
    }
});





// ===============================
// Filtros
// ===============================
function aplicarFiltros() {
    let lista = [...pokemons];

    const nombre = nombreInput.value.toLowerCase();
    if (nombre) {
        lista = lista.filter(p => p.nombre.toLowerCase().includes(nombre));
    }

    const tipo = tipoSelect.value;
    if (tipo !== "all") {
        lista = lista.filter(p => p.tipos.includes(tipo));
    }

    const generacion = generacionSelect.value;
    if (generacion !== "all") {
        const rango = {
        "1": [1, 151],
        "2": [152, 251],
        "3": [252, 386],
        "4": [387, 493],
        "5": [494, 649],
        "6": [650, 721],
        "7": [722, 809],
        "8": [810, 898],
        "9": [899, 1010]
        };
        const [min, max] = rango[generacion];
        lista = lista.filter(p => p.id >= min && p.id <= max);
    }

    const ordenar = ordenarSelect.value;
    if (ordenar === "id-asc") lista.sort((a, b) => a.id - b.id);
    if (ordenar === "id-desc") lista.sort((a, b) => b.id - a.id);
    if (ordenar === "nombre-asc") lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (ordenar === "nombre-desc") lista.sort((a, b) => b.nombre.localeCompare(a.nombre));

    renderPokemons(lista);
}

[nombreInput, tipoSelect, generacionSelect, ordenarSelect].forEach(el =>
    el.addEventListener("input", aplicarFiltros)
);

// ===============================
// Carga inicial
// ===============================
async function cargarPokemons() {
    const limit = 151;
    const bloque = 20; // cargar 20 Pokémon a la vez

    for (let i = 1; i <= limit; i += bloque) {
        const promesas = [];
        for (let j = i; j < i + bloque && j <= limit; j++) {
            promesas.push(
                fetch(`https://pokeapi.co/api/v2/pokemon/${j}`)
                    .then(res => res.json())
                    .then(async data => {
                        const speciesRes = await fetch(data.species.url);
                        const speciesData = await speciesRes.json();

                        return {
                            id: data.id,
                            nombre: data.name,
                            imagen: data.sprites.other["official-artwork"].front_default,
                            shiny: data.sprites.other["official-artwork"].front_shiny,
                            cry: data.cries?.latest,
                            altura: data.height / 10,
                            peso: data.weight / 10,
                            tipos: data.types.map(t => t.type.name),
                            descripcion: speciesData.flavor_text_entries.find(e => e.language.name === "es")?.flavor_text || "",
                            categoria: speciesData.genera.find(g => g.language.name === "es")?.genus || "",
                            habilidad: data.abilities[0]?.ability.name || "",
                            genero: "♂ ♀",
                            evoluciones: [],
                            speciesUrl: data.species.url  // <-- Aquí agregas esta línea
                        };

                    })
            );
        }

        const resultados = await Promise.all(promesas);
        pokemons.push(...resultados);
        console.log(`Cargados hasta el Pokémon #${Math.min(i + bloque - 1, limit)}`);
    }

    aplicarFiltros();
}


cargarPokemons();
