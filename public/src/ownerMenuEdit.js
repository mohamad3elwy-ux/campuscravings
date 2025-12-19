$(document).ready(function () {
  var token = localStorage.getItem('sessionToken');
  var user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

  if (!token || user.role !== 'truckOwner') {
    window.location.href = '/';
    return;
  }

  var pathParts = window.location.pathname.split('/');
  var itemId = pathParts[pathParts.length - 1];

  loadMenuItem();

  $('#logoutLink').on('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('loggedInUser');
    window.location.href = '/';
  });

  $('#editItemForm').on('submit', function (e) {
    e.preventDefault();
    updateMenuItem();
  });

  function loadMenuItem() {
    $.ajax({
      url: '/api/v1/menuItem/view/' + itemId,
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function (item) {
        $('#loadingMsg').hide();
        $('#editFormContainer').show();
        $('#name').val(item.name);
        $('#description').val(item.description || '');
        $('#price').val(item.price);
        $('#category').val(item.category);
      },
      error: function (xhr) {
        $('#loadingMsg').hide();
        var message = 'Failed to load menu item';
        if (xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $('#errorMsg').text(message).show();
      }
    });
  }

  function updateMenuItem() {
    var name = $('#name').val();
    var description = $('#description').val();
    var price = parseFloat($('#price').val());
    var category = $('#category').val();

    $('#errorMsg').hide();
    $('#successMsg').hide();

    $.ajax({
      url: '/api/v1/menuItem/edit/' + itemId,
      method: 'PUT',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + token },
      data: JSON.stringify({
        name: name,
        description: description,
        price: price,
        category: category
      }),
      success: function () {
        $('#successMsg').text('Menu item updated successfully! Redirecting...').show();
        setTimeout(function () {
          window.location.href = '/owner/menu';
        }, 1500);
      },
      error: function (xhr) {
        var message = 'Failed to update menu item';
        if (xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $('#errorMsg').text(message).show();
      }
    });
  }
});
