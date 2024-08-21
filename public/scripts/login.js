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
          $('#login-error').css('opacity', '1');
          return;
      }
      loginUser(email, password);
  });
});