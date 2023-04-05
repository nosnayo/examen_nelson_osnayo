CREATE TABLE usuarios(
	id serial primary key,
	nombre VARCHAR(50) NOT NULL,
	email VARCHAR(50) NOT NULL,
	password VARCHAR(150) NOT NULL
);

CREATE TABLE categorias(
	id serial primary key,
	nombre VARCHAR(50) NOT NULL
);

CREATE TABLE noticias(
	id serial primary key,
	titulo VARCHAR(60) NOT NULL,
	contenido VARCHAR(4000) NOT NULL,
	fecha date NOT NULL,
	id_categoria INT NOT NULL,
	id_usuario INT NOT NULL,
	imagen VARCHAR(255),
	FOREIGN KEY(id_categoria) REFERENCES categorias(id),
	FOREIGN KEY(id_usuario) REFERENCES usuarios(id)
);

CREATE TABLE comentarios(
	id serial primary key,
	contenido VARCHAR(1000) NOT NULL,
	id_usuario INT NOT NULL,
	id_noticia INT NOT NULL,
	fecha date NOT NULL DEFAULT NOW(),
	FOREIGN KEY(id_usuario) REFERENCES usuarios(id),
	FOREIGN KEY(id_noticia) REFERENCES noticias(id)
);

-- 1: Like, 2: Dislike
CREATE TABLE likes(
	id serial primary key,
	estado INT NOT NULL,
  id_usuario INT NOT NULL,
	id_noticia INT NOT NULL,
	fecha date NOT NULL DEFAULT NOW(),
	FOREIGN KEY(id_usuario) REFERENCES usuarios(id),
	FOREIGN KEY(id_noticia) REFERENCES noticias(id)
);

INSERT INTO categorias(nombre) VALUES('Tecnología'), ('Salud');
INSERT INTO usuarios(nombre, email, password) VALUES('nelson', 'nelson@gmail.com', '123456'), ('gustavo', 'gustavo@gmail.com', '123456'),('pepito', 'pepito@gmail.com', '123456');

INSERT INTO noticias(titulo, contenido, fecha, id_categoria, id_usuario, imagen) VALUES
('Este es el nuevo chatbot de Google', 'Bard es una herramienta que presentó Alphabet, empresa matriz de Google, con la que pretende hacerle competencia al chatbot inteligente de ChatGPT. ¿Qué es ChatGPT? ChatGPT es un modelo de lenguaje entrenado en una gran cantidad de información en línea para crear sus respuestas. Proviene de la misma compañía detrás de DALL-E, que genera una gama aparentemente ilimitada de imágenes en respuesta a las indicaciones de los usuarios. También es la próxima iteración del generador de texto GPT-3.',	now(),	1,	1, 'imagen1.jpeg'),
('¿Cómo conectarse a un módem?',	'¿Para qué sirve el botón WPS de tu módem? Para empezar, debes saber que WPS son las siglas de Wi-fi Protected Setup. Este botón, usualmente ubicado en la parte posterior del módem, puede ser usado para que te conectes al wi-fi sin saber la contraseña. ¿En qué consiste esto? Normalmente, en lugar de conectarte a la red introduciendo la contraseña, pulsar este botón la deja abierta y luego puedes conectarte con dispositivos fácilmente.',	now(),	1,	2, 'imagen2.png'),
('Conoce este robot masajeador', 'Millones de estadounidenses sufren de dolor crónico de espalda y encontrar una solución no siempre es fácil. Expertos en salud investigan si la inteligencia artificial podría ayudar. Conoce un robot masajeador para tratar el dolor de espalda que la Clínica Mayo está probando.', now(), 2, 3, 'imagen3.png');


INSERT INTO comentarios(contenido, id_usuario, id_noticia, fecha) VALUES
('excelente noticia', 2, 1, now()),
('contenido muy preciso', 3, 1, now()),
('buen contenido', 3, 2, now());

INSERT INTO likes(estado, id_usuario, id_noticia, fecha) VALUES
(1, 2, 1, now()),
(1, 3, 2, now()),
(1, 3, 1, now()),
(2, 1, 3, now());

--ALTER TABLE publicaciones ADD COLUMN imagen VARCHAR(255);
--UPDATE publicaciones SET imagen = 'imagen.jpg';
