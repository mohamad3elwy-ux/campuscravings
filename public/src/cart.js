$(document).ready(function () {
  var token = localStorage.getItem('sessionToken');
  if (!token) {
    window.location.href = '/';
    return;
  }

  loadCart();

  $('#logoutLink').on('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('loggedInUser');
    window.location.href = '/';
  });

  $('#checkoutForm').on('submit', function (e) {
    e.preventDefault();
    placeOrder();
  });

  function loadCart() {
    $.ajax({
      url: '/api/v1/cart/view',
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function (cartItems) {
        $('#loadingMsg').hide();
        if (cartItems.length === 0) {
          $('#emptyCartMsg').show();
          $('#cartContent').hide();
        } else {
          renderCart(cartItems);
          $('#cartContent').show();
        }
        updateCartCount(cartItems);
      },
      error: function (xhr) {
        $('#loadingMsg').hide();
        var message = 'Failed to load cart';
        if (xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $('#errorMsg').text(message).show();
      }
    });
  }

  function renderCart(cartItems) {
    var tbody = $('#cartTableBody');
    tbody.empty();

    var total = 0;

    cartItems.forEach(function (item) {
      var subtotal = parseFloat(item.price) * item.quantity;
      total += subtotal;

      var row = `
        <tr data-cart-id="${item.cartId}">
          <td>${item.itemName}</td>
          <td>EGP ${parseFloat(item.price).toFixed(2)}</td>
          <td>
            <div class="input-group input-group-sm" style="width:120px;">
              <span class="input-group-btn">
                <button class="btn btn-default btn-qty-minus" type="button" data-cart-id="${item.cartId}">-</button>
              </span>
              <input type="number" class="form-control text-center qty-input" id="qty-${item.cartId}" value="${item.quantity}" min="1" max="10">
              <span class="input-group-btn">
                <button class="btn btn-default btn-qty-plus" type="button" data-cart-id="${item.cartId}">+</button>
              </span>
            </div>
          </td>
          <td>EGP ${subtotal.toFixed(2)}</td>
          <td>
            <button class="btn btn-danger btn-sm btn-remove" data-cart-id="${item.cartId}">Remove</button>
          </td>
        </tr>
      `;
      tbody.append(row);
    });

    $('#cartTotal').text('EGP ' + total.toFixed(2));

    $('.btn-qty-minus').on('click', function () {
      var cartId = $(this).data('cart-id');
      var input = $('#qty-' + cartId);
      var val = parseInt(input.val()) || 1;
      if (val > 1) {
        updateCartItem(cartId, val - 1);
      }
    });

    $('.btn-qty-plus').on('click', function () {
      var cartId = $(this).data('cart-id');
      var input = $('#qty-' + cartId);
      var val = parseInt(input.val()) || 1;
      if (val < 10) {
        updateCartItem(cartId, val + 1);
      }
    });

    $('.btn-remove').on('click', function () {
      var cartId = $(this).data('cart-id');
      removeCartItem(cartId);
    });
  }

  function updateCartItem(cartId, quantity) {
    $.ajax({
      url: '/api/v1/cart/edit/' + cartId,
      method: 'PUT',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + token },
      data: JSON.stringify({ quantity: quantity }),
      success: function () {
        loadCart();
      },
      error: function (xhr) {
        var message = 'Failed to update cart';
        if (xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $('#errorMsg').text(message).show();
      }
    });
  }

  function removeCartItem(cartId) {
    $.ajax({
      url: '/api/v1/cart/delete/' + cartId,
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function () {
        loadCart();
      },
      error: function (xhr) {
        var message = 'Failed to remove item';
        if (xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $('#errorMsg').text(message).show();
      }
    });
  }

  function placeOrder() {
    var scheduledPickupTime = $('#scheduledPickupTime').val() || null;

    $('#errorMsg').hide();
    $('#successMsg').hide();

    $.ajax({
      url: '/api/v1/order/new',
      method: 'POST',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + token },
      data: JSON.stringify({ scheduledPickupTime: scheduledPickupTime }),
      success: function (data) {
        $('#successMsg').text('Order placed successfully! Redirecting to orders...').show();
        setTimeout(function () {
          window.location.href = '/customer/orders';
        }, 2000);
      },
      error: function (xhr) {
        var message = 'Failed to place order';
        if (xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $('#errorMsg').text(message).show();
      }
    });
  }

  function updateCartCount(cartItems) {
    var count = 0;
    if (cartItems) {
      cartItems.forEach(function (item) {
        count += item.quantity;
      });
    }
    $('#cartCount').text(count);
  }
});
