const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const basePath = process.cwd();
const config = require(path.join(basePath,'package.json'));
const expressLayouts = require('express-ejs-layouts');
const controlador_usuario = require('./controllers/user_controller.js');
const fs = require('fs-extra');
var error;

//Autenticación segura
var https = require('https');
var options = {
   key  : fs.readFileSync(path.join(basePath,'certs','server.key')),
   cert : fs.readFileSync(path.join(basePath,'certs','server.crt'))
};

passport.use(new LocalStrategy(
  function(username, password, cb) {
    console.log("Estrategia de local");

    controlador_usuario.findByUsername(username,password,(err,usuario) => {
      if(err){
        error = err;
        return cb(null,null);
      }
      console.log("User: "+JSON.stringify(usuario));
      return cb(null,usuario);
    });
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null,obj);
});

//----------------------------------------------------------------------------------------------------
// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.use(express.static(path.join(__dirname,'gh-pages/')));
app.use(express.static(path.join(__dirname,'public/')));
app.set("views", __dirname+'/views');
app.set('view engine', 'ejs');
app.use(expressLayouts);

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

//----------------------------------------------------------------------------------------------------
// Define routes.
app.get('/',
  function(req, res) {
    console.log("Usuario:"+req.user);
    if(config.IAAS.authentication != 'No' && req.user == null)
    {
      res.render('home');
    }
    else
    {
      res.redirect('/inicio_gitbook');
    }
});

app.get('/login',
  passport.authenticate('local', {failureRedirect: '/error'}),
  function(req,res) {
	res.render('login', {user: req.user});
});


//----------------------------
// Ruta para el administrador

app.get('/vista_administracion', function(req,res)
{
    console.log("Vista de aministración");
    //Buscamos en la base de datos
    controlador_usuario.findAll((err, usuarios)=>
    {
      if(err)
      {
        console.log("ERRORRR:"+err);
        error = err;
        res.redirect('/error');
      }

      console.log("Usuarios pendientes:"+JSON.stringify(usuarios));

      res.render('administracion', { user: req.user, data: usuarios});
    });
});

app.get('/borrar_users/:id',function(req,res){
 console.log("Params:"+req.params.id);
 controlador_usuario.borrarById(req.params.id, (err)=>
 {
   if(err)
   {
     console.log("ERROR:"+err);
     error = err;
     res.redirect('/error');
   }
   res.redirect('/vista_administracion');
 });
});

//----------------------------

app.get('/change_password', function(req,res)
{
    res.render('changing_password',{user: req.user});
});

app.get('/change_password_return', function(req,res)
{
  // ACTUALIZANDO
  controlador_usuario.change_password(req.user.username,req.query.old_pass,req.query.new_pass,(err) =>
  {
    if(err)
    {
      console.log("ERROR:"+err);
      error = "No se ha cambiado el password: "+err;
      res.redirect('/error');
    }
    res.render('login',{user: req.user});
  });
});

//----------------------------

app.get('/inicio_gitbook', function(req,res)
{
  controlador_usuario.nueva_visita(req.user.username, req.user.password, (err)=>
  {
    if(err)
    {
      console.log("ERROR:"+err);
      error = "No se ha podido registrar la nueva visita: "+err;
      res.redirect('/error');
    }
    res.sendFile(path.join(__dirname,'gh-pages','introduccion.html'));
  });
});

//----------------------------

app.get('/error', function(req, res)
{
    var respuesta = error || "No se ha podido realizar la operación";
    res.render('error', { error: respuesta});
});

//----------------------------

app.get('/registro', function(req,res)
{
    res.render('registro.ejs');
});


app.get('/redirect_register', function(req,res)
{
    if(req.user != null)
    {
      if(req.user.username == 'admin')
      {
        res.redirect('/vista_administracion');
      }
    }
    else
    {
      res.render('home');
    }
});


app.get('/registro_return', function(req, res)
{
  controlador_usuario.create_user(req.query.username, req.query.password, req.query.displayName, (err) =>
  {
    if(err)
    {
      console.log("Err:"+err);
      error = "No se ha creado el usuario: "+err;
      res.redirect('/error');
    }
    res.redirect('/redirect_register');
  });
});

//----------------------------

app.get('/borrar_cuenta', function(req, res)
{
  controlador_usuario.borrar_cuenta(req.user.username, req.user.password, req.user.displayName, function(err)
  {
      if(err)
      {
        console.log(err);
        error = "No se ha borrado la cuenta."+err;
        res.redirect('/error');
      }
      res.redirect('/logout');
  });
});

//----------------------------

app.get('/redirect_login', function(req,res)
{
  if(req.user != null)
    res.render('login',{user: req.user});
  else
    res.render('home');
});

//----------------------------

app.get('/logout',function(req,res){
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

//----------------------------
// app.listen(process.env.PORT || 8080);
https.createServer(options, app).listen(8080, function () {
   console.log('Servidor running!');
});

module.exports = app;
