//Iniciando la conexion con sockets
var socket=io.connect();

//Variables utilizadas 
var nick="";
var correcto=0;
var lista={};
var cont=0;
//Se asigna un color genérico a randomColor
var randomColor = Math.floor(Math.random()*16777215).toString(16);

$(document).ready(function(){
	
	//Efecto para el elemento notificaciones
	$('#notificaciones').html('Intetando conexion al servidor web').css("brackground","orange").fadeIn(300);
	
	$('#contIdentificacion').show();

	$('#contChat').hide();

	//Cuando se dispara el evento connect se realiza una notificacion
	socket.on('connect',function(){
		notificar("Conectado correctamente al servidor de websockets","normal");
	});

	//Socket escuchando los siguientes eventos y cuando se disparen 
	//se ejecutaran los respectivos eventos
	socket.on('mensaje',recibirMensaje);
	socket.on('respuestaServidor',respuestaServidor);
	socket.on('actualizarLista',actualizarLista);
	socket.on('no_encontrado',regresarALogin);


	//Cuando se apreten el boton del submit en formIdentificacion
	$('#formIdentificacion').on('submit',function(e){
		//Cancela el evento por defecto
		e.preventDefault();
		//Pide el nombre de usuario
		pedirNombre();
	});

 	//Cuando se apreten el boton del submit en formIdentificacion
	$("#formulario").on('submit',function(e){
		e.preventDefault();
		//Verifica si el nick esta vacío
		if(nick==''){
			//Pide Nombre
			pedirNombre();
			
		}else{
			//Envia el mensaje
			enviarMensaje();
		}

	});

	//Se produce cuando se ha seleccionado un archivo
	$("#files").on("change",function(e){
		var tipo="";
		//Obtenemos la extension del archivo
		var ext = $('#files').val().split('.').pop().toLowerCase();

		//patrones para comparar la extension del archivo
		patronImg="jpg|jpeg|gif|png";
        patronvideo="mp4||mpg|avi||mov";
        patronDocs="pdf|doc|pkt|txt|xls||rar";

        //Condiciones para asignar un valor a la variable tipo
        //1--texto
        //2--Documentos
        //3--Imagenes
        //4--video(No admitidos)
        if(patronDocs.indexOf(ext)!=-1){
        	tipo='2';
        }else if(patronImg.indexOf(ext)!=-1){
        	tipo='3';
        }else if(patronvideo.match(ext)!=-1){
        	alert("No se acepta ningun tipo de audio o multimedia")
        }

		var reader;
		var archivo;
		var nombre="";
		//Verifica si el nick esta vacío
		if(nick!=''){
			//Verifica si le ha asignado un tipo, necesario para enviar el mensaje
			if(tipo!=''){
				//Obtine el archivo en la posicion 0 del input file
				archivo=e.originalEvent.target.files[0];

				//Lector del archivo
				reader=new FileReader();
				nombreFile=archivo.name;
				//Convierte el archivo a la codificacion base 64
				reader.readAsDataURL(archivo);
				//Foco al elemnto casillatexto
				$("#casillatexto").focus();
				//Evento uando termina de cargar la imagen
				reader.onload=function(evt){
					//Obteto json que contiene tipo,nombre y el archivo mismo en base64, ademas del nick de usuario
					//y color que identifican a sus mensajes
					var file={tipo:tipo,nick:nick,nameFile:nombreFile,texto:evt.target.result,randomColor:randomColor};
					//Envio imagen al servidor
					socket.emit('envioImagen',file);
					//Vaciamos variables
					reader="";
					archivo="";
					tipo="";
					fie="";
				}

			}
			
		//Cuando no existe el nombre de usuario
		}else{
			alert("Ingresa un alias para paricipar del chat!!");
		}
		
	});
	
});

///////Funciones//////


//Actualiza la liste de usuarios en el chat
function actualizarLista(datos){
	if(nick!=''){
		//Limpia el elemento listaUsuarios
		$("#listaUsuarios").empty();
		//Recorre cada usuario online
		for(i in datos){
			if(i!=nick){
				lista[i]=i;
				//Apila cada nombre de usuario en el elemento listaUsuarios
				$("#listaUsuarios").append('<div class="online">'+i+'</div>');
			}
		}
	}	
}

