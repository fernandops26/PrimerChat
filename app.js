var express=require('express');
var app=express();
var server=require('http').Server(app);
var io=require('socket.io')(server);
var escape=require('html-escape');

var lista={};
var listsockets={};


var PORT=process.env.port || 8000;

app.use('/static',express.static(__dirname+'/static'));
app.set('views',__dirname+'/views');
app.set('view engine','jade');

server.listen(PORT,function(){
	console.log('Servidor escuchando en el puerto '+PORT);
});

app.get('*',function(req,res){
	res.render('index');
});

	io.sockets.on('connection',function(socket){
	console.log('Nuevo cliente conectado');
	
	//Identificacion de usuario
	
	socket.on('nuevoUsuario',function(user){
		var r;
		
		if(lista[user]){
			r=0;

		}else{
			r=1;
		console.log("Nombre recibido: "+user);
		socket.nickname=user;
		lista[user]=user;
		listsockets[socket]=socket;
		}

		datos=[user,r];
		console.log('Respuesta: '+r);
		socket.emit('respuestaServidor',datos);
		
		io.sockets.emit('actualizarLista',lista);
		
		
	});


	socket.on('nuevoMensaje',function(msj){
		if(lista[msj['nick']]){
			console.log("Nuevo msj de "+ msj['nick']+": "+msj['texto']);
			msj['texto']=escape(msj['texto']);
			socket.randomColor=msj['randomColor'];
			io.sockets.emit('mensaje',msj);
		}else{
			socket.emit('no_encontrado');
		}
		
	});

	socket.on('envioImagen',function(msj){
		if(lista[msj['nick']]){
			console.log("Imagen recibida: "+msj["texto"]);
			msj['texto']=escape(msj['texto']);
			io.sockets.emit('mensaje',msj);
		}else{
			socket.emit('no_encontrado');
		}
		
	});

	socket.on('disconnect',function(){
		if(lista[socket.nickname]){
			
			var msj={
				tipo:'1',
				nick:socket.nickname,
				texto:"¡se ha desconectado del chat!",
				randomColor:socket.randomColor
			};

			delete lista[socket.nickname];
			io.sockets.emit('mensaje',msj);
			io.sockets.emit('actualizarLista',lista);
		}
		
	});

	

});