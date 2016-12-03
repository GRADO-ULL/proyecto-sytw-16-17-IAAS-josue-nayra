"use strict";

const fs = require('fs-extra');
const path = require('path');
const basePath = process.cwd();
const Sync =  require('sync');

var copiar_files = ((cb) =>
{
  fs.copy(path.join(__dirname,'../template','app.js'), path.join(basePath, 'app.js'), (err) =>
  {
      if(err)
        return cb(err);
      console.log("Generando app.js");
      fs.copy(path.join(__dirname,'../template','views'), path.join(basePath,'views'), (err) =>
      {
        if(err)
          return cb(err);
        console.log("Generando directorio views/");
        //Copiamos ficheros necesarios para el uso de materialize
        fs.copy(path.join(__dirname,'../template','public'), path.join(basePath, 'public'), (err) =>
        {
          if(err)
            return cb(err);
          console.log("Generando directorio public/");
          fs.copy(path.join(__dirname,'../template','controllers'), path.join(basePath, 'controllers'), (err) =>
          {
            if(err)
              return cb(err);
            console.log("Generando directorio controllers/");
            fs.copy(path.join(__dirname,'../template','models'), path.join(basePath, 'models'), (err) =>
            {
              if(err)
                console.log("Error:"+err);
              console.log("Generando directorio models/");

              return cb(null);
            });
          });
        });
      });
  });
});

exports.crear_app = (() =>
{
    return new Promise((resolve,reject)=>
    {
      //Comprobamos si existen
      copiar_files((error) =>
      {
        if(error)
        {
          console.log("Error creando estructura de aplicación..."+error);
          reject(error);
        }

        if(fs.existsSync(path.join(basePath,'app.js')))
          if(fs.existsSync(path.join(basePath,'views')))
            if(fs.existsSync(path.join(basePath,'public')))
              if(fs.existsSync(path.join(basePath,'models')))
                if(fs.existsSync(path.join(basePath,'controllers')))
                {
                  console.log("Estructura creada con exito");
                  resolve(true);
                }
      });
    });
});
