$(document).ready(function () {
  var token = localStorage.getItem('sessionToken');
  var user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

  if (!token || user.role !== 'truckOwner') {
    window.location.href = '/';
    return;
  }

  loadMenuItems();

  $('#logoutLink').on('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('loggedInUser');
    window.location.href = '/';
  });

  function loadMenuItems() {
    $.ajax({
      url: '/api/v1/menuItem/view',
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function (items) {
        $('#loadingMsg').hide();
        if (items.length === 0) {
          $('#noItemsMsg').show();
        } else {
          renderMenuItems(items);
        }
      },
      error: function (xhr) {
        $('#loadingMsg').hide();
        var message = 'Failed to load menu items';
        if (xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $('#errorMsg').text(message).show();
      }
    });
  }

  function renderMenuItems(items) {
    var container = $('#menuContainer');
    container.empty();

    items.forEach(function (item) {
      var card = `
        <div class="col-sm-6 col-md-4">
          <div class="panel panel-default">
            <div class="panel-body">
              <h4>${item.name}</h4>
              <p class="text-muted">${item.description || 'No description'}</p>
              <p><strong>Category:</strong> ${item.category}</p>
              <p class="text-primary" style="font-size:18px;"><strong>EGP ${parseFloat(item.price).toFixed(2)}</strong></p>
              <a href="/owner/menu/edit/${item.itemId}" class="btn btn-warning btn-sm">Edit</a>
              <button class="btn btn-danger btn-sm btn-delete" data-item-id="${item.itemId}">Delete</button>
            </div>
          </div>
        </div>
      `;
      container.append(card);
    });

    $('.btn-delete').on('click', function () {
      var itemId = $(this).data('item-id');
      if (confirm('Are you sure you want to delete this item?')) {
        deleteItem(itemId);
      }
    });
  }

  function deleteItem(itemId) {
    $('#errorMsg').hide();
    $('#successMsg').hide();

    $.ajax({
      url: '/api/v1/menuItem/delete/' + itemId,
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function () {
        $('#successMsg').text('Item deleted successfully!').show();
        loadMenuItems();
      },
      error: function (xhr) {
        var message = 'Failed to delete item';
        if (xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $('#errorMsg').text(message).show();
      }
    });
  }
});
