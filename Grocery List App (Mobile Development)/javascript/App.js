let openShopping = document.querySelector('.shopping');
let closeShopping = document.querySelector('.closeShopping');
let list = document.querySelector('.list');
let listCard = document.querySelector('.listCard');
let body = document.querySelector('body');
let total = document.querySelector('.total');
let quantityDisplay = document.querySelector('.quantity');
let addProductBtn = document.getElementById('addProductBtn');
let productModal = document.getElementById('productModal');
let closeModal = document.querySelector('.close');
let productForm = document.getElementById('productForm');
let editProductModal = document.getElementById('editProductModal');
let closeEditModal = document.getElementById('closeEditModal');
let editProductForm = document.getElementById('editProductForm');
let deleteProductBtn = document.getElementById('deleteProductBtn');
let products = JSON.parse(localStorage.getItem('products')) || [];
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || {};
let currentEditingProductId = null;

// Declare and initialize sort option variable
let currentSortOption = 'default'; // Default sorting option

// Get the search input element
let searchInput = document.getElementById('searchInput');

// Add event listener to the search input
searchInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase(); // Get the search term in lowercase
    filterProducts(searchTerm); // Call the filter function
});

// Open the cart when the shopping icon is clicked
openShopping.addEventListener('click', () => {
    body.classList.add('active');
});

// Close the cart when the close button is clicked
closeShopping.addEventListener('click', () => {
    body.classList.remove('active');
});

// Open the cart when the cart button in the navbar is clicked
document.getElementById('cartButton').addEventListener('click', () => {
    body.classList.toggle('active');
});

// Add product modal functionality
addProductBtn.addEventListener('click', () => {
    productModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    productModal.style.display = 'none';
});

// Close modal by clicking outside
window.addEventListener('click', (event) => {
    if (event.target === productModal) {
        productModal.style.display = 'none';
    }
    if (event.target === editProductModal) {
        editProductModal.style.display = 'none';
    }
});

// Close the edit modal when the close button is clicked
closeEditModal.addEventListener('click', () => {
    editProductModal.style.display = 'none'; // Hide the edit modal
});

// Product form submission
productForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Get the values from the form
    let productName = document.getElementById('productName').value;
    let brand = document.getElementById('brand').value;
    let price = parseFloat(document.getElementById('price').value);
    let category = document.getElementById('category').value; // Get category value
    let store = document.getElementById('store').value;
    let productImage = document.getElementById('productImage').files[0];

    // Create a new product object
    let newProduct = {
        id: products.length + 1,
        name: productName,
        brand: brand,
        price: price,
        category: category, // Assign category correctly
        store: store,
        image: '' // Initialize image as an empty string
    };

    // Convert image to Base64 if an image is provided
    if (productImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
            newProduct.image = reader.result; // Set the image property to the Base64 string
            products.push(newProduct); // Add the new product to the products array

            // Save products to localStorage
            localStorage.setItem('products', JSON.stringify(products));

            // Reload the product list
            list.innerHTML = ''; // Clear the current list
            initApp(); // Reinitialize the app to display the updated product list

            // Close the modal
            productModal.style.display = 'none';

            // Reset the form
            productForm.reset();
        };
        reader.readAsDataURL(productImage); // Read the image file as a data URL
    } else {
        // If no image is provided, still push the product
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        initApp();
        productModal.style.display = 'none';
        productForm.reset();
    }
});

// Initialize the app
function initApp() {
    // Clear the list before populating
    list.innerHTML = '';

    // Load products from localStorage
    products.forEach((value) => {
        let newDiv = document.createElement('div');
        newDiv.classList.add('item');
        newDiv.innerHTML = `
            <img src="${value.image}" alt="${value.name}">
            <iconify-icon icon="mdi:text-box-edit" id="edit" onclick="openEditModal(${value.id})"></iconify-icon>
            <div class="title">${value.name}</div>
            <div class="price">₱${value.price.toLocaleString()}</div>
            <button onclick="addToCart(${value.id})">Add To List</button>`;
        list.appendChild(newDiv);
    });

    updateCart(); // Update the cart display on initialization
    updateQuantityDisplay(); // Ensure quantity display is updated on initialization

    // Highlight the "All" category by default
    const allCategory = [...document.querySelectorAll('.category')].find(cat => cat.textContent.trim().toLowerCase() === 'all');
    if (allCategory) {
        allCategory.classList.add('active-category'); // Add active class to "All"
    }
}

// Edit product modal functionality
function openEditModal(id) {
    currentEditingProductId = id;
    let productToEdit = products.find(product => product.id === id);
    if (productToEdit) {
        document.getElementById('editProductName').value = productToEdit.name;
        document.getElementById('editBrand').value = productToEdit.brand;
        document.getElementById('editPrice').value = productToEdit.price;
        document.getElementById('editCategory').value = productToEdit.category;
        document.getElementById('editStore').value = productToEdit.store;
        editProductModal.style.display = 'block';
    }
}

