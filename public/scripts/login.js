$(document).ready(function() {
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar email en tiempo real
  $('#email').on('input', function() {
    const email = $(this).val().trim();
    if (!validateEmail(email)) {
        $('#email-error').css('display','block');
        $('#email').css('margin-bottom','0');
    } else {
        $('#email-error').css('display','none');
        $('#email').css('margin-bottom','1rem');
    }
  });

  $('#loginForm').on('submit', function(event) {
      event.preventDefault(); // Prevenir el envío del formulario por defecto

      // Obtener los valores del formulario
      const email = $('#email').val().trim();
      const password = $('#password').val().trim();

      // Validar que los campos no estén vacíos
      if (!email || !password) {
          $('#login-error').text('Por favor, ingrese su correo electrónico y contraseña').show();
          return;
      }

      // Enviar la solicitud POST al servidor
      $.ajax({
          url: '/api/auth/login',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ email: email, password: password }),
          success: function(response) {
            // Guardar el token JWT en localStorage o sessionStorage
            localStorage.setItem('authToken', response.token);
            // Redirigir al usuario a la página de inicio o al dashboard
            window.location.href = '/biblia/1/1'; // O la ruta correspondiente
          },
          error: function(xhr) {
            // Manejar errores y mostrar mensaje al usuario
            if (xhr.status === 401) {
                $('#login-error').text('Correo electrónico o contraseña incorrectos').show();
            } else {
                $('#login-error').text('Hubo un problema al iniciar sesión. Por favor, intenta de nuevo.').show();
            }
          }
      });
  });
});