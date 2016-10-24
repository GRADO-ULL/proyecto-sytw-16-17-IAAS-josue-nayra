"use strict"
const exec = require('ssh-exec');
// const exec_shell = require('exec');
const basePath = process.cwd();
const fs = require('fs-extra');
const path = require('path');
var exec_shell = require('child_process').exec;

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

    exec(`cd ${source}; git pull ${url} master`, {
      user: usuario,
      host: ip_maquina,
      key: '~/.ssh/id_rsa.pub'
    }, respuesta);
});

var initialize = ((ip_maquina,usuario,source, url) => {

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

    // exec(`cd ~/.ssh/; cp iaas.pub authorized_keys`, {
    //   user: usuario,
    //   host: ip_maquina,
    //   key: '~/.ssh/id_rsa.pub'
    // }, respuesta);

    //Creamos ficheros de clave pública
    // exec_shell(['cd ~/.ssh/; ssh-keygen -f iaas'], function(err, out, code) {
    //   if (err instanceof Error)
    //     throw err;
    //   process.stderr.write(err);
    //   process.stdout.write(out);
    //   process.exit(code);
    // }).then(()=>{
    //         exec_shell([`scp ~/.ssh/id_rsa.pub ${usuario}@${ip_maquina}:~/.ssh/`], function(err, out, code) {
    //         if (err instanceof Error)
    //             throw err;
    //         process.stderr.write(err);
    //         process.stdout.write(out);
    //         process.exit(code);
    //         });
    // }).then(() => {
    //     exec(`cd ~/.ssh/; cp id_rsa.pub authorized_keys`, {
    //       user: usuario,
    //       host: ip_maquina,
    //       key: '~/.ssh/id_rsa.pub'
    //     }, respuesta);
    // });
});

exports.deploy = deploy;
exports.initialize = initialize;
