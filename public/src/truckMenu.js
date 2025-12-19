$(document).ready(function () {
  var token = localStorage.getItem('sessionToken');
  if (!token) {
    window.location.href = '/';
    return;
  }

  var pathParts = window.location.pathname.split('/');
  var truckId = pathParts[pathParts.length - 1];
  var allMenuItems = [];
  var categories = new Set();

  loadMenu();
  updateCartCount();

  $('#logoutLink').on('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('loggedInUser');
    window.location.href = '/';
  });

  $('#categoryFilter').on('click', 'a', function (e) {
    e.preventDefault();
    $('#categoryFilter a').removeClass('active');
    $(this).addClass('active');
    var category = $(this).data('category');
    filterByCategory(category);
  });

  function loadMenu() {
    $.ajax({
      url: '/api/v1/menuItem/truck/' + truckId,
      method: 'GET',
      success: function (items) {
        $('#loadingMsg').hide();
        allMenuItems = items;
        buildCategoryFilter(items);
        renderMenu(items);
      },
      error: function (xhr) {
        $('#loadingMsg').hide();
        var message = 'Failed to load menu';
        if (xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $('#errorMsg').text(message).show();
      }
    });
  }

  function buildCategoryFilter(items) {
    categories.clear();
    items.forEach(function (item) {
      if (item.category) {
        categories.add(item.category);
      }
    });

    var filterContainer = $('#categoryFilter');
    categories.forEach(function (cat) {
      filterContainer.append('<a href="#" class="list-group-item" data-category="' + cat + '">' + cat + '</a>');
    });
  }

  function filterByCategory(category) {
    if (category === 'all') {
      renderMenu(allMenuItems);
    } else {
      var filtered = allMenuItems.filter(function (item) {
        return item.category === category;
      });
      renderMenu(filtered);
    }
  }

  function renderMenu(items) {
    var container = $('#menuContainer');
    container.empty();

    if (items.length === 0) {
      container.html('<div class="col-xs-12"><p class="text-muted">No menu items available.</p></div>');
      return;
    }

    items.forEach(function (item) {
      var card = `
        <div class="col-sm-6 col-md-4">
          <div class="panel panel-default menu-item-card">
            <div class="panel-body">
              <h4>${item.name}</h4>
              <p class="text-muted">${item.description || 'No description'}</p>
              <p><strong>Category:</strong> ${item.category}</p>
              <p class="text-primary" style="font-size:18px;"><strong>EGP ${parseFloat(item.price).toFixed(2)}</strong></p>
              <div class="input-group">
                <span class="input-group-btn">
                  <button class="btn btn-default btn-qty-minus" type="button" data-item-id="${item.itemId}">-</button>
                </span>
                <input type="number" class="form-control text-center qty-input" id="qty-${item.itemId}" value="1" min="1" max="10">
                <span class="input-group-btn">
                  <button class="btn btn-default btn-qty-plus" type="button" data-item-id="${item.itemId}">+</button>
                </span>
              </div>
              <button class="btn btn-success btn-block btn-add-cart" style="margin-top:10px;" 
                data-item-id="${item.itemId}" data-item-price="${item.price}">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
      container.append(card);
    });

    $('.btn-qty-minus').on('click', function () {
      var itemId = $(this).data('item-id');
      var input = $('#qty-' + itemId);
      var val = parseInt(input.val()) || 1;
      if (val > 1) {
        input.val(val - 1);
      }
    });

    $('.btn-qty-plus').on('click', function () {
      var itemId = $(this).data('item-id');
      var input = $('#qty-' + itemId);
      var val = parseInt(input.val()) || 1;
      if (val < 10) {
        input.val(val + 1);
      }
    });

    $('.btn-add-cart').on('click', function () {
      var btn = $(this);
      var itemId = btn.data('item-id');
      var price = btn.data('item-price');
      var quantity = parseInt($('#qty-' + itemId).val()) || 1;
      addToCart(itemId, quantity, price);
    });
  }

  function addToCart(itemId, quantity, price) {
    $('#errorMsg').hide();
    $('#successMsg').hide();

    $.ajax({
      url: '/api/v1/cart/new',
      method: 'POST',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + token },
      data: JSON.stringify({ itemId: itemId, quantity: quantity, price: price }),
      success: function (data) {
        $('#successMsg').text('Item added to cart!').show();
        updateCartCount();
        setTimeout(function () {
          $('#successMsg').fadeOut();
        }, 2000);
      },
      error: function (xhr) {
        var message = 'Failed to add item to cart';
        if (xhr.responseJSON && xhr.responseJSON.message) {
          message = xhr.responseJSON.message;
        } else if (xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $('#errorMsg').text(message).show();
      }
    });
  }

  function updateCartCount() {
    $.ajax({
      url: '/api/v1/cart/view',
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function (cartItems) {
        var count = 0;
        cartItems.forEach(function (item) {
          count += item.quantity;
        });
        $('#cartCount').text(count);
      },
      error: function () {
        $('#cartCount').text('0');
      }
    });
  }
});
