$(document).ready(function () {
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
    $('#email').on('input', function () {
        const email = $(this).val().trim();
        if (!validateEmail(email)) {
            $('#email-error').show();
            $('#email').css('margin-bottom', '0');
        } else {
            $('#email-error').hide();
            $('#email').css('margin-bottom', '1rem');
        }
    });

    // Validar contraseña en tiempo real
    $('#password').on('input', function () {
        const password = $(this).val();
        if (!validatePassword(password)) {
            $('#password-error').show();
            $('#password').css('margin-bottom', '0');
        } else {
            $('#password-error').hide();
            $('#password').css('margin-bottom', '1rem');
        }

        // Validar que las contraseñas coincidan
        const confirmPassword = $('#password-confirm').val();
        if (confirmPassword && !validatePasswordsMatch(password, confirmPassword)) {
            $('#password-confirm-error').show();
            $('#password-confirm').css('margin-bottom', '0');
        } else {
            $('#password-confirm-error').hide();
            $('#password-confirm').css('margin-bottom', '1rem');
        }
    });

    // Validar que las contraseñas coincidan en tiempo real
    $('#password-confirm').on('input', function () {
        const confirmPassword = $(this).val();
        const password = $('#password').val();
        if (!validatePasswordsMatch(password, confirmPassword)) {
            $('#password-confirm-error').show();
        } else {
            $('#password-confirm-error').hide();
        }
    });

    // Mostrar/Ocultar campos adicionales cuando se marca la casilla de "¿Gestionas un templo?"
    $('#temple-checkbox').on('change', function () {
        if ($(this).is(':checked')) {
            $('#parroquiaInfo').show();
        } else {
            $('#parroquiaInfo').hide();
        }
    });

    let shouldSearch = true;

    // Obtener sugerencias de templos
    $('#parroquiaNombre').on('input', function () {
        const query = $(this).val().trim();
        const codigoPostal = $('#codigoPostal').val().trim();

        if (shouldSearch && query.length >= 2) {
            $.ajax({
                url: '/api/templos/search', // Cambia la ruta según tu configuración
                type: 'GET',
                data: { nombre: query, codigoPostal: codigoPostal },
                success: function (response) {
                    const options = response.templos.map(templo =>
                        `<option value="${templo.nombre}" data-id="${templo.id}">${templo.direccion}</option>`);
                    $('#parroquiaOptions').empty().append(options);
                },
                error: function () {
                    console.error('Error al obtener templos.');
                }
            });
        }
    });

    // Capturar la selección del datalist y guardar el ID del templo en el campo oculto
    $('#parroquiaNombre').on('change', function () {
        const selectedValue = $(this).val();
        const selectedOption = $('#parroquiaOptions option[value="' + selectedValue + '"]');

        if (selectedOption.length > 0) {
            const temploId = selectedOption.data('id');  // Obtener el ID del templo
            $('#temploId').val(temploId);  // Almacenar el ID en el campo oculto
            shouldSearch = false;
            $('#parroquiaOptions').empty();  // Limpiar el datalist
            $(this).blur();  // Quita el foco del input
        }
    });

    // Reiniciar la búsqueda si el usuario comienza a escribir nuevamente
    $('#parroquiaNombre').on('input', function () {
        shouldSearch = true;
        $('#temploId').val(''); // Limpiar el campo oculto si se empieza a escribir de nuevo
    });

    // Obtener sugerencias de códigos postales
    $('#codigoPostal').on('input', function () {
        const query = $(this).val().trim();
        if (query.length >= 2 && query.length < 5) {
            $.ajax({
                url: '/api/templos/codigosPostales', // Cambia la ruta según tu configuración
                type: 'GET',
                data: { codigoPostal: query },
                success: function (response) {
                    const options = response.codigosPostales.map(cp => `<option value="${cp.codigo_postal}">${cp.codigo_postal}</option>`);
                    console.log(options);
                    $('#codigoPostalOptions').empty().append(options);
                },
                error: function () {
                    console.error('Error al obtener códigos postales.');
                }
            });
        }
    });

    // Manejar el envío del formulario
    $('#registerForm').on('submit', function (event) {
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
            const parroquiaId = $('#temploId').val();

            if (!parroquiaId) {
                alert('Por favor, selecciona un templo válido.');
                return;
            }

            // Añadir la información del templo a los datos a enviar
            data.parroquiaId = parroquiaId;
        }

        $.ajax({
            url: registerUrl,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                alert('Registro exitoso. ¡Bienvenido!');
                window.location.href = '/login'; // Redirigir a la página de login
            },
            error: function (xhr) {
                alert('Error en el registro: ' + xhr.responseJSON.error);
            }
        });
    });
});
