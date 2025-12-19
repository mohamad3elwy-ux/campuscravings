$(document).ready(function () {
  $('#loginForm').on('submit', function (e) {
    e.preventDefault();

    var email = $('#email').val();
    var password = $('#password').val();

    $('#loginError').hide().text('');
    $('#loginSuccess').hide().text('');

    $.ajax({
      url: '/api/v1/user/login',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ email: email, password: password }),
      success: function (data) {
        localStorage.setItem('sessionToken', data.token);
        localStorage.setItem('loggedInUser', JSON.stringify(data.user));

        $('#loginSuccess').text('Login successful. Redirecting...').show();

        if (data.user.role === 'truckOwner') {
          window.location.href = '/owner/dashboard';
        } else {
          window.location.href = '/customer/home';
        }
      },
      error: function (xhr) {
        var message = 'Login failed';
        if (xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $('#loginError').text(message).show();
      }
    });
  });
});
