$(document).ready(function () {
  $('#registerForm').on('submit', function (e) {
    e.preventDefault();

    var name = $('#name').val();
    var email = $('#email').val();
    var password = $('#password').val();
    var birthDate = $('#birthDate').val();
    var role = $('#role').val();

    $('#registerError').hide().text('');
    $('#registerSuccess').hide().text('');

    $.ajax({
      url: '/api/v1/user',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        name: name,
        email: email,
        password: password,
        birthDate: birthDate || undefined,
        role: role
      }),
      success: function (data) {
        $('#registerSuccess').text('Registration successful. Redirecting to login...').show();
        setTimeout(function () {
          window.location.href = '/';
        }, 1500);
      },
      error: function (xhr) {
        var message = 'Registration failed';
        if (xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $('#registerError').text(message).show();
      }
    });
  });
});
