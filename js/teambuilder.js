/**************************/
/*** Elementos del DOM ***/
/**************************/
const teamContainer = document.querySelector(".team-container");
const visualContainer = document.getElementById("pokedex-visual"); // Contenedor principal pokédex
const analizarBtn = document.getElementById("btn-analizar-equipo"); // Botón analizar equipo
const analisisContainer = document.getElementById("analisis-container"); // Contenedor análisis


const iconBaseURL = "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/"; // fuente pública de iconos svg

/****************************/
/*** Variables Globales   ***/
/****************************/
let equipoPokemon = [null, null, null, null, null, null]; // 6 slots fijos
let pokemonsOcultos = new Set();    // Pokémon ocultos


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

const tipoRelaciones = {
    normal: {
        debilidades: ["fighting"],
        resistencias: [],
        inmunidades: ["ghost"]
    },
    fighting: {
        debilidades: ["flying", "psychic", "fairy"],
        resistencias: ["rock", "bug", "dark"],
        inmunidades: []
    },
    flying: {
        debilidades: ["rock", "electric", "ice"],
        resistencias: ["fighting", "bug", "grass"],
        inmunidades: ["ground"]
    },
    poison: {
        debilidades: ["ground", "psychic"],
        resistencias: ["fighting", "poison", "bug", "grass", "fairy"],
        inmunidades: []
    },
    ground: {
        debilidades: ["water", "grass", "ice"],
        resistencias: ["poison", "rock"],
        inmunidades: ["electric"]
    },
    rock: {
        debilidades: ["fighting", "ground", "steel", "water", "grass"],
        resistencias: ["normal", "flying", "poison", "fire"],
        inmunidades: []
    },
    bug: {
        debilidades: ["flying", "rock", "fire"],
        resistencias: ["fighting", "ground", "grass"],
        inmunidades: []
    },
    ghost: {
        debilidades: ["ghost", "dark"],
        resistencias: ["poison", "bug"],
        inmunidades: ["normal", "fighting"]
    },
    steel: {
        debilidades: ["fighting", "ground", "fire"],
        resistencias: ["normal", "flying", "rock", "bug", "steel", "grass", "psychic", "ice", "dragon", "fairy"],
        inmunidades: ["poison"]
    },
    fire: {
        debilidades: ["ground", "rock", "water"],
        resistencias: ["bug", "steel", "fire", "grass", "ice", "fairy"],
        inmunidades: []
    },
    water: {
        debilidades: ["electric", "grass"],
        resistencias: ["steel", "fire", "water", "ice"],
        inmunidades: []
    },
    grass: {
        debilidades: ["flying", "poison", "bug", "fire", "ice"],
        resistencias: ["ground", "water", "grass", "electric"],
        inmunidades: []
    },
    electric: {
        debilidades: ["ground"],
        resistencias: ["flying", "steel", "electric"],
        inmunidades: []
    },
    psychic: {
        debilidades: ["bug", "ghost", "dark"],
        resistencias: ["fighting", "psychic"],
        inmunidades: []
    },
    ice: {
        debilidades: ["fighting", "rock", "steel", "fire"],
        resistencias: ["ice"],
        inmunidades: []
    },
    dragon: {
        debilidades: ["ice", "dragon", "fairy"],
        resistencias: ["fire", "water", "grass", "electric"],
        inmunidades: []
    },
    dark: {
        debilidades: ["fighting", "bug", "fairy"],
        resistencias: ["ghost", "dark"],
        inmunidades: ["psychic"]
    },
    fairy: {
        debilidades: ["poison", "steel"],
        resistencias: ["fighting", "bug", "dark"],
        inmunidades: ["dragon"]
    }
};


/******************************/
/*** Crear 6 cuadros del equipo ***/
/******************************/
for (let i = 0; i < 6; i++) {
    const div = document.createElement("div");
    div.classList.add("team-slot");
    div.dataset.index = i;
    teamContainer.appendChild(div);
}

