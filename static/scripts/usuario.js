
var nick="";
var correcto=0;
var lista={};
var socket=io.connect();
var cont=0;
var randomColor = Math.floor(Math.random()*16777215).toString(16);

$(document).ready(function(){
	
	
	$('#notificaciones').html('Intetando conexion al servidor web').css("brackground","orange").fadeIn(300);
	

	socket.on('connect',function(){
		notificar("Conectado correctamente al servidor de websockets","normal");
	});

	socket.on('mensaje',recibirMensaje);

	socket.on('respuestaServidor',respuestaServidor);

	socket.on('actualizarLista',actualizarLista);

	$("#formulario").on('submit',function(e){
		e.preventDefault();
		if(nick==''){
			pedirNombre();
			
		}else{
			enviarMensaje();
		}

	});

	$("#imgfile").on("change",function(e){
		if(nick!=''){
			var archivo=e.originalEvent.target.files[0];
		var reader=new FileReader();
		
		reader.readAsDataURL(archivo);
		//Cuando termina de cargar la imagen
		reader.onload=function(evt){
			//Envio imagen al servidor
			var img={nick:nick,texto:evt.target.result,randomColor:randomColor};
			socket.emit('envioImagen',img);
		}

		}else{
			alert("Ingresa un alias para paricipar del chat!!");
		}
		
	});
	
});


function actualizarLista(datos){
	if(nick!=''){
		$("#listaUsuarios").empty();
		for(i in datos){
			if(i!=nick){
				lista[i]=i;
				$("#listaUsuarios").append('<div class="online">'+i+'</div>');
			}
		}
	}	
}

function respuestaServidor(datos){
	
	if(datos[1]==1){
		nick=datos[0];
		$('#usuario').append(''+datos[0]+'');
		var texto="!ha ingresado al chat¡";
		var msj={nick:nick,texto:texto,randomColor:randomColor};
		socket.emit('nuevoMensaje',msj);
	}else{
		pedirNombre();
	}
	
}

function recibirMensaje(msj){
	if(nick!=""){
		patron = /jpg|jpeg|gif|png/g;
		/*msj.nick.replace(/<script/g, '');
        msj.texto.replace(/<script/g, '');*/

        if (msj.texto.match(patron))
        {
        	$("#chat").append('<div class="caja" id="mensajeUsuario"><div class="caja total cabeceraMsj" style="background-color:'+msj.randomColor+';"><p>'+msj.nick+'</p></div><div class="caja total cuerpoMsj"><div class="caja centrar-contenido"><img class="img" src="'+msj.texto+'" /></div></div></div>');
        }else{
			//$('#chat').append('<div class="caja" id="mensajeUsuario"><div class="caja total cabeceraMsj"><p>'+msj.nick+'</p></div><div class="caja total cuerpoMsj">'+msj.texto+'</div></div>');
			$('#chat').append('<div class="caja" id="mensajeUsuario"><div class="caja total cabeceraMsj" style="background-color:'+msj.randomColor+';"><p>'+msj.nick+'</p></div><div class="caja total cuerpoMsj">'+msj.texto+'</div></div>');
		}

		
		cont+=$("#chat").height();
		$ ("#chat").animate({scrollTop:cont},1000);
	}
}
function pedirNombre(){

	nombre=prompt("Ingresa tu nombre de usuario","Anonimo");
	if(nombre===undefined)
	{
		alert("Ingresa un alias para participar en el chat");
		
	}else if(nombre===""){
		alert("Ingresa un alias para participar en el chat");
		pedirNombre();
	}else if(nombre===null){
		alert("Ingresa un alias para participar en el chat");
	}else{
		socket.emit('nuevoUsuario',nombre);
	}

}



function enviarMensaje(){
	var texto= $('#casillatexto').val();
	var msj={nick:nick,texto:texto,randomColor:randomColor};
	socket.emit('nuevoMensaje',msj);
	$('#casillatexto').val('');
}

	
function notificar(texto,tipo){
	if (tipo=="normal"){
		$("#notificaciones").html(texto).css("background","green").fadeIn(300).delay(1000).fadeOut(1000);
	}
		
	if(tipo=="error"){
		$("#notificaciones").hide().html('').html(texto).css("background","red").fadeIn(3000).fadeOut(1000);
	}
}


