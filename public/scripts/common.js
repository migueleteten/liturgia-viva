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
      localStorage.setItem('authToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      $('#auth-modal').hide(); // Oculta el modal
      $('body').css('background', 'white');
      alert('Inicio de sesión exitoso. Puedes continuar');
      setTimeout(() =>{
        updateUIForAuthenticatedUser();
      }, 200);
    },
    error: function(xhr) {
      // Manejar errores y mostrar mensaje al usuario
      if (xhr.status === 400) {
          $('#login-error').text('Correo electrónico o contraseña incorrectos').show();
          $('#login-error').css('opacity', '1');
      } else {
          $('#login-error').text('Hubo un problema al iniciar sesión. Por favor, intenta de nuevo.').show();
          $('#login-error').css('opacity', '1');
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
    }, 200);
  }
});

// Función para cerrar sesión
function logoutUser() {
  localStorage.removeItem('authToken');
  window.location.reload();
}

function checkTokenExpiry() {
  const token = localStorage.getItem('authToken');
  if (!token) return; // Si no hay token, no hacemos nada

  const tokenPayload = JSON.parse(atob(token.split('.')[1]));
  const expiryTime = tokenPayload.exp * 1000;
  const currentTime = Date.now();

  // Verificar si el token expirará en menos de 5 minutos
  if (expiryTime - currentTime < 5 * 60 * 1000) {
      renewAccessToken(); // Renovar el token
  }
}

function renewAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
      // Si no hay refreshToken, avisar y cerrar sesión
      alert('Tu sesión ha expirado, por favor, inicia sesión de nuevo.');
      logoutUser();
      return;
  }

  $.ajax({
      url: '/api/auth/token',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ refreshToken: refreshToken }),
      success: function(response) {
          localStorage.setItem('authToken', response.accessToken);
      },
      error: function() {
          alert('Tu sesión ha expirado, por favor, inicia sesión de nuevo.');
          logoutUser(); // Cerrar sesión si no se puede renovar el token
      }
  });
}

// Llama a checkTokenExpiry() regularmente, por ejemplo, cada 10 minutos
setInterval(checkTokenExpiry, 10 * 60 * 1000);

function loadAuthView(view) {
  alert('No puedes realizar esta acción si no has iniciado sesión.')
  $('#auth-modal').load(`/views/pages/${view}.html`, function() {
      // Cargar dinámicamente los estilos y scripts necesarios
      loadCSS(`/styles/${view}.css`);
      loadScript(`/scripts/${view}.js`, function() {
          $('#auth-modal').show(); // Mostrar el modal
      });
  });
}

function loadCSS(href) {
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = href;
  document.getElementsByTagName('head')[0].appendChild(link);
}

function loadScript(src, callback) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = src;
  script.onload = callback;
  document.getElementsByTagName('head')[0].appendChild(script);
}