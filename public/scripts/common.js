$(function() {
  // Cargar el header en todas las páginas
  console.log("common.js loaded");
  $("#header-placeholder").load("/templates/header.html");
});

function loginUser(email, password) {
  // Enviar la solicitud POST al servidor
  $.ajax({
    url: '/api/auth/login',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ email: email, password: password }),
    success: function(response) {
      console.log('Login exitoso, guardando token...');
      // Guardar el token JWT en localStorage o sessionStorage
      localStorage.setItem('authToken', response.token);
      // Redirigir al usuario a la página de inicio o al dashboard
      window.location.href = '/biblia/capitulos/apocalipsis-1.html'; // O la ruta correspondiente
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
}

// Función para actualizar la interfaz de usuario cuando está autenticado
function updateUIForAuthenticatedUser() {
  const token = localStorage.getItem('authToken');
  if (token) {
    console.log('Autenticación detectada. Actualizando UI.');
    $('#login-button').text('Mi cuenta').attr('href', '/mi-cuenta');
  } else {
    console.log('No se pudo actualizar la UI porque no se encontró token.');
  }
}

// Verificar el estado de autenticación al cargar la página
$(document).ready(function () {
  console.log('Verificando autenticación...');
  const token = localStorage.getItem('authToken');
  console.log('Token encontrado:', token);
  if (token) {
    setTimeout(() =>{
      updateUIForAuthenticatedUser();
    }, 100);
  }
});

// Función para cerrar sesión
function logoutUser() {
  localStorage.removeItem('authToken');
  window.location.href = '/';
}