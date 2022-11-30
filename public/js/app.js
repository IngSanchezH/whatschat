var url = window.location.href;
var swLocation = '../sw.js';
var swReg;
if ( navigator.serviceWorker ) {
    if ( url.includes('localhost') ) {
        swLocation = '/sw.js';
    }
    window.addEventListener('load', function() {
        navigator.serviceWorker.register( swLocation ).then( function(reg){
             swReg = reg;
             swReg.pushManager.getSubscription().then( verificaSuscripcion );
         });
    });
}

// Referencias de jQuery - AIzaSyCVH2nGlz9tIuQnw8MyDhLv7Nj-jDoY2d0 - AIzaSyA5mjCwx1TRLuBAjwQw84WE6h5ErSe7Uj8
var googleMapKey = 'AIzaSyD9US0r6NA85ONr1H8yGjlnhWPPAc3XRa8';

var titulo      = $('#titulo');
var nuevoBtn    = $('#nuevo-btn');
var salirBtn    = $('#salir-btn');
var cancelarBtn = $('#cancel-btn');
var postBtn     = $('#post-btn');
var avatarSel   = $('#seleccion');
var timeline    = $('.timeline');
var menu    = $('.menu');
var menuOpc    = $('#menu-opcion');

var modal       = $('#modal');
var modalAvatar = $('#modal-avatar');
var avatarBtns  = $('.seleccion-avatar');
var txtMensaje  = $('#txtMensaje');

var btnActivadas    = $('.btn-noti-activadas');
var btnDesactivadas = $('.btn-noti-desactivadas');

var btnLocation      = $('#location-btn');
var modalMapa        = $('.mapa-contenedor');

var btnTomarFoto     = $('#tomar-foto-btn');
var btnPhoto         = $('#photo-btn');
var contenedorCamara = $('.camara-contenedor');
var cerrar         = $('.cerrar');

var lat  = null;
var lng  = null; 
var foto = null; 
var nuevomapa = null; 
// El usuario
var usuario = "Feliciano";
const camara = new Camara($('#player')[0]);
// ===== Codigo de la 
function crearMensajeHTML(mensaje, personaje, lat, lng, foto) {
    var content =`
    <li class="animated fadeIn delay-1s">
        <div class="bubble-container">
            <div class="bubble">
                ...
            </div>
            <div class="arrow"></div>
        </div>
    </li>
    <li class="animated fadeIn fast"
        data-tipo="mensaje">
        <div class="bub-containerU">
            <div class="bub">
                <h3>@${ personaje }</h3>
                <br/>
                ${ mensaje }
                `;
    
                if ( foto ) {
                    content += 
                    `
                    <br>
                    <img class="foto-mensaje" src="${ foto }">
                    `;
                }                 
                // si existe la latitud y longitud, 
                // llamamos la funcion para crear el mapa
                if ( nuevomapa ) {
                    //crearMensajeMapa( lat, lng, personaje );
                content += 
                    `
                    <br>
                    <iframe
                        width="100%"
                        height="250"
                        frameborder="0" style="border:0"
                        src="https://www.google.com/maps/embed/v1/view?key=${ googleMapKey }&center=${ lat },${ lng }&zoom=17" allowfullscreen>
                    </iframe>
                    `;
                }
                content += 
                `</div>        
            <div class="arrowU"></div>
        </div>
    </li>
                `;

    // Borramos la latitud y longitud por si las usó
    lat = null;
    lng = null;
    nuevomapa = null;
    timeline.prepend(content);
    cancelarBtn.click();
    contenedorCamara.addClass('oculto');
    modalMapa.addClass('oculto');
}

var clos = 0;
menu.on('click', function() {
   activarmenu();
});

function activarmenu(){
 if(clos == 0){
        $('#menu-btn').remove();
        var cierra =`
            <div id="x-btn" class="fab-menu">
                <i class="fas fa-times"></i>
            </div>
            `;
        menu.append(cierra);
        menuOpc.removeClass('oculto');
        clos = 1;
    }else{
        $('#menu-btn').remove();
        var cierra =`
            <div id="x-btn" class="fab-menu">
                <i class="fas fa-bars"></i>
            </div>
            `;
        menu.append(cierra);
        menuOpc.addClass('oculto');
        clos = 0;
    }
}

// Globals
function logIn( ingreso ) {
    if ( ingreso ) {
        nuevoBtn.removeClass('oculto');
        salirBtn.removeClass('oculto');
        timeline.removeClass('oculto');
        avatarSel.addClass('oculto');
        modalAvatar.attr('src', 'img/avatars/' + usuario + '.jpg');
    } else {
        nuevoBtn.addClass('oculto');
        salirBtn.addClass('oculto');
        timeline.addClass('oculto');
        avatarSel.removeClass('oculto');
       titulo.text('Seleccione Personaje');
    }

}


// Seleccion de personaje
avatarBtns.on('click', function() {
    usuario = $(this).data('user');
    titulo.text('@' + usuario);
    logIn(true);
});

// Boton de salir
salirBtn.on('click', function() {
    logIn(false);
});

// Boton de nuevo mensaje
nuevoBtn.on('click', function() {
    modal.removeClass('oculto');
    modal.animate({ 
        marginTop: '-=1000px',
        opacity: 1
    }, 200 );

});