/**********************/
/*** Renderizar Equipo ***/
/**********************/
function renderTeam() {
    const slots = document.querySelectorAll('.team-slot');
    slots.forEach((slot, index) => {
        slot.classList.add("pokemon");     // <-- Agregamos clase para selección
        slot.dataset.index = index;        // <-- Agregamos índice para identificar el poke

        if (equipoPokemon[index]) {
            const poke = equipoPokemon[index];
            slot.innerHTML = `
                <button class="remove-btn" onclick="removeFromTeam(${index})">❌</button>
                <div class="team-image-wrapper">
                    <img src="${poke.sprites.front_default}" alt="${poke.name}" title="${poke.name}">
                </div>
                <div class="team-name">${poke.name.charAt(0).toUpperCase() + poke.name.slice(1)}</div>
                <div class="team-types">
                    ${poke.types.map(t => `
                        <span class="team-type tipo-${t.type.name.toLowerCase()}">${traducirTipo(t.type.name)}</span>
                    `).join("")}
                </div>
            `;
        } else {
            slot.innerHTML = ""; // Vacío si no hay Pokémon
        }
    });
}


/**********************/
/*** Añadir Pokémon ***/
/**********************/
function addToTeam(poke) {
    const indexVacio = equipoPokemon.findIndex(p => p === null);

    if (indexVacio === -1) {
        alert("Tu equipo ya está completo (6 Pokémon).");
        return;
    }

    equipoPokemon[indexVacio] = poke;

    // Agregar a ocultos por nombre único
    pokemonsOcultos.add(poke.name);

    renderTeam();
    renderPokemonsPorRegion(); // <-- actualizar lista para ocultar
    analizarEquipo();
}


/**********************/
/*** Quitar Pokémon ***/
/**********************/
function removeFromTeam(index) {
    const poke = equipoPokemon[index];
    if (poke) {
        pokemonsOcultos.delete(poke.name);
    }
    equipoPokemon[index] = null;
    renderTeam();
    renderPokemonsPorRegion(); // <-- actualizar lista para mostrar
    analizarEquipo();
}


/*********************************/
/*** Generar Equipo Aleatorio ***/
/*******************************/
function generarEquipoAleatorio() {
    // Obtener todos los Pokémon cargados de todas las regiones en un solo array
    const todosLosPokemons = Object.values(pokemonsPorRegion).flat();

    if (todosLosPokemons.length < 6) {
        alert("No hay suficientes Pokémon para generar un equipo aleatorio.");
        return;
    }

    // Limpiar el equipo actual
    equipoPokemon = [null, null, null, null, null, null];

    // Para evitar duplicados
    const indicesUsados = new Set();

    // Seleccionar 6 Pokémon aleatorios sin repetición
    while (indicesUsados.size < 6) {
        const indiceAleatorio = Math.floor(Math.random() * todosLosPokemons.length);
        indicesUsados.add(indiceAleatorio);
    }

    // Asignar esos Pokémon al equipo
    let i = 0;
    indicesUsados.forEach(indice => {
        equipoPokemon[i] = todosLosPokemons[indice];
        i++;
    });

    renderTeam();
    analizarEquipo();
}


