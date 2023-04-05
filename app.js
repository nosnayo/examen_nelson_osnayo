//LIB
const express = require('express');
const {create} = require('express-handlebars');
const path = require('path');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');
const app = express();
const SECRETO = process.env.SECRETO || "123456";

//CONSULTAS
const {getNoticias,  addUsuario, getUsuarioByEmailAndPassword, getCategorias} = require('./consultas.js')
const { verificarToken } = require("./middlewares/jwt.js")
const { upload } = require('./middlewares/upload.js')

//MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/public', express.static('public'));


//CONFIGURACION EXPRESS-HANDLEBARS
const hbs = create({
	partialsDir: [
		"views/partials/",
	],
});
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname, "./views"));

//SERVICIO PUERTO
let PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("http://localhost:"+PORT))

//RUTA VISTAS
app.get("/", async (req, res) => {
  try {
    let noticias = await getNoticias();
    noticias = noticias.map(noticia => {
      noticia.fecha = moment(noticias.fecha).format('DD/MM/YYYY')
      return noticia
    })
    //console.log("noticias: ", noticias)
    res.render("home", {
      noticias
    })
  } catch (error){
    console.log(error)
    res.render("home", {
      error: "No se pudieron cargar las noticias"
    })
  }
})

app.get("/login", (req, res) => {
  res.render("login")
})

app.get("/registro", (req, res) => {
  res.render("registro")
})

app.get("/publicar", verificarToken, async (req, res) => {

  try {
      let categorias = await getCategorias();
      let usuario = req.usuario

      res.render("publicar",{
      usuario,
      categorias
  })
  } catch (error) {
      console.log(error)
      res.render("publicar",{
          error: "Se ha generado un error que no permite cargar los datos de la vista."
      })
  }
})


//ENDPOINTS

app.post("/api/v1/login", (req, res) => {
  try {
      let {email, password} = req.body;
      getUsuarioByEmailAndPassword(email, password)
      .then(usuario => {
          console.log(usuario)
          if(usuario == undefined) return res.status(401).json({code: 401, message: "Pruebe intentando otra vez"})
          let tokenKey
          jwt.sign({usuario}, SECRETO, (err, token) => {
              if(err){
                  res.status(500).json({code: 500, message: "No se pudo emitir un token"})
              }else{
                  tokenKey = token;
                  res.status(200).json({code: 200, token: tokenKey})
              }
          })
      }).catch(error => {
          console.log(error)
          res.status(500).json({code: 500, message: "Error del servidor"})
      })
  } catch (error) {
      console.log(error)
      res.status(500).json({code: 500, message: "Error del servidor"})
  }
})

app.post("/api/v1/registro", async (req, res) => {

  try {
      let {nombre, email, password} = req.body;
      if(!nombre || !email || !password)
      return res.status(400).json({code: 400, message: "no ha proporcionado todo el contenido requerido."})

      let usuario = await addUsuario(nombre, email, password);
      if(!usuario) throw new Error ("No se pudo crear el usuario.")
      res.status(201).json({code: 201, message: "Registro con éxito."})

  } catch (error) {
      res.status(500).json({code: 500, message: "Error del servidor"})
  }
})


app.post("/api/v1/publicar", verificarToken, upload, (req, res) => {
  try{
      let {titulo, contenido, idCategoria} = req.body;

      if(titulo ==undefined || contenido == undefined || idCategoria == undefined){
          fs.unlinkSync(path.resolve("./public/img/"+ req.imagen));
          return res.status(400).json({code: 400, message: "no ha proporcionado todo el contenido requerido."})
      }

      console.log(req.usuario)
      addPublicacion(titulo, contenido, idCategoria, req.usuario.id, req.imagen)
      .then(respuesta => {
          res.status(201).json({code: 201, message: "Publicación realizada con éxito."})
      }).catch(error => {
          console.log(error)
          fs.unlinkSync(path.resolve("./public/img/"+ req.imagen));
          res.status(500).json({code: 500, message: "Error con la base de datos."})
      })

  }catch(error){
      fs.unlinkSync(path.resolve("./public/img/"+ req.imagen));
      res.status(500).json({code: 500, message: "no se pudo realizar la publicación"})
  }
})