// Edit product form submission
editProductForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let updatedProductName = document.getElementById('editProductName').value;
    let updatedBrand = document.getElementById('editBrand').value;
    let updatedPrice = parseFloat(document.getElementById('editPrice').value);
    let updatedCategory = document.getElementById('editCategory').value;
    let updatedStore = document.getElementById('editStore').value;
    let updatedProductImage = document.getElementById('editProductImage').files[0];

    let productToUpdate = products.find(p => p.id === currentEditingProductId);
    if (productToUpdate) {
        productToUpdate.name = updatedProductName;
        productToUpdate.brand = updatedBrand;
        productToUpdate.price = updatedPrice;
        productToUpdate.category = updatedCategory;
        productToUpdate.store = updatedStore;

        if (updatedProductImage) {
            const reader = new FileReader();
            reader.onloadend = () => {
                productToUpdate.image = reader.result;
                saveAndUpdateProducts();
            };
            reader.readAsDataURL(updatedProductImage);
        } else {
            saveAndUpdateProducts();
        }
    }
});

function saveAndUpdateProducts() {
    // Save updated products to localStorage
    localStorage.setItem('products', JSON.stringify(products));

    // Update cart items if the product exists in the cart
    if (cartItems[currentEditingProductId]) {
        cartItems[currentEditingProductId].name = products.find(p => p.id === currentEditingProductId).name;
        cartItems[currentEditingProductId].brand = products.find(p => p.id === currentEditingProductId).brand;
        cartItems[currentEditingProductId].price = products.find(p => p.id === currentEditingProductId).price;
        cartItems[currentEditingProductId].category = products.find(p => p.id === currentEditingProductId).category;
        cartItems[currentEditingProductId].store = products.find(p => p.id === currentEditingProductId).store;
        cartItems[currentEditingProductId].image = products.find(p => p.id === currentEditingProductId).image;
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }

    initApp(); // Reinitialize the app to reflect changes
    editProductModal.style.display = 'none'; // Close the modal
}

// Delete product functionality
deleteProductBtn.addEventListener('click', () => {
    if (currentEditingProductId !== null) {
        // Remove the product from the products array
        products = products.filter(product => product.id !== currentEditingProductId);

        // Remove the product from the cart if it's there
        if (cartItems[currentEditingProductId]) {
            delete cartItems[currentEditingProductId];
            updateQuantityDisplay(); // Update quantity display
        }

        // Save changes to localStorage
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('cartItems', JSON.stringify(cartItems));

        // Reinitialize the app to update the display
        initApp();
        editProductModal.style.display = 'none';
    }
});

initApp(); // Call initApp to load products on page load

function addToCart(id) {
    // Find the product by id
    let product = products.find(p => p.id === id);
    if (product) {
        // Check if the product is already in the cart
        if (!cartItems[product.id]) {
            // If not in cart, add it and update quantity display
            cartItems[product.id] = {
                ...product,
                quantity: 1, // Add new product with quantity 1
                checked: false // Initialize checkbox state
            };
        } else {
            // If already in cart, increment the quantity
            cartItems[product.id].quantity += 1;
        }

        // Save cart items to localStorage
        localStorage.setItem('cartItems', JSON.stringify(cartItems));

        updateCart(); // Update the cart display
        updateQuantityDisplay(); // Update the quantity display
    }
}

function updateQuantityDisplay() {
    // Count unique items in the cart
    const totalQuantity = Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);
    quantityDisplay.textContent = totalQuantity; // Update the quantity display
}

