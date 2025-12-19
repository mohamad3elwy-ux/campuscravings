$(document).ready(function () {
  var token = localStorage.getItem('sessionToken');
  if (!token) {
    window.location.href = '/';
    return;
  }

  loadOrders();
  updateCartCount();

  $('#logoutLink').on('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('loggedInUser');
    window.location.href = '/';
  });

  function loadOrders() {
    $.ajax({
      url: '/api/v1/order/myOrders',
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function (orders) {
        $('#loadingMsg').hide();
        if (orders.length === 0) {
          $('#noOrdersMsg').show();
        } else {
          renderOrders(orders);
        }
      },
      error: function (xhr) {
        $('#loadingMsg').hide();
        var message = 'Failed to load orders';
        if (xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $('#errorMsg').text(message).show();
      }
    });
  }

  function renderOrders(orders) {
    var container = $('#ordersContainer');
    container.empty();

    orders.forEach(function (order) {
      var statusClass = getStatusClass(order.orderStatus);
      var createdAt = new Date(order.createdAt).toLocaleString();
      var pickupTime = order.scheduledPickupTime ? new Date(order.scheduledPickupTime).toLocaleString() : 'Not scheduled';

      var card = `
        <div class="panel panel-default">
          <div class="panel-heading">
            <strong>Order #${order.orderId}</strong> - ${order.truckName}
            <span class="label ${statusClass} pull-right">${order.orderStatus}</span>
          </div>
          <div class="panel-body">
            <p><strong>Total:</strong> EGP ${parseFloat(order.totalPrice).toFixed(2)}</p>
            <p><strong>Ordered:</strong> ${createdAt}</p>
            <p><strong>Pickup:</strong> ${pickupTime}</p>
            <button class="btn btn-info btn-sm btn-view-details" data-order-id="${order.orderId}">View Details</button>
          </div>
        </div>
      `;
      container.append(card);
    });

    $('.btn-view-details').on('click', function () {
      var orderId = $(this).data('order-id');
      loadOrderDetails(orderId);
    });
  }

  function getStatusClass(status) {
    switch (status.toLowerCase()) {
      case 'pending': return 'label-warning';
      case 'accepted': return 'label-info';
      case 'preparing': return 'label-primary';
      case 'ready': return 'label-success';
      case 'completed': return 'label-default';
      case 'cancelled': return 'label-danger';
      default: return 'label-default';
    }
  }

  function loadOrderDetails(orderId) {
    $.ajax({
      url: '/api/v1/order/details/' + orderId,
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function (order) {
        renderOrderDetails(order);
        $('#orderDetailsModal').modal('show');
      },
      error: function (xhr) {
        var message = 'Failed to load order details';
        if (xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $('#errorMsg').text(message).show();
      }
    });
  }

  function renderOrderDetails(order) {
    var content = $('#orderDetailsContent');
    var createdAt = new Date(order.createdAt).toLocaleString();
    var pickupTime = order.scheduledPickupTime ? new Date(order.scheduledPickupTime).toLocaleString() : 'Not scheduled';
    var statusClass = getStatusClass(order.orderStatus);

    var html = `
      <p><strong>Order #${order.orderId}</strong></p>
      <p><strong>Truck:</strong> ${order.truckName}</p>
      <p><strong>Status:</strong> <span class="label ${statusClass}">${order.orderStatus}</span></p>
      <p><strong>Total:</strong> EGP ${parseFloat(order.totalPrice).toFixed(2)}</p>
      <p><strong>Ordered:</strong> ${createdAt}</p>
      <p><strong>Pickup:</strong> ${pickupTime}</p>
      <hr>
      <h5>Items:</h5>
      <table class="table table-condensed">
        <thead>
          <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
        </thead>
        <tbody>
    `;

    order.items.forEach(function (item) {
      html += `<tr><td>${item.itemName}</td><td>${item.quantity}</td><td>EGP ${parseFloat(item.price).toFixed(2)}</td></tr>`;
    });

    html += '</tbody></table>';
    content.html(html);
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
