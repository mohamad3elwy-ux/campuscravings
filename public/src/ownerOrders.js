$(document).ready(function () {
  var token = localStorage.getItem('sessionToken');
  var user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

  if (!token || user.role !== 'truckOwner') {
    window.location.href = '/';
    return;
  }

  loadOrders();

  $('#logoutLink').on('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('loggedInUser');
    window.location.href = '/';
  });

  function loadOrders() {
    $.ajax({
      url: '/api/v1/order/truckOrders',
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
            <strong>Order #${order.orderId}</strong> - ${order.customerName}
            <span class="label ${statusClass} pull-right">${order.orderStatus}</span>
          </div>
          <div class="panel-body">
            <div class="row">
              <div class="col-md-6">
                <p><strong>Total:</strong> EGP ${parseFloat(order.totalPrice).toFixed(2)}</p>
                <p><strong>Ordered:</strong> ${createdAt}</p>
                <p><strong>Pickup:</strong> ${pickupTime}</p>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label>Update Status:</label>
                  <select class="form-control status-select" data-order-id="${order.orderId}">
                    <option value="pending" ${order.orderStatus === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="accepted" ${order.orderStatus === 'accepted' ? 'selected' : ''}>Accepted</option>
                    <option value="preparing" ${order.orderStatus === 'preparing' ? 'selected' : ''}>Preparing</option>
                    <option value="ready" ${order.orderStatus === 'ready' ? 'selected' : ''}>Ready</option>
                    <option value="completed" ${order.orderStatus === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="cancelled" ${order.orderStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                  </select>
                </div>
                <button class="btn btn-primary btn-sm btn-update-status" data-order-id="${order.orderId}">Update</button>
                <button class="btn btn-info btn-sm btn-view-details" data-order-id="${order.orderId}">View Details</button>
              </div>
            </div>
          </div>
        </div>
      `;
      container.append(card);
    });

    $('.btn-update-status').on('click', function () {
      var orderId = $(this).data('order-id');
      var newStatus = $('.status-select[data-order-id="' + orderId + '"]').val();
      updateOrderStatus(orderId, newStatus);
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

  function updateOrderStatus(orderId, status) {
    $('#errorMsg').hide();
    $('#successMsg').hide();

    $.ajax({
      url: '/api/v1/order/updateStatus/' + orderId,
      method: 'PUT',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + token },
      data: JSON.stringify({ orderStatus: status }),
      success: function () {
        $('#successMsg').text('Order status updated!').show();
        loadOrders();
      },
      error: function (xhr) {
        var message = 'Failed to update order status';
        if (xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $('#errorMsg').text(message).show();
      }
    });
  }

  function loadOrderDetails(orderId) {
    $.ajax({
      url: '/api/v1/order/truckOwner/' + orderId,
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
});
