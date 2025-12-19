$(document).ready(function () {
  var token = localStorage.getItem('sessionToken');
  if (!token) {
    window.location.href = '/';
    return;
  }

  updateCartCount();

  $('#logoutLink').on('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('loggedInUser');
    window.location.href = '/';
  });

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
