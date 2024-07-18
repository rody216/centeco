let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCart = document.querySelector('.icon-cart');
let iconCartSpan = document.querySelector('.icon-cart span');
let body = document.querySelector('body');
let closeCart = document.querySelector('.close');
let products = [];
let cart = [];

iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});

closeCart.addEventListener('click', () => {
    body.classList.remove('showCart');
});

const addDataToHTML = () => {
    listProductHTML.innerHTML = ''; // Limpiar productos existentes antes de agregar nuevos

    if (products.length > 0) {
        products.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.dataset.id = product.id;
            newProduct.classList.add('item');
            newProduct.innerHTML =
                `<img src="${product.image}" alt="">
                <h2>${product.name}</h2>
                <div class="price">$${product.price}</div>
                <button class="addCart">Add To Cart</button>`;
            listProductHTML.appendChild(newProduct);
        });
    }
}

listProductHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('addCart')) {
        let id_product = positionClick.parentElement.dataset.id;
        addToCart(id_product);
    }
});

const addToCart = (product_id) => {
    let positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id);
    if (cart.length <= 0) {
        cart.push({
            product_id: product_id,
            quantity: 1
        });
    } else if (positionThisProductInCart < 0) {
        cart.push({
            product_id: product_id,
            quantity: 1
        });
    } else {
        cart[positionThisProductInCart].quantity++;
    }
    addCartToHTML();
    addCartToMemory();
}

const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
}

const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;

    if (cart.length > 0) {
        cart.forEach(item => {
            totalQuantity += item.quantity;
            let positionProduct = products.findIndex((value) => value.id == item.product_id);
            let info = products[positionProduct];

            let newItem = document.createElement('div');
            newItem.classList.add('item');
            newItem.dataset.id = item.product_id;
            newItem.innerHTML = `
                <div class="image">
                    <img src="${info.image}">
                </div>
                <div class="name">${info.name}</div>
                <div class="totalPrice">$${info.price * item.quantity}</div>
                <div class="quantity">
                    <span class="minus">-</span>
                    <span>${item.quantity}</span>
                    <span class="plus">+</span>
                </div>`;
            listCartHTML.appendChild(newItem);
        });
    }

    iconCartSpan.innerText = totalQuantity;
    updateTotals();
}

const updateTotals = () => {
    let subtotal = cart.reduce((acc, item) => {
        let product = products.find(p => p.id == item.product_id);
        return acc + (product.price * item.quantity);
    }, 0);

    const shipping = cart.length > 0 ? 10 : 0; // Envío fijo si hay productos en el carrito
    const total = subtotal + shipping;

    document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById("shipping").textContent = `$${shipping.toFixed(2)}`;
    document.getElementById("total").textContent = `$${total.toFixed(2)}`;

    // Actualizar los campos ocultos del formulario de checkout
    document.getElementById("hiddenSubtotal").value = subtotal.toFixed(2);
    document.getElementById("hiddenShipping").value = shipping.toFixed(2);
    document.getElementById("hiddenTotal").value = total.toFixed(2);
}

document.getElementById('checkoutForm').addEventListener('submit', function(event) {
    if (cart.length === 0) {
        event.preventDefault(); // Evita la redirección
        document.getElementById('emptyCartModal').style.display = 'block'; // Muestra el modal de carrito vacío
    } else {
        // Si hay productos en el carrito, continuar con la redirección
        const subtotal = document.getElementById("hiddenSubtotal").value;
        const shipping = document.getElementById("hiddenShipping").value;
        const total = document.getElementById("hiddenTotal").value;

        // Redirigir a la página de checkout con los parámetros en la URL
        event.preventDefault(); // Evitar el envío del formulario
        window.location.href = `../it_checkout.html?subtotal=${subtotal}&shipping=${shipping}&total=${total}`;
    }
});


document.querySelector('.close-modal').addEventListener('click', function() {
    document.getElementById('emptyCartModal').style.display = 'none'; // Oculta el modal de carrito vacío
});

// Cierra el modal si el usuario hace clic fuera de su contenido
window.addEventListener('click', function(event) {
    let modal = document.getElementById('emptyCartModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

// Evento para cambiar la cantidad de productos en el carrito
listCartHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('minus') || positionClick.classList.contains('plus')) {
        let product_id = positionClick.parentElement.parentElement.dataset.id;
        let type = 'minus';
        if (positionClick.classList.contains('plus')) {
            type = 'plus';
        }
        changeQuantityCart(product_id, type);
    }
});

const changeQuantityCart = (product_id, type) => {
    let positionItemInCart = cart.findIndex((value) => value.product_id == product_id);
    if (positionItemInCart >= 0) {
        switch (type) {
            case 'plus':
                cart[positionItemInCart].quantity += 1;
                break;
            default:
                let changeQuantity = cart[positionItemInCart].quantity - 1;
                if (changeQuantity > 0) {
                    cart[positionItemInCart].quantity = changeQuantity;
                } else {
                    cart.splice(positionItemInCart, 1);
                }
                break;
        }
    }
    addCartToHTML();
    addCartToMemory();
    updateTotals();
}

// Inicializar la aplicación al cargar la página
const initApp = () => {
    // Obtener datos de productos desde JSON
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            addDataToHTML();

            // Obtener datos del carrito desde localStorage
            if (localStorage.getItem('cart')) {
                cart = JSON.parse(localStorage.getItem('cart'));
                addCartToHTML();
            }
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
}

initApp();
