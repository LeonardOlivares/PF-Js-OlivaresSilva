fetch("../json/data.json")
    .then(resp => resp.json())
    .then(tiendita => {
        laTienditaDeLeo(tiendita)
    })
    .catch (() => {
        Swal.fire({
        title: '¡Lo sentimos!',
        text: 'No hemos podido conectarnos a la base de datos, intenta más tarde',
        icon: 'error',
        showConfirmButton: true,
    })})



function laTienditaDeLeo(productosTienda) {
    // Funciones del programa
    function Comprar() {
        Swal.fire({
            title: 'Excelente',
            text: 'Muchas gracias por su compra',
            icon: 'success',
            showConfirmButton: true,
        })
        localStorage.removeItem("carrito")
        carrito = []
        renderCarrito(carrito)
    }
    function vaciarCarro() {
        Swal.fire({
            title: '¿Estás seguro que quieres vaciar tu carrito?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Si, vaciarlo',
            denyButtonText: `No, mantener carrrito`,
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Carrito eliminado', '', 'success')
                localStorage.removeItem("carrito")
                carrito = []
                renderCarrito(carrito)
            } else if (result.isDenied) {
                Swal.fire('Tu carrito sigue intacto', '', 'info')
            }
        })
    }

    function renderizarCards(arrayProductos) {
        const contenedorCard = document.getElementById("contenedorCard")
        contenedorCard.innerHTML = ""
        arrayProductos.forEach(({ nombre, id, categoria, precio, stock, img }) => {
            let card = document.createElement("div")
            card.className = "card d-flex"
            card.innerHTML = `
        <h2 class=tituloCard>${nombre}</h2>
        <p>${categoria}</p>
        <div class=imagenCard style="background-image: url(${img})"></div>
        <h3>Valor: $${precio}</h3>
        <p><span id=span${id}>${stock}</span> unidades disponibles</p>
        <button class="btn btn-warning" id=${id}>AGREGAR AL CARRITO</button>
      `
            contenedorCard.append(card)

            let agregar = document.getElementById(id)
            agregar.addEventListener("click", agregarProdAlCarrito)
        })
    }

    function agregarProdAlCarrito(e) {
        let posProd = productosTienda.findIndex(producto => producto.id == e.target.id)
        let prodBuscado = productosTienda.find(producto => producto.id === Number(e.target.id))

        if (productosTienda[posProd].stock > 0) {
            toastyCarrito("agregado")
            let elementoSpan = document.getElementById("span" + e.target.id)
            productosTienda[posProd].stock--
            elementoSpan.innerHTML = productosTienda[posProd].stock

            if (carrito.some(({ id }) => id == prodBuscado.id)) {
                let pos = carrito.findIndex(producto => producto.id == prodBuscado.id)
                carrito[pos].unidades++
                carrito[pos].subtotal = carrito[pos].precio * carrito[pos].unidades

            } else {
                carrito.push({
                    img: prodBuscado.img,
                    id: prodBuscado.id,
                    nombre: prodBuscado.nombre,
                    precio: prodBuscado.precio,
                    unidades: 1,
                    subtotal: prodBuscado.precio
                })
            }
            localStorage.setItem("carrito", JSON.stringify(carrito))
            renderCarrito(carrito)
        } else {
            Swal.fire({
                title: '¡Lo Sentimos!',
                text: 'Producto sin stock',
                icon: 'error',
                showConfirmButton: false,
                timer: 3000,
            })
        }
    }

    function renderCarrito(arrayDeProductos) {
        carritoDOM.innerHTML = ""
        carritoDOM.innerHTML += `<h2 class="text-secondary p-3">Carrito de compras:</h2>`
        carritoDOM.innerHTML += `
            <table id="TablaCarrito" class="table table-hover table-striped table-bordered align-middle">
                <thead>
                <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Unidades</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody id="bodyTabla">
            </tbody>
            </table>
            `
        arrayDeProductos.forEach(({ nombre, precio, unidades, subtotal, img}) => {
            const tablaCarrito = document.getElementById("TablaCarrito")
            const row = document.createElement("tr")
            row.innerHTML += `
                <td class="text-center">
                    <img class="imagenCarrito border-0" style="background-image: url(${img})">
                </td>
                <td>${nombre}</td>
                <td>${precio}</td>
                <td class="text-center">${unidades}</td>
                <td>${subtotal}</td>       
            `
            tablaCarrito.appendChild(row)
    
        })
        
       /*  const accionBotones = () =>{
            let botonAgregar = document.getElementById("btnAdd")
            let botonEliminar = document.querySelector("btnDelete")

            botonAgregar.forEach(btn => {
                btn.addEventListener("click", ()=>{})
                console.log("...Agregando")
            })
            botonEliminar.forEach(btn => {
                btn.addEventListener("click", ()=>{})
                console.log("...Agregando")
            })
        } */

        //Calculadora de total del carrito
        const total = carrito.reduce((acc, elem) => acc + elem.subtotal, 0)
        carritoDOM.innerHTML += `
            <br>
            <button class="btn btn-warning m-3" id=comprar>Comprar mi Carrito</button>
            <button class="btn btn-warning m-3" id=vaciar>Vaciar mi Carrito</button>
            <span id="totalCarrito">Total carrito: $${total}</span>
            `

        let botonComprar = document.getElementById("comprar")
        botonComprar.addEventListener("click", Comprar)

        let botonVaciar = document.getElementById("vaciar")
        botonVaciar.addEventListener("click", vaciarCarro)

    }

    function filtrar() {
        let arrayFiltrado = productosTienda.filter(producto => producto.nombre.includes(motorBusqueda.value))
        renderizarCards(arrayFiltrado)
    }

    function mostrarCarrito() {
        let contenedorProductos = document.getElementById("contenedorProductos")
        carritoDOM.classList.toggle("ocultar")
        contenedorProductos.classList.toggle("ocultar")
    }

    function filtrarPorCategoria(e) {
        let filtros = []
        for (const input of switches) {
            if (input.checked) {
                filtros.push(input.id)
            }
        }
        let arrayFiltrado = productosTienda.filter(producto => filtros.includes(producto.categoria))
        renderizarCards(arrayFiltrado.length > 0 ? arrayFiltrado : productosTienda)
    }
    function toastyCarrito(accion) {
        Toastify({
            text: "Producto " + accion + " con éxito",
            duration: 2500,
            newWindow: true,
            close: false,
            gravity: "top", // `top` o `bottom`
            position: "right", // `left`, `center` o `right`
            stopOnFocus: true, // Parar el tiempo al colocar el puntero encima
            style: {
                background: "linear-gradient(222deg, rgba(255,204,0,1) 0%, rgba(253,113,45,1) 100%)",
            }
        }).showToast();
    }

    // Programa

    let carritoDOM = document.getElementById("carrito")

    renderizarCards(productosTienda)
    

    let carrito = JSON.parse(localStorage.getItem("carrito")) || []
    renderCarrito(carrito)

    let motorBusqueda = document.getElementById("motorBusqueda")
    motorBusqueda.addEventListener("input", filtrar)

    let botonCarrito = document.getElementById("btnVerCarrito")
    botonCarrito.addEventListener("click", mostrarCarrito)

    let switches = document.getElementsByClassName("form-check-input")
    for (const input of switches) {
        input.addEventListener("click", filtrarPorCategoria)
    }
}