// Boton de cancelar mensaje
cancelarBtn.on('click', function() {
    if ( !modal.hasClass('oculto') ) {
        modal.animate({ 
            marginTop: '+=1000px',
            opacity: 0
         }, 200, function() {
             modal.addClass('oculto');
             modalMapa.addClass('oculto');
             txtMensaje.val('');
         });
    }

});

// Boton de enviar mensaje
postBtn.on('click', function() {
    var mensaje = txtMensaje.val();
    if ( mensaje.length === 0 ) {
        cancelarBtn.click();
        return;
    }

    var data = {
        mensaje: mensaje,
        user: usuario,
        lat: lat,
        lng: lng,
        foto: foto
    };
    fetch('api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify( data )
    })
    .then( res => res.json() )
    .then( res => console.log( 'app.js', res ))
    .catch( err => console.log( 'app.js error:', err ));

    //camera.apagar();
    //contenedorCamara.addClass('oculto');

    $(txtMensaje).val("");
    crearMensajeHTML( mensaje, usuario, lat, lng, foto );
    foto = null;
});



// Obtener mensajes del servidor
function getMensajes() {
    fetch('api')
        .then( res => res.json() )
        .then( posts => {
            posts.forEach( post => 
                crearMensajeHTML( post.mensaje, post.user, post.lat, post.lng, post.foto ));
        });
}
getMensajes();

// Detectar cambios de conexión
function isOnline() {
    if ( navigator.onLine ) {
        // tenemos conexión
        // console.log('online');
        $('#line').removeClass('offline');
        $('#line').addClass('online');
        document.getElementById('line').innerHTML = '<i class="fas fa-signal"></i> Online';
    } else{
        $('#line').removeClass('online');
        $('#line').addClass('offline');
        // console.log('Offline');
        document.getElementById('line').innerHTML = '<i class="fas fa-signal"></i> Offline';
    }
}
window.addEventListener('online', isOnline );
window.addEventListener('offline', isOnline );
isOnline();

// Notificaciones
function verificaSuscripcion( activadas ) {
    if ( activadas ) {
        btnActivadas.removeClass('oculto');
        btnDesactivadas.addClass('oculto');
    } else {
        btnActivadas.addClass('oculto');
        btnDesactivadas.removeClass('oculto');
    }
}

function enviarNotificacion() {
    const notificationOpts = {
        body: 'Este es el cuerpo de la notificación',
        icon: 'img/icons/icon-72x72.png'
    };
    const n = new Notification('Hola Mundo', notificationOpts);
    n.onclick = () => {
        console.log('Click');
    };
}

// Get Key
function getPublicKey() {
    // fetch('api/key')
    //     .then( res => res.text())
    //     .then( console.log );
    return fetch('api/key')
        .then( res => res.arrayBuffer())
        // returnar arreglo, pero como un Uint8array
        .then( key => new Uint8Array(key) );
}

// getPublicKey().then( console.log );
btnDesactivadas.on( 'click', function() {
    if ( !swReg ) return console.log('No hay registro de SW');
    getPublicKey().then( function( key ) {
        swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: key
        })
        .then( res => res.toJSON() )
        .then( suscripcion => {
            // console.log(suscripcion);
            fetch('api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( suscripcion )
            })
            .then( verificaSuscripcion )
            .catch( cancelarSuscripcion );
        });
    });
});

function cancelarSuscripcion() {
    swReg.pushManager.getSubscription().then( subs => {
        subs.unsubscribe().then( () =>  verificaSuscripcion(false) );
    });
}

btnActivadas.on( 'click', function() {
    cancelarSuscripcion();
});

// Crear mapa en el modal
function mostrarMapaModal(lat, lng) {
    modalMapa.removeClass('oculto');
    var content = `
    <div class="mapa-contenedor">
        <iframe
            width="100%"
            height="250"
            frameborder="0"
            src="https://www.google.com/maps/embed/v1/view?key=${ googleMapKey }&center=${ lat },${ lng }&zoom=17" allowfullscreen>
            </iframe>
    </div>
    `;
    modal.append( content );
}

// Recursos Nativos
// Obtener la geolocalización
btnLocation.on('click', () => {
    activarmenu();
    $.mdtoast('Cargando mapa...',{
        interaction: true,
        interactionTimeout: 2000,
        actionText: 'Ok!'
    });
    //console.log('Botón geolocalización');
    navigator.geolocation.getCurrentPosition(pos => {
        // console.log(pos);
        mostrarMapaModal(pos.coords.latitude, pos.coords.longitude);
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
nuevomapa = "nuevomapa";
$(txtMensaje).val("Mi ubicación");
    });
});



// Boton de la camara
// usamos la funcion de fleca para prevenir
// que jQuery me cambie el valor del this
btnPhoto.on('click', () => {
    //console.log('Inicializar camara');
    activarmenu();
    contenedorCamara.removeClass('oculto');
    camara.encender();
});


// Boton para tomar la foto
btnTomarFoto.on('click', () => {
    //console.log('Botón tomar foto');
    foto = camara.tomarFoto();
    camara.apagar();
    //console.log(foto);

    $(txtMensaje).val("Mi foto");
});

cerrar.on('click', () => {
    camara.apagar();
    contenedorCamara.addClass('oculto');
    nuevomapa = null;
    cancelarBtn.click();
    modalMapa.addClass('oculto');
    $(txtMensaje).val("");
});
