$(document).ready(function () {
  var token = localStorage.getItem('sessionToken');
  var user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

  if (!token || user.role !== 'truckOwner') {
    window.location.href = '/';
    return;
  }

  $('#logoutLink').on('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('loggedInUser');
    window.location.href = '/';
  });

  $('#addItemForm').on('submit', function (e) {
    e.preventDefault();
    addMenuItem();
  });

  function addMenuItem() {
    var name = $('#name').val();
    var description = $('#description').val();
    var price = parseFloat($('#price').val());
    var category = $('#category').val();

    $('#errorMsg').hide();
    $('#successMsg').hide();

    $.ajax({
      url: '/api/v1/menuItem/new',
      method: 'POST',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + token },
      data: JSON.stringify({
        name: name,
        description: description,
        price: price,
        category: category
      }),
      success: function () {
        $('#successMsg').text('Menu item added successfully! Redirecting...').show();
        setTimeout(function () {
          window.location.href = '/owner/menu';
        }, 1500);
      },
      error: function (xhr) {
        var message = 'Failed to add menu item';
        if (xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $('#errorMsg').text(message).show();
      }
    });
  }
});
