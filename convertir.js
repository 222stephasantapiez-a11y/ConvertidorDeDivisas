async function convertir(){
    let parrafo = document.getElementById("resultado")
    let valor = document.getElementById("valor").value
    const arrayDivisas = await consultar()
    arrayDivisas.map(
        divisa => {
            let conversion = valor / divisa.ultimoCierre 
            parrafo.append(conversion)
        }

    )

}




async function consultar(){
    const endpoint = "https://co.dolarapi.com/v1/cotizaciones"
    const resultado = await fetch(endpoint)
    return resultado.json()
   
}

// como tarea pulir con boostrap completar bepch que es placticar con apis