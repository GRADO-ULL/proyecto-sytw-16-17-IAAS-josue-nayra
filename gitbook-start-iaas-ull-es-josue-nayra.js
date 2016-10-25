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
    console.log("Ip_maquina:"+ip_maquina);
    console.log("Source:"+source);
    console.log("Url:"+url);

    sshexec(`cd ${source}; git pull ${url} master`, {
      user: usuario,
      host: ip_maquina,
      key: '~/.ssh/iaas.pub'
    }, respuesta);
});

var initialize = ((ip_maquina,source, url, usuario) => {

    console.log("Método initialize del plugin deploy-iaas-ull-es");
    //
    var tarea_gulp = `\n\ngulp.task("deploy-iaas-ull-es", ["deploy"], function(){`+
             `\n       require("gitbook-start-iaas-ull-es-josue-nayra").deploy("${ip_maquina}", "${source}", "${url}");`+
             `\n});`;

    fs.readFile('gulpfile.js', "utf8", function(err, data) {
        if (err) throw err;
        // console.log(data);
        if(data.search("deploy-iaas-ull-es") != -1)
        {
          console.log("Ya existe una tarea de deploy-iaas-ull-es");
        }
        else
        {
          // console.log("No existe una tarea de deploy-iaas-ull-es");
          fs.appendFile(path.join(basePath,'gulpfile.js'), `${tarea_gulp}`, (err) => {
            if (err) throw err;
              console.log("Escribiendo tarea en gulpfile para próximos despliegues");
          });
        }
    });

    console.log("Creando fichero de clave pública...");
    exec("ssh-keygen -f iaas");
    // exec("scp iaas.pub  usuario@"+ip_maquina+":~/.ssh/", respuesta);
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
});

exports.deploy = deploy;
exports.initialize = initialize;
