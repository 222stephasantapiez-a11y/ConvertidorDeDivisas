const resultadoContenedor = document.getElementById("resultado");
const estado = document.getElementById("estado");
const inputValor = document.getElementById("valor");
const botonConvertir = document.getElementById("btn-convertir");

botonConvertir.addEventListener("click", convertir);

async function convertir() {
  const valor = Number(inputValor.value);

  if (!valor || valor <= 0) {
    mostrarEstado("Ingresa un valor mayor que 0 para convertir.", "text-danger");
    resultadoContenedor.innerHTML = "";
    return;
  }

  mostrarEstado("Consultando cotizaciones...", "text-secondary");
  resultadoContenedor.innerHTML = "";

  try {
    const arrayDivisas = await consultar();

    if (!Array.isArray(arrayDivisas) || arrayDivisas.length === 0) {
      mostrarEstado("No se encontraron cotizaciones disponibles.", "text-warning");
      return;
    }

    const filasValidas = arrayDivisas
      .map((divisa) => {
        const tasa = obtenerTasa(divisa);
        if (!tasa || tasa <= 0) return null;

        return {
          nombre: divisa.nombre || divisa.casa || "Divisa",
          tasa,
          conversion: valor / tasa,
          fecha: divisa.fechaActualizacion || "Sin fecha",
        };
      })
      .filter(Boolean);

    if (filasValidas.length === 0) {
      mostrarEstado("La API respondió, pero no hubo datos numéricos convertibles.", "text-warning");
      return;
    }

    renderizarResultados(filasValidas, valor);
    mostrarEstado(`Se calcularon ${filasValidas.length} conversiones.`, "text-success");
  } catch (error) {
    console.error(error);
    mostrarEstado("Ocurrió un error al consultar la API. Intenta nuevamente.", "text-danger");
  }
}

function obtenerTasa(divisa) {
  return Number(divisa.venta || divisa.compra || divisa.promedio || divisa.ultimoCierre || 0);
}

function renderizarResultados(resultados, valorCOP) {
  const encabezado = document.createElement("h2");
  encabezado.className = "h5 mb-3";
  encabezado.textContent = `Resultados para ${formatoMoneda(valorCOP, "es-CO", "COP")}`;

  const lista = document.createElement("div");
  lista.className = "list-group";

  resultados.forEach((item) => {
    const elemento = document.createElement("div");
    elemento.className = "list-group-item";

    elemento.innerHTML = `
      <div class="d-flex w-100 justify-content-between align-items-start gap-3">
        <div>
          <h3 class="h6 mb-1">${item.nombre}</h3>
          <p class="mb-1 text-muted small">Tasa usada: ${formatoNumero(item.tasa)}</p>
          <p class="mb-0 text-muted small">Actualización: ${item.fecha}</p>
        </div>
        <span class="badge text-bg-primary fs-6">${formatoMoneda(item.conversion, "en-US", "USD")}</span>
      </div>
    `;

    lista.appendChild(elemento);
  });

  resultadoContenedor.append(encabezado, lista);
}

function formatoMoneda(valor, locale, moneda) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: moneda,
    maximumFractionDigits: 2,
  }).format(valor);
}

function formatoNumero(valor) {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

function mostrarEstado(mensaje, clase) {
  estado.className = `small mt-3 ${clase}`;
  estado.textContent = mensaje;
}

async function consultar() {
  const endpoint = "https://co.dolarapi.com/v1/cotizaciones";
  const resultado = await fetch(endpoint);

  if (!resultado.ok) {
    throw new Error(`Error HTTP ${resultado.status}`);
  }

  return resultado.json();
}
