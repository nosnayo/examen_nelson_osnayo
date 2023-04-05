const { Pool } = require('pg')
 
//CONSULTA A LA API
const host = process.env.DB_HOST || "localhost";
const user = process.env.DB_USER || "postgres";
const password = process.env.DB_PASSWORD || "nelson"
const database = process.env.DB_DATABASE || "certificacion_nelson_osnayo"
const pool = new Pool({
  host,
  user,
  password,
  database,
  max: 5,
  port: 5432,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 2000,
})

//TRAER NOTICIAS
const getNoticias = async () => {
  let consulta = `select titulo, contenido, imagen, fecha from noticias order by fecha`
  let resultado = await pool.query(consulta);
  return resultado.rows;
}


//TRAER PUBLICACIONES
const getPublicaciones = async (option) => {
        
  let consulta = `
              select p.id, titulo, contenido, fecha, id_categoria, p.id_usuario, imagen, u.nombre as autor from publicaciones p
              join usuarios u
              on p.id_usuario = u.id
              order by p.fecha ${option}
  `
  let resultado = await pool.query(consulta);
  return resultado.rows;
}

const getPublicacionById = async (id) => {
let consulta = `
select p.id, p.titulo, p.contenido, p.fecha, p.imagen, u.nombre as autor, ct.nombre as categoria from publicaciones p
join categorias ct
on p.id_categoria = ct.id
join usuarios u
on p.id_usuario = u.id
where p.id = $1;
`
let resultado = await pool.query(consulta, [id]);
return resultado.rows[0];
}

const getCategorias= async () => {
let consulta = "SELECT id, nombre FROM categorias order by nombre ASC"
let resultado = await pool.query(consulta);
return resultado.rows;
}

const getCategoriaByName = async (categoria) => {
let consulta = `
select p.id, p.titulo, p.contenido, p.fecha, p.imagen, u.nombre as autor, ct.nombre as categoria from publicaciones p
join categorias ct
on p.id_categoria = ct.id
join usuarios u
on p.id_usuario = u.id
where ct.nombre = $1
order by fecha asc
`

let resultado = await pool.query(consulta, [categoria]);
return resultado.rows;
}

const getUsuarioByEmailAndPassword = async (email, password) => {
  let consulta = "SELECT id, nombre, email FROM usuarios WHERE email = $1 AND password = $2"
  let resultado = await pool.query(consulta, [email, password]);
  return resultado.rows[0];
}

const addPublicacion = async (titulo, contenido, id_categoria, id_usuario, imagen) => {
  let query = `INSERT INTO publicaciones(titulo, contenido, fecha, id_categoria, id_usuario, imagen)
          VALUES($1, $2, NOW(), $3, $4, $5) RETURNING *
  `
  let resultado = await pool.query(query, [titulo, contenido, id_categoria, id_usuario, imagen]);
  return resultado.rows[0];
}

const getComentarios = async(id) => {
  let consulta =`
      select c.contenido, u.nombre, c.fecha  from comentarios c
      join usuarios u
      on c.id_usuario = u.id
      join publicaciones p
      on p.id = c.id_publicacion
      WHERE p.id = $1
      order by c.fecha DESC
  `
  let resultado = await pool.query(consulta, [id]);
  return resultado.rows;
}

const addComentario = async (contenido, idUsuario, idPublicacion) => {
let query = `INSERT INTO comentarios(contenido, id_usuario, id_publicacion)
          VALUES($1, $2, $3) RETURNING *
`
let resultado = await pool.query(query, [contenido, idUsuario, idPublicacion]);
return resultado.rows[0];
}

const getCantidadComentarios = async (id) => {
let query = `   select count(*) cantidad from comentarios c
              join publicaciones p
              on p.id = c.id_publicacion
              WHERE id_publicacion = $1
              group by c.id_publicacion;
`
let resultado = await pool.query(query, [id]);
if(!resultado.rows[0]) return 0
return resultado.rows[0].cantidad;
}


const addUsuario = async (nombre, email, password) => {
let query = `INSERT INTO usuarios(nombre, email, password) VALUES($1, $2, $3) RETURNING id, nombre, email;`
let resultado = await pool.query(query, [nombre, email, password]);
return resultado.rows[0];
}

const darLike = async (idUsuario, idPublicacion) => {
let resultado = await pool.query("select * from like_dislike where id_usuario = $1 and id_publicacion = $2", [idUsuario, idPublicacion])
if(!resultado.rows[0]){
  await pool.query("INSERT INTO like_dislike(islike, id_usuario, id_publicacion) values(true, $1, $2)", [idUsuario, idPublicacion])
}else {
  if(resultado.rows[0].islike == true){
      await pool.query("UPDATE like_dislike SET islike = false where id_usuario= $1 and id_publicacion = $2", [idUsuario, idPublicacion])
  }else if(resultado.rows[0].islike == false){
      await pool.query("UPDATE like_dislike SET islike = null where id_usuario= $1 and id_publicacion = $2", [idUsuario, idPublicacion])
  }else {
      await pool.query("UPDATE like_dislike SET islike = true where id_usuario= $1 and id_publicacion = $2", [idUsuario, idPublicacion])
  }
}
return true;
}

const cantidadLikeAndDislike = async(idPublicacion) => {
let consulta = `
  select islike, count(*) from like_dislike where id_publicacion = $1 and islike is not null
  group by islike
`
let resultado = await pool.query(consulta, [idPublicacion]);
return resultado.rows;
}

const getLike = async (idUsuario, idPublicacion) => {
let consulta = "select islike from like_dislike where id_usuario = $1 and id_publicacion = $2;"
let resultado = await pool.query(consulta, [idUsuario, idPublicacion]);
return resultado.rows[0]
}

module.exports = {
getNoticias,
getPublicaciones,
getUsuarioByEmailAndPassword,
getCategorias,
addPublicacion,
getCategoriaByName,
getPublicacionById,
getComentarios,
addComentario,
getCantidadComentarios,
addUsuario,
darLike,
getLike,
cantidadLikeAndDislike
}