"use strict"
const sshexec = require('ssh-exec');
// const exec_shell = require('exec');
const basePath = process.cwd();
const fs = require('fs-extra');
const path = require('path');
const pkj = require(path.join(basePath,'package.json'));
const inquirer = require('inquirer');
const jsonfile = require('jsonfile');
const estructura_app = require(path.join(__dirname,'lib','crear_app.js'));

var exec = require('child_process').exec;
var scp = require('scp');

var cert = require(path.join(__dirname,'lib','certificado.js'));


//-----------------------------------------------------------------------------------------------------------------

var respuesta = ((error, stdout, stderr) =>
{
    console.log("Respuesta del servidor:");
    if (error)
        console.error("Error:"+error);
    if(stderr)
      console.log(stderr);
    if(stdout)
      console.log(stdout);
});

//-----------------------------------------------------------------------------------------------------------------

var deploy = (() =>
{
    console.log("Realizando deploy...");

    var ip_maquina = pkj.IAAS.IP;
    var dir = pkj.IAAS.path;
    var url = pkj.repository.url;
    var usuario = pkj.IAAS.usuarioremoto;

    console.log("Ip_maquina:"+ip_maquina);
    console.log("Source:"+path);
    console.log("Url:"+url);
    console.log("Usuario:"+usuario);

    let c1 = url.split(".git");
    let c2 = c1[0].split("/");
    let final = c2[c2.length-1];

    sshexec(`cd ${final}; git pull ${url} master`, {
      user: usuario,
      host: ip_maquina,
      key: path.join(process.env.HOME,'.ssh','iaas')
    }, respuesta);
});

//-----------------------------------------------------------------------------------------------------------------

var escribir_gulpfile = (() =>
{
   return new Promise((resolve,reject)=>
   {
      var tarea_gulp = `\n\ngulp.task("deploy-iaas-ull-es", ["deploy"], function(){`+
                `\n       require("gitbook-start-iaas-ull-es-josue-nayra").deploy();`+
                `\n});`;

      // var tarea_gulp1 = `\n\nsshexec('cd ${pkj.IAAS.path}; npm install', {`+
      //                   `\n  user: ${pkj.IAAS.usuarioremoto},`+
      //                   `\n  host: ${pkj.IAAS.IP},`+
      //                   `\n  key: '~/.ssh/iaas.pub'`+
      //                   `\n  }, respuesta);\n`;

       fs.readFile('gulpfile.js', "utf8", function(err, data) {
           if (err) throw err;
           // console.log(data);
           if(data.search("deploy-iaas-ull-es") != -1)
           {
             console.log("Ya existe una tarea de deploy-iaas-ull-es");
             resolve(tarea_gulp);
           }
           else
           {
             // console.log("No existe una tarea de deploy-iaas-ull-es");
             fs.appendFile(path.join(basePath,'gulpfile.js'), `${tarea_gulp}`, (err) => {
               if (err) throw err;
                 console.log("Escribiendo tarea en gulpfile para próximos despliegues");
                 resolve(tarea_gulp);
             });
           }
       });
   });
});


//-----------------------------------------------------------------------------------------------------------------

