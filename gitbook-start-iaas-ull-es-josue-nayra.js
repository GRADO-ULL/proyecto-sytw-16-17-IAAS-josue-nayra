"use strict"
const sshexec = require('ssh-exec');
// const exec_shell = require('exec');
const basePath = process.cwd();
const fs = require('fs-extra');
const path = require('path');
var exec = require('child_process').exec;
var scp = require('scp');

// console.log("File gitbook-start-iaas-ull-es.js");

var respuesta = ((error, stdout, stderr) =>
{
    if (error)
        console.error("Error:"+error);
    console.log("Stderr:"+stderr);
    console.log("Stdout:"+stdout);
});

var deploy = ((ip_maquina,source,url,usuario) =>
{
    console.log("Realizando deploy...");
    // console.log("Ip_maquina:"+ip_maquina);
    // console.log("Source:"+source);
    // console.log("Url:"+url);

    let c1 = url.split(".git");
    let c2 = c1[0].split("/");
    let final = source+c2[c2.length-1];

    sshexec(`cd ${final}; git pull ${url} master`, {
      user: usuario,
      host: ip_maquina,
      key: '~/.ssh/iaas.pub'
    }, respuesta);
});

var escribir_gulpfile = (() =>
{
   return new Promise((resolve,reject)=>
   {
      var tarea_gulp = `\n\ngulp.task("deploy-iaas-ull-es", ["deploy"], function(){`+
                `\n       require("gitbook-start-iaas-ull-es-josue-nayra").deploy();`+
                `\n});`;

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

var obtener_variables= (()=>
{
  return new Promise((resolve,reject)=>
  {
      //Comprobamos que el package.json tiene los atributos adecuados

      if((pkj.IAAS.IP).match(/\S/g) && (pkj.IAAS.path).match(/\S/g) && (pkj.IAAS.usuarioremoto).match(/\S/g) && (pkj.IAAS.authentication).match(/\S/g))
      {
        console.log("Campos rellenados correctamente");
        resolve({"IP": pkj.IAAS.IP, "path": pkj.IAAS.path, "usuarioremoto":pkj.IAAS.usuarioremoto,"authentication": pkj.IAAS.authentication, "url": pkj.repository.url});
      }
      else
      {
        console.log("Campos vacios");
        var schema =
        [
            {
              name: "IP",
              message: "Enter your IAAS IP:"
            },
            {
              name: "path",
              message: "Enter your IAAS path:"
            },
            {
              name: "usuarioremoto",
              message: "Enter your IAAS user:"
            },
            {
              name: "authentication",
              message: "Do you want to authentication?",
              type: 'list',
              default: 'Yes',
              choices: ['Yes', 'No']
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

var initialize = (() => {

    console.log("Método initialize del plugin deploy-iaas-ull-es");

    console.log("Creando fichero de clave pública...");
    exec("ssh-keygen -f iaas");

    obtener_variables().then((resolve,reject)=>
    {
        console.log("Resolve:"+JSON.stringify(resolve));
        escribir_gulpfile().then(()=>
        {
            console.log("Escribiendo en gulfile. Promise");
            var options = {
              file: 'iaas.pub',
              user: usuario,
              host: ip_maquina,
              port: '22',
              path: '~/.ssh/'
            }
            scp.send(options, function (err) {
              if (err) console.log(err);
              else
              {
                console.log('Archivo iaas.pub se ha transferido a la máquina IAAS.');
                exec('mv iaas.pub ~/.ssh/');
                exec('mv iaas ~/.ssh');
              }
            });

            console.log("Clonando Gitbook en maquina IAAS");

            sshexec(`cd ${source}; git clone ${url}`, {
              user: usuario,
              host: ip_maquina,
              key: '~/.ssh/iaas.pub'
            }, respuesta);
        });
    });
});

exports.deploy = deploy;
exports.initialize = initialize;