/**********************/
/*** Analizar Equipo ***/
/**********************/
function analizarEquipo() {
    analisisContainer.innerHTML = "";

    const pokes = equipoPokemon.filter(p => p !== null);

    if (pokes.length === 0) {
        analisisContainer.innerHTML = "<p>No hay Pokémon en el equipo.</p>";
        return;
    }

    const tipoIconos = {
        normal: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/normal.svg",
        fighting: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/fighting.svg",
        flying: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/flying.svg",
        poison: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/poison.svg",
        ground: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/ground.svg",
        rock: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/rock.svg",
        bug: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/bug.svg",
        ghost: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/ghost.svg",
        steel: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/steel.svg",
        fire: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/fire.svg",
        water: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/water.svg",
        grass: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/grass.svg",
        electric: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/electric.svg",
        psychic: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/psychic.svg",
        ice: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/ice.svg",
        dragon: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/dragon.svg",
        dark: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/dark.svg",
        fairy: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/fairy.svg",
    };

    function calcularDefensasEquipo(equipo) {
        const tiposAtaque = Object.keys(tipoRelaciones);
        const resultado = {};

        tiposAtaque.forEach(tipo => {
            resultado[tipo] = { resistencias: 0, debilidades: 0, inmunidades: 0 };
        });

        equipo.forEach(pokemon => {
            const tipos = pokemon.types.map(t => t.type.name);

            tiposAtaque.forEach(tipoAtq => {
                let multiplicador = 1;

                tipos.forEach(tipoDef => {
                    if (tipoRelaciones[tipoDef].debilidades.includes(tipoAtq)) {
                        multiplicador *= 2;
                    } else if (tipoRelaciones[tipoDef].resistencias.includes(tipoAtq)) {
                        multiplicador *= 0.5;
                    } else if (tipoRelaciones[tipoDef].inmunidades.includes(tipoAtq)) {
                        multiplicador *= 0;
                    }
                });

                if (multiplicador === 0) resultado[tipoAtq].inmunidades++;
                else if (multiplicador < 1) resultado[tipoAtq].resistencias++;
                else if (multiplicador > 1) resultado[tipoAtq].debilidades++;
            });
        });

        return resultado;
    }

    const defensas = calcularDefensasEquipo(pokes);

    const tiposCount = {};
    pokes.forEach(p => {
        p.types.forEach(t => {
            tiposCount[t.type.name] = (tiposCount[t.type.name] || 0) + 1;
        });
    });

    let htmlTipos = `<h3>Tipos en el equipo</h3><div style="display:flex; flex-wrap: wrap; gap: 10px;">`;

    Object.entries(tiposCount).forEach(([tipo, count]) => {
        htmlTipos += `
        <div style="display:flex; align-items:center; gap: 5px; border: 1px solid #ddd; padding: 5px 10px; border-radius: 8px;">
            <img src="${tipoIconos[tipo]}" alt="${tipo}" title="${traducirTipo(tipo)}" width="24" height="24" />
            <strong>: ${count}</strong>
        </div>
    `;
    });
    htmlTipos += "</div>";
    htmlTipos += "</div>";

    function generarBarrasTipo(valores) {
    const totalBarras = 7;
    const barras = [];

    // Llenar las barras con prioridad: resistencia > debilidad > inmunidad
    for (let i = 0; i < valores.resistencias; i++) {
        if (barras.length < totalBarras) barras.push("resistencia");
    }
    for (let i = 0; i < valores.debilidades; i++) {
        if (barras.length < totalBarras) barras.push("debilidad");
    }
    for (let i = 0; i < valores.inmunidades; i++) {
        if (barras.length < totalBarras) barras.push("inmunidad");
    }

    // Rellenar con vacío (gris) si faltan barras
    while (barras.length < totalBarras) {
        barras.push("vacio");
    }

    return barras.map(tipo => {
        let color = "#eee";
        let title = "Sin datos";

        if (tipo === "resistencia") {
            color = "#4caf50";
            title = "Resistencia";
        } else if (tipo === "debilidad") {
            color = "#f44336";
            title = "Debilidad";
        } else if (tipo === "inmunidad") {
            color = "#ffc107";
            title = "Inmunidad";
        }

        return `<div class="barra" title="${title}" style="
            width: 8px;
            height: 20px;
            margin-right: 2px;
            background-color: ${color};
            border-radius: 2px;
        "></div>`;
    }).join("");
}



    let htmlDefensas = `<h3>Análisis de defensas del equipo</h3><div class="defensas-container">`;

        Object.entries(defensas).forEach(([tipo, valores]) => {
            const total = valores.resistencias + valores.debilidades + valores.inmunidades;

            htmlDefensas += `
                <div class="defensa-tipo" data-tipo="${tipo}" title="${tipo.toUpperCase()}">
                    <img src="${tipoIconos[tipo]}" alt="${tipo}" title="${traducirTipo(tipo)}" style="width:32px; height:32px;" />
                    <div class="barras">
                        ${generarBarrasTipo(valores)}
                    </div>
                </div>
            `;
        });

        htmlDefensas += "</div>";



    analisisContainer.innerHTML = htmlTipos + htmlDefensas + `
    <div style="margin-top: 10px; display: flex; justify-content: center; gap: 15px; font-size: 12px;">
        <div><span style="display:inline-block; width:12px; height:12px; background:#4caf50; border-radius:2px;"></span> Resistencia</div>
        <div><span style="display:inline-block; width:12px; height:12px; background:#f44336; border-radius:2px;"></span> Debilidad</div>
        <div><span style="display:inline-block; width:12px; height:12px; background:#ffc107; border-radius:2px;"></span> Inmunidad</div>
    </div>
    `;

    // Función para calcular multiplicador defensa individual (igual que antes)
    function calcularMultiplicadorDefensa(poke, tipoAtaque) {
        let multiplicador = 1;
        const tipos = poke.types.map(t => t.type.name);

        tipos.forEach(tipoDef => {
            if (tipoRelaciones[tipoDef].debilidades.includes(tipoAtaque)) {
                multiplicador *= 2;
            } else if (tipoRelaciones[tipoDef].resistencias.includes(tipoAtaque)) {
                multiplicador *= 0.5;
            } else if (tipoRelaciones[tipoDef].inmunidades.includes(tipoAtaque)) {
                multiplicador *= 0;
            }
        });

        return multiplicador;
    }

    const barrasDefensa = analisisContainer.querySelectorAll(".defensa-tipo");

    barrasDefensa.forEach(barra => {
        barra.addEventListener("mouseenter", () => {
            const tipo = barra.getAttribute("data-tipo");

            pokes.forEach((poke, index) => {
                const mult = calcularMultiplicadorDefensa(poke, tipo);
                const pokeElem = document.querySelector(`.pokemon[data-index="${index}"]`);
                if (pokeElem) {
                    pokeElem.classList.remove("resaltado-resistencia", "resaltado-debilidad", "resaltado-inmunidad");

                    if (mult === 0) {
                        pokeElem.classList.add("resaltado-inmunidad");
                    } else if (mult < 1) {
                        pokeElem.classList.add("resaltado-resistencia");
                    } else if (mult > 1) {
                        pokeElem.classList.add("resaltado-debilidad");
                    }
                }
            });
        });

        barra.addEventListener("mouseleave", () => {
            pokes.forEach((_, index) => {
                const pokeElem = document.querySelector(`.pokemon[data-index="${index}"]`);
                if (pokeElem) {
                    pokeElem.classList.remove("resaltado-resistencia", "resaltado-debilidad", "resaltado-inmunidad");
                }
            });
        });
    });
}


