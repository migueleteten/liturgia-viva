$(document).ready(function() {
  function validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
  }

  function validatePassword(password) {
      const passwordRegex = /^(?=.*[0-9]).{7,}$/;
      return passwordRegex.test(password);
  }

  function validatePasswordsMatch(password, confirmPassword) {
      return password === confirmPassword;
  }

  // Validar email en tiempo real
  $('#email').on('input', function() {
      const email = $(this).val().trim();
      if (!validateEmail(email)) {
          $('#email-error').show();
          $('#email').css('margin-bottom','0');
      } else {
          $('#email-error').hide();
          $('#email').css('margin-bottom','1rem');
      }
  });

  // Validar contraseña en tiempo real
  $('#password').on('input', function() {
      const password = $(this).val();
      if (!validatePassword(password)) {
          $('#password-error').show();
          $('#password').css('margin-bottom','0');
      } else {
          $('#password-error').hide();
          $('#password').css('margin-bottom','1rem');
      }

      // Validar que las contraseñas coincidan
      const confirmPassword = $('#password-confirm').val();
      if (confirmPassword && !validatePasswordsMatch(password, confirmPassword)) {
          $('#password-confirm-error').show();
          $('#password-confirm').css('margin-bottom','0');
      } else {
          $('#password-confirm-error').hide();
          $('#password-confirm').css('margin-bottom','1rem');
      }
  });

  // Validar que las contraseñas coincidan en tiempo real
  $('#password-confirm').on('input', function() {
      const confirmPassword = $(this).val();
      const password = $('#password').val();
      if (!validatePasswordsMatch(password, confirmPassword)) {
          $('#password-confirm-error').show();
      } else {
          $('#password-confirm-error').hide();
      }
  });

  // Mostrar/Ocultar campos adicionales cuando se marca la casilla de "¿Gestionas un templo?"
  $('#temple-checkbox').on('change', function() {
      if ($(this).is(':checked')) {
          $('#parroquiaInfo').show();
      } else {
          $('#parroquiaInfo').hide();
      }
  });

  // Manejar el envío del formulario
  $('#registerForm').on('submit', function(event) {
      event.preventDefault();

      const email = $('#email').val().trim();
      const password = $('#password').val().trim();
      const confirmPassword = $('#password-confirm').val().trim();
      const gestionasTemplo = $('#temple-checkbox').is(':checked');

      // Validar email
      if (!validateEmail(email)) {
          alert('Por favor, introduce una dirección de correo válida.');
          return;
      }

      // Validar contraseña
      if (!validatePassword(password)) {
          alert('La contraseña debe tener más de 6 caracteres y, al menos uno de ellos, debe ser numérico.');
          return;
      }

      // Validar coincidencia de contraseñas
      if (!validatePasswordsMatch(password, confirmPassword)) {
          alert('Las contraseñas no coinciden.');
          return;
      }

      let registerUrl = '/api/auth/register/feligres'; // URL por defecto para feligreses
      let data = {
          email: email,
          password: password
      };

      if (gestionasTemplo) {
          registerUrl = '/api/auth/register/parroquia_administrador'; // Cambiar URL si gestiona un templo
          const parroquiaNombre = $('#parroquiaNombre').val().trim();
          const direccion = $('#direccion').val().trim();

          if (!parroquiaNombre || !direccion) {
              alert('Por favor, completa la información del templo.');
              return;
          }

          // Añadir la información del templo a los datos a enviar
          data.parroquiaNombre = parroquiaNombre;
          data.direccion = direccion;
      }

      $.ajax({
          url: registerUrl,
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(data),
          success: function(response) {
              alert('Registro exitoso. ¡Bienvenido!');
              window.location.href = '/login'; // Redirigir a la página de login
          },
          error: function(xhr) {
              alert('Error en el registro: ' + xhr.responseJSON.error);
          }
      });
  });
});