//Recibe la respuesta del servidor 
function respuestaServidor(datos){
	//Verifica si nombre ya existe
	//0--Si existe
	//1--No existe
	if(datos[1]==1){
		//Oculta contIdentificacion
		$('#contIdentificacion').fadeOut(300);
		//Muestra contChat
		$('#contChat').fadeIn(1000);
		//Asigna el nombre usuario a la variable nick
		nick=datos[0];
		$('#usuario').append(''+datos[0]+'');
		var texto="!ha ingresado al chat¡";
		//Envia un objeto JSON que contiene el tipo de mensaje,nick,texto
		//y el color de mensaje perteneciente al usuario
		var msj={tipo:'1',nick:nick,texto:texto,randomColor:randomColor};
		//Envio mensaje al servidor
		socket.emit('nuevoMensaje',msj);
	}else{
		//Alerta de usuario existente
		alert("Nombre de usuario ya existe");
	}
	
}

//Recibe los mensajes del servidor
function recibirMensaje(msj){
	//Verifica si la variable nick esta vacía
	if(nick!=""){
		//Condiciones del tipo de mensaje
		//3--Imagen
		//2--Documento
		//1--Texto (si no se cumplieron las condiciones anteriores, entonces es un texto)
       	if (msj.tipo==='3')
        {
        	$("#chat").append('<div class="caja" id="mensajeUsuario"><div class="caja total cabeceraMsj" style="background-color:'+msj.randomColor+';"><p>'+msj.nick+'</p></div><div class="caja total cuerpoMsj"><div class="caja centrar-contenido"><img class="img" src="'+msj.texto+'" /></div></div></div>');
        }else if(msj.tipo==='2'){
        	$("#chat").append('<div class="caja" id="mensajeUsuario"><div class="caja total cabeceraMsj" style="background-color:'+msj.randomColor+';"><p>'+msj.nick+'</p></div><div class="caja total cuerpoMsj centrar-contenido"><a href="'+msj.texto+'" target="_blank">'+msj.nameFile+'</a></div></div>');
        }
        else{
			$('#chat').append('<div class="caja" id="mensajeUsuario"><div class="caja total cabeceraMsj" style="background-color:'+msj.randomColor+';"><p>'+msj.nick+'</p></div><div class="caja total cuerpoMsj">'+msj.texto+'</div></div>');
		}
		
		//Obtiene el tamaño del chat
		cont+=$("#chat").height();
		//Animacion para ubicar el scroll hasta a la parte final del chat
		$ ("#chat").animate({scrollTop:cont},1000);
	}
}

//Pide el nombre usuario
function pedirNombre(){
	var nombre=$('#textoIdent').val();
	if(nombre==''){
		alert("Ingrese alias");
	}else{
	//Enviar el nombre de usuario al servidor para que sea validado
	socket.emit('nuevoUsuario',nombre);
	}

}


//Enviar Mensajes al servidor
function enviarMensaje(){
	//Obtiene el texto del elemento casillatexto
	var texto= $('#casillatexto').val();
	//Objeto JSON que contiene el tipo,nick,texto y el color de mensaje
	//perteneciente al usuario
	var msj={tipo:'1',nick:nick,texto:texto,randomColor:randomColor};
	socket.emit('nuevoMensaje',msj);
	$('#casillatexto').val('');
}

//Notificar Conexion
function notificar(texto,tipo){
	//Notificacion normal
	if (tipo=="normal"){
		$("#notificaciones").html(texto).css("background","green").fadeIn(300).delay(1000).fadeOut(1000);
	}
	//Notificacion de error
	if(tipo=="error"){
		$("#notificaciones").hide().html('').html(texto).css("background","red").fadeIn(3000).fadeOut(1000);
	} 
}

//Regresa al login nuevamente debido a la desconexion realizada por el servidor

function regresarALogin(){
	//Muestra suavemente la advertencia de desconecion
	$('#avisoDesconexion').slideDown(2500).delay(2000).slideUp(1000);
    
    //Despues de 3 segundos se produce
    setTimeout(function(){
    	//Oculta el chat y muestra el login
    	$('#contChat').hide(1000);
		$('#contIdentificacion').show(1000);
		//Recarga la pagina
		location.reload();
    },3000);
    
}