/**************************/
/*** Mostrar/Ocultar Análisis ***/
/**************************/
analisisContainer.style.display = "none"; // Oculto inicialmente

function toggleAnalisis() {
    if (analisisContainer.style.display === "none") {
        analizarEquipo(); // Actualiza y muestra análisis
        analisisContainer.style.display = "block";
        analizarBtn.textContent = "Ocultar análisis";
    } else {
        analisisContainer.style.display = "none";
        analizarBtn.textContent = "Analizar equipo";
    }
}

analizarBtn.addEventListener("click", toggleAnalisis);

/**********************/
/*** Vaciar Equipo ***/
/**********************/
const vaciarBtn = document.getElementById("btn-vaciar-equipo");

vaciarBtn.addEventListener("click", () => {
    // Limpiar el equipo
    equipoPokemon = [null, null, null, null, null, null];
    pokemonsOcultos.clear(); // Mostrar todos los Pokémon de nuevo

    // Actualizar la UI
    renderTeam();
    renderPokemonsPorRegion();
    analizarEquipo();
});




// Estado global de filtros
let filtrosActivos = { 
    tipo: '', 
    regiones: new Set(['generation-i', 'generation-ii']), 
    nombre: '' 
};

// Renderiza los filtros y configura sus eventos
function renderFiltros() {
    let filtrosDiv = document.querySelector(".filtros-pokedex");
    if (!filtrosDiv) {
        filtrosDiv = document.createElement("div");
        filtrosDiv.className = "filtros-pokedex";
        filtrosDiv.innerHTML = `
            <label>Tipo:
                <select id="filtro-tipo">
                    <option value="">Todos</option>
                    <option value="normal">Normal</option>
                    <option value="fire">Fuego</option>
                    <option value="water">Agua</option>
                    <option value="electric">Eléctrico</option>
                    <option value="grass">Planta</option>
                    <option value="ice">Hielo</option>
                    <option value="fighting">Lucha</option>
                    <option value="poison">Veneno</option>
                    <option value="ground">Tierra</option>
                    <option value="flying">Volador</option>
                    <option value="psychic">Psíquico</option>
                    <option value="bug">Bicho</option>
                    <option value="rock">Roca</option>
                    <option value="ghost">Fantasma</option>
                    <option value="dragon">Dragón</option>
                    <option value="dark">Siniestro</option>
                    <option value="steel">Acero</option>
                    <option value="fairy">Hada</option>
                </select>
            </label>

            <label>Generación:
                <div class="dropdown" id="dropdown-generaciones" style="display: inline-block; position: relative; margin-left: 10px;">
                    <div id="dropdown-button" 
                        style="border: 1px solid #ccc; padding: 6px 12px; cursor: pointer; user-select: none; min-width: 160px;">
                        Seleccionar Generación(s)
                    </div>
                    <div id="dropdown-content" 
                        style="display:none; position: absolute; background: white; border: 1px solid #ccc; margin-top: 2px; min-width: 160px; max-height: 150px; overflow-y: auto; z-index: 1000;">
                        <label style="display:block; padding: 5px 10px; cursor:pointer;">
                            <input type="checkbox" id="select-all" /> Select All
                        </label>
                        <label style="display:block; padding: 5px 10px; cursor:pointer;">
                            <input type="checkbox" class="generation-checkbox" value="generation-i" /> Generación I
                        </label>
                        <label style="display:block; padding: 5px 10px; cursor:pointer;">
                            <input type="checkbox" class="generation-checkbox" value="generation-ii" /> Generación II
                        </label>
                    </div>
                </div>
            </label>

            <label>Nombre:
                <input type="text" id="filtro-nombre" placeholder="Buscar por nombre" style="margin-left:10px;" />
            </label>
        `;

        visualContainer.appendChild(filtrosDiv);

        // Referencias
        const dropdownButton = filtrosDiv.querySelector("#dropdown-button");
        const dropdownContent = filtrosDiv.querySelector("#dropdown-content");
        const selectAllCheckbox = filtrosDiv.querySelector("#select-all");
        const generationCheckboxes = filtrosDiv.querySelectorAll(".generation-checkbox");
        const filtroTipo = filtrosDiv.querySelector("#filtro-tipo");
        const filtroNombre = filtrosDiv.querySelector("#filtro-nombre");

        // Función para actualizar texto botón dropdown
        function updateDropdownButtonText() {
            const checkedBoxes = [...generationCheckboxes].filter(chk => chk.checked);
            if (checkedBoxes.length === generationCheckboxes.length) {
                dropdownButton.textContent = "All Selected";
            } else if (checkedBoxes.length === 0) {
                dropdownButton.textContent = "None Selected";
            } else {
                dropdownButton.textContent = `${checkedBoxes.length} Selected`;
            }
        }

        // Inicializar estados según filtrosActivos
        generationCheckboxes.forEach(chk => {
            chk.checked = filtrosActivos.regiones.has(chk.value);
        });
        selectAllCheckbox.checked = [...generationCheckboxes].every(chk => chk.checked);
        filtroTipo.value = filtrosActivos.tipo;
        filtroNombre.value = filtrosActivos.nombre;

        updateDropdownButtonText();

        // Mostrar / ocultar dropdown generaciones
        dropdownButton.addEventListener("click", () => {
            dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
        });

        // Evitar que clics dentro del dropdown cierren el menú
        dropdownContent.addEventListener("click", e => e.stopPropagation());

        // Cerrar dropdown si clic afuera
        document.addEventListener("click", (e) => {
            if (!dropdownButton.contains(e.target) && !dropdownContent.contains(e.target)) {
                dropdownContent.style.display = "none";
            }
        });

        // Evento select all
        selectAllCheckbox.addEventListener("change", () => {
            const checked = selectAllCheckbox.checked;
            generationCheckboxes.forEach(chk => {
                chk.checked = checked;
                if (checked) {
                    filtrosActivos.regiones.add(chk.value);
                } else {
                    filtrosActivos.regiones.delete(chk.value);
                }
            });
            renderPokemonsPorRegion();
            updateDropdownButtonText();
        });

        // Evento checkboxes individuales
        generationCheckboxes.forEach(chk => {
            chk.addEventListener("change", () => {
                if (chk.checked) {
                    filtrosActivos.regiones.add(chk.value);
                } else {
                    filtrosActivos.regiones.delete(chk.value);
                }
                selectAllCheckbox.checked = [...generationCheckboxes].every(chk => chk.checked);
                renderPokemonsPorRegion();
                updateDropdownButtonText();
            });
        });

        // Evento filtro tipo
        filtroTipo.addEventListener("change", () => {
            filtrosActivos.tipo = filtroTipo.value;
            renderPokemonsPorRegion();
        });

        // Evento filtro nombre
        filtroNombre.addEventListener("input", () => {
            filtrosActivos.nombre = filtroNombre.value.toLowerCase();
            renderPokemonsPorRegion();
        });
    }
}


