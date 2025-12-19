$(document).ready(function () {
  var token = localStorage.getItem('sessionToken');
  var user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

  if (!token || user.role !== 'truckOwner') {
    window.location.href = '/';
    return;
  }

  loadDashboard();

  $('#logoutLink').on('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('loggedInUser');
    window.location.href = '/';
  });

  $('#updateStatusBtn').on('click', function () {
    updateOrderStatus();
  });

  function loadDashboard() {
    $.ajax({
      url: '/api/v1/trucks/myTruck',
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function (truck) {
        $('#loadingMsg').hide();
        $('#dashboardContent').show();
        renderTruckInfo(truck);
        loadStats();
      },
      error: function (xhr) {
        $('#loadingMsg').hide();
        var message = 'Failed to load truck info';
        if (xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $('#errorMsg').text(message).show();
      }
    });
  }

  function renderTruckInfo(truck) {
    $('#truckName').text(truck.truckName);
    $('#truckStatus').text(truck.truckStatus).addClass(truck.truckStatus === 'available' ? 'label-success' : 'label-danger');
    $('#orderStatus').text(truck.orderStatus).addClass(truck.orderStatus === 'available' ? 'label-success' : 'label-warning');
    $('#orderStatusSelect').val(truck.orderStatus);
  }

  function loadStats() {
    $.ajax({
      url: '/api/v1/menuItem/view',
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function (items) {
        $('#menuCount').text(items.length);
      }
    });

    $.ajax({
      url: '/api/v1/order/truckOrders',
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function (orders) {
        var pending = orders.filter(function (o) {
          return o.orderStatus === 'pending' || o.orderStatus === 'accepted' || o.orderStatus === 'preparing';
        });
        $('#pendingOrders').text(pending.length);
      }
    });
  }

  function updateOrderStatus() {
    var newStatus = $('#orderStatusSelect').val();
    $('#errorMsg').hide();
    $('#successMsg').hide();

    $.ajax({
      url: '/api/v1/trucks/updateOrderStatus',
      method: 'PUT',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + token },
      data: JSON.stringify({ orderStatus: newStatus }),
      success: function () {
        $('#successMsg').text('Order status updated successfully!').show();
        $('#orderStatus').text(newStatus).removeClass('label-success label-warning').addClass(newStatus === 'available' ? 'label-success' : 'label-warning');
      },
      error: function (xhr) {
        var message = 'Failed to update status';
        if (xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $('#errorMsg').text(message).show();
      }
    });
  }
});