function toggleItem(checkbox, itemId) {
    const cartItem = checkbox.closest('.cart-item');
    const quantityButtons = cartItem.querySelectorAll('.quantity-btn');
    const title = cartItem.querySelector('.cart-title');
    const price = cartItem.querySelector('.cart-price');
    const store = cartItem.querySelector('.cart-store');

    // Update the checked state in cartItems
    cartItems[itemId].checked = checkbox.checked;

    if (checkbox.checked) {
        title.style.textDecoration = 'line-through';
        title.style.color = 'lightgray';
        price.style.textDecoration = 'line-through';
        price.style.color = 'lightgray';
        store.style.textDecoration = 'line-through';
        store.style.color = 'lightgray';
        quantityButtons.forEach(btn => btn.disabled = true);
    } else {
        title.style.textDecoration = 'none';
        title.style.color = '';
        price.style.textDecoration = 'none';
        price.style.color = '';
        store.style.textDecoration = 'none';
        store.style.color = '';
        quantityButtons.forEach(btn => btn.disabled = false);
    }

    // Save updated cart items to localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

function updateCart() {
    listCard.innerHTML = ''; // Clear current cart display
    let totalAmount = 0; // Initialize total amount

    // Sort the cart items based on the current sort option
    const sortedCartItems = Object.values(cartItems).sort((a, b) => {
        if (currentSortOption === 'store') {
            return a.store.localeCompare(b.store);
        } else if (currentSortOption === 'price') {
            return a.price - b.price;
        } else {
            return a.name.localeCompare(b.name); // Default sorting by name
        }
    });

    // Populate the cart list and calculate total
    sortedCartItems.forEach(item => {
        totalAmount += item.price * item.quantity; // Calculate total amount

        let cartItem = document.createElement('li');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <input type="checkbox" class="toggle-checkbox" onchange="toggleItem(this, ${item.id})" ${item.checked ? 'checked' : ''}>
            <div class="cart-title" ${item.checked ? 'style="text-decoration: line-through; color: lightgray;"' : ''}>${item.name}</div>
            <div class="cart-price" ${item.checked ? 'style="text-decoration: line-through; color: lightgray;"' : ''}>₱${item.price.toLocaleString()}</div>
            <div class="cart-store" ${item.checked ? 'style="text-decoration: line-through; color: lightgray;"' : ''}>${item.store}</div>
            <div>
                <button onclick="changeQuantity(${item.id}, -1)" class="quantity-btn" style="margin: 0 8px 0 12px;">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${item.id}, 1)" class="quantity-btn" style="margin-left: 8px;">+</button>
            </div>
        `;
        listCard.appendChild(cartItem); // Add the new item to the cart list
    });

    total.textContent = `₱${totalAmount.toLocaleString()}`; // Update total amount display with ₱ sign
}

// Function to handle quantity change
function changeQuantity(id, delta) {
    if (cartItems[id]) {
        cartItems[id].quantity += delta; // Change the quantity

        // Remove item if quantity is 0
        if (cartItems[id].quantity <= 0) {
            delete cartItems[id];
        }

        // Save updated cart items to localStorage
        localStorage.setItem('cartItems', JSON.stringify(cartItems));

        updateCart(); // Update the cart display
        updateQuantityDisplay(); // Update quantity display when item is removed or added
    }
}

// Function to sort items in the cart
function sortCartItems(option) {
    currentSortOption = option;
    updateCart();
}

// Example of how you might set up event listeners for your sort options
document.getElementById('sortOptions').addEventListener('change', (event) => {
    sortCartItems(event.target.value);
});

// Add the filterByCategory function
function filterByCategory(category) {
    // Clear the current list
    list.innerHTML = '';

    // Load products from localStorage
    if (category === 'all') {
        // If 'all' is selected, show all products
        products.forEach((value) => {
            let newDiv = document.createElement('div');
            newDiv.classList.add('item');
            newDiv.innerHTML = `
                <img src="${value.image}" alt="${value.name}">
                <iconify-icon icon="mdi:text-box-edit" id="edit" onclick="openEditModal(${value.id})"></iconify-icon>
                <div class="title">${value.name}</div>
                <div class="price">₱${value.price.toLocaleString()}</div>
                <button onclick="addToCart(${value.id})">Add To List</button>`;
            list.appendChild(newDiv);
        });
    } else {
        // Filter products by the selected category
        products.forEach((value) => {
            if (value.category === category) {
                let newDiv = document.createElement('div');
                newDiv.classList.add('item');
                newDiv.innerHTML = `
                    <img src="${value.image}" alt="${value.name}">
                    <iconify-icon icon="mdi:text-box-edit" id="edit" onclick="openEditModal(${value.id})"></iconify-icon>
                    <div class="title">${value.name}</div>
                    <div class="price">₱${value.price.toLocaleString()}</div>
                    <button onclick="addToCart(${value.id})">Add To List</button>`;
                list.appendChild(newDiv);
            }
        });
    }

    // Remove the active class from all categories
    const categories = document.querySelectorAll('.category');
    categories.forEach(cat => cat.classList.remove('active-category'));

    // Add the active class to the clicked category
    const activeCategory = [...categories].find(cat => cat.textContent.trim().toLowerCase() === category);
    if (activeCategory) {
        activeCategory.classList.add('active-category');
    }

    updateCart(); // Update the cart display after filtering
}

// Function to filter products based on name or price
function filterProducts(searchTerm) {
    // Clear the current list
    list.innerHTML = '';

    // Load products from localStorage
    products.forEach((value) => {
        // Check if the product name or price matches the search term
        if (value.name.toLowerCase().includes(searchTerm) || value.price.toString().includes(searchTerm)) {
            let newDiv = document.createElement('div');
            newDiv.classList.add('item');
            newDiv.innerHTML = `
                <img src="${value.image}" alt="${value.name}">
                <iconify-icon icon="mdi:text-box-edit" id="edit" onclick="openEditModal(${value.id})"></iconify-icon>
                <div class="title">${value.name}</div>
                <div class="price">₱${value.price.toLocaleString()}</div>
                <button onclick="addToCart(${value.id})">Add To List</button>`;
            list.appendChild(newDiv);
        }
    });
}

// Add event listener for "Remove All" button
document.getElementById('removeAllBtn').addEventListener('click', () => {
    // Clear all items in the cart
    cartItems = {}; // Reset cartItems
    localStorage.removeItem('cartItems'); // Remove from localStorage
    updateCart(); // Refresh the cart display
    updateQuantityDisplay(); // Update quantity display
});