var obtener_variables= (()=>
{
  return new Promise((resolve,reject)=>
  {
      //Comprobamos que el package.json tiene los atributos adecuados

      if((pkj.IAAS.IP).match(/\S/g) && (pkj.IAAS.path).match(/\S/g) && (pkj.IAAS.usuarioremoto).match(/\S/g) && (pkj.IAAS.authentication).match(/\S/g))
      {
        console.log("Sección IAAS en package.json rellenada correctamente");
        resolve({"IP": pkj.IAAS.IP, "path": pkj.IAAS.path, "usuarioremoto":pkj.IAAS.usuarioremoto,"authentication": pkj.IAAS.authentication, "url": pkj.repository.url});
      }
      else
      {
        console.log("Campos vacios");
        var schema =
        [
            {
              name: "IP",
              message: "Introduzca su IAAS IP:"
            },
            {
              name: "path",
              message: "Introduzca su IAAS path:"
            },
            {
              name: "usuarioremoto",
              message: "Introduzca su IAAS user:"
            },
            {
              name: "authentication",
              message: "Quiere autenticacion?",
              type: 'list',
              default: 'Si',
              choices: ['Si', 'No']
            }
        ];

        inquirer.prompt(schema).then((respuestas) =>
        {
              //Escribimos en el package.json los valores adecuadamente
              fs.readFile(path.join(basePath,'package.json'),(err,data) =>
              {
                  if(err)
                    throw err;

                  var datos = JSON.parse(data);

                  datos.IAAS.IP = respuestas.IP;
                  datos.IAAS.path = respuestas.path;
                  datos.IAAS.usuarioremoto = respuestas.usuarioremoto;
                  datos.IAAS.authentication = respuestas.authentication;

                  jsonfile.spaces = 10;
                  jsonfile.writeFileSync(path.join(basePath,'package.json'),datos,{spaces: 10});
              });

              resolve({"IP": respuestas.IP, "path": respuestas.path, "authentication": respuestas.authentication});
        });
      }
  });
});

//-----------------------------------------------------------------------------------------------------------------

var preparar_despliegue = (() => {
  return new Promise((resolve, reject) => {
      if(fs.existsSync(path.join(basePath,'gh-pages','index.html')))
      {
        fs.rename(path.join(basePath,'gh-pages','index.html'), path.join(basePath,'gh-pages','introduccion.html'), (err) => {
          if (err) {
            console.log(err);
            reject(err);
          }
          resolve(fs.existsSync(path.join(basePath,'gh-pages','introduccion.html')));
        });
      }
      else
      {
          if(fs.existsSync(path.join(basePath,'gh-pages','introduccion.html')))
          {
            resolve(fs.existsSync(path.join(basePath,'gh-pages','introduccion.html')));
          }
          else
          {
            console.log("No existe gh-pages... Debe ejecutar gulp build para construir el libro");
          }
      }
  });
});

//-----------------------------------------------------------------------------------------------------------------

var conexion_IAAS = ((usuario, ip_maquina, path, url)=>
{
      console.log("Creando fichero de clave pública...");
      exec("ssh-keygen -f iaas");
      // exec("scp iaas.pub  usuario@"+ip_maquina+":~/.ssh/", respuesta);
      var options = {
        file: 'iaas.pub',
        user: usuario,
        host: ip_maquina,
        port: '22',
        path: '~/.ssh/'
      };

      scp.send(options, function (err) {
        if (err)
        {
          console.log(err);
          reject(err);
        }
        else
        {
          console.log('Archivo iaas.pub se ha transferido a la máquina IAAS.');
          exec('mv iaas.pub ~/.ssh/');
          exec('mv iaas ~/.ssh');
        }
      });

      console.log("Clonando Gitbook en maquina IAAS");

      sshexec(`cd ${path}; git clone ${url}`, {
        user: usuario,
        host: ip_maquina,
        key: '~/.ssh/iaas.pub'
      }, respuesta);
});

//-----------------------------------------------------------------------------------------------------------------

var initialize = (() => {

    console.log("Método initialize del plugin deploy-iaas-ull-es");

    cert.generar_certificado().then((resolve,reject) =>
    {
      console.log("----------------------------");
      obtener_variables().then((resolve1,reject1)=>
      {
          console.log("----------------------------");
          preparar_despliegue().then((resolve2,reject2) =>
          {
            escribir_gulpfile().then((resolve3,reject3)=>
            {
                console.log("----------------------------");
                estructura_app.crear_app().then((resolve4,reject4)=>
                {
                    console.log("----------------------------");
                    if(resolve4 && !reject4)
                      conexion_IAAS(resolve1.usuarioremoto, resolve1.IP, resolve1.path, resolve1.url);
                });
            });
          });
      });
    });
});

exports.deploy = deploy;
exports.initialize = initialize;