// Renderiza los pokémons según filtrosActivos
function renderPokemonsPorRegion() {
    // Limpiar solo la parte visual (sin los filtros)
    while (visualContainer.children.length > 1) {
        visualContainer.removeChild(visualContainer.lastChild);
    }

    Object.keys(pokemonsPorRegion).forEach(regionId => {
        if (!filtrosActivos.regiones.has(regionId)) return;

        const nombreRegion = regiones[regionId];
        const section = document.createElement("section");
        section.className = "region-section";

        const title = document.createElement("h3");
        title.textContent = nombreRegion;

        const grid = document.createElement("div");
        grid.className = "pokedex-grid";

        pokemonsPorRegion[regionId].forEach(poke => {
            if (pokemonsOcultos.has(poke.name)) return;
            if (filtrosActivos.tipo && !poke.types.some(t => t.type.name === filtrosActivos.tipo)) return;
            if (filtrosActivos.nombre && !poke.name.toLowerCase().includes(filtrosActivos.nombre)) return;

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

        if (grid.children.length > 0) {
            section.appendChild(title);
            section.appendChild(grid);
            visualContainer.appendChild(section);
        }
    });
}








/**********************/
/*** Cargar Pokémons ***/
/**********************/
async function cargarPokemonesVisual() {
    const promesas = [];

    for (let i = 1; i <= 251; i++) { // Kanto + Johto
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

/**********************/
/*** Fetch Pokémon con Región ***/
/**********************/
async function fetchPokemonConRegion(id) {
    const data = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(r => r.json());
    const species = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then(r => r.json());
    return {
        ...data,
        region: species.generation.name
    };
}

/**********************/
/*** Eventos ***/
/**********************/
analizarBtn.addEventListener("click", toggleAnalisis);

/**********************/
/*** Inicio ***/
/**********************/
renderFiltros();
renderPokemonsPorRegion();
cargarPokemonesVisual();
renderTeam();

analisisContainer.style.display = "none"; // Oculto análisis inicialmente
