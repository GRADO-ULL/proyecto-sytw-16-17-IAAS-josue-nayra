"use strict";
const path = require('path');
const basePath = process.cwd();

const pkj = require(path.join(basePath,'package.json'));
var data = [];

//Tarea para desplegar en el IAAS, es decir, actualizar el contenido del gitbook en la máquina remota(IAAS)
var deploy = new Object({
    nombre: "deploy-iaas-ull-es",
    tarea: `\n\ngulp.task("deploy-iaas-ull-es", ["deploy"], function(){`+
           `\n       require("gitbook-start-iaas-ull-es-josue-nayra").deploy();`+
           `\n});`
});

var instalando_dependencias = new Object(
{
    nombre: "install-iaas-ull-es",
    tarea: `\n\ngulp.task("install-iaas-ull-es",function(){`+
            `\n     sshexec('cd ${pkj.IAAS.path}; npm install', {`+
            `\n       user: "${pkj.IAAS.usuarioremoto}",`+
            `\n       host: "${pkj.IAAS.IP}",`+
            `\n       key: '~/.ssh/iaas.pub'`+
            `\n     }, respuesta);\n`+
            `\n});`
});

//Ver que pasa con el password
var run_app =  new Object({
  nombre: "run-iaas-ull-es",
  tarea: `\n\ngulp.task("run-iaas-ull-es", function(){`+
          `\n     sshexec('cd ${pkj.IAAS.path}; node app.js',{`+
            `\n     user: "${pkj.IAAS.usuarioremoto}",`+
            `\n     host: "${pkj.IAAS.IP}",`+
            `\n     key: '~/.ssh/iaas.pub'`+
          `\n     }, respuesta);`+
          `\n});`
});

var destroy = new Object({
  nombre: "destroy-iaas-ull-es",
  tarea: `\n\ngulp.task("destroy-iaas-ull-es", function(){`+
          `\n     sshexec('sudo rm -r ${pkj.IAAS.path}; sudo rm -r ~/.ssh/iaas.pub',{`+
            `\n     user: "${pkj.IAAS.usuarioremoto}",`+
            `\n     host: "${pkj.IAAS.IP}",`+
            `\n     key: '~/.ssh/iaas.pub'`+
          `\n     }, respuesta);`+
          `\n});`
});

data.push(deploy);
data.push(instalando_dependencias);
data.push(run_app);
data.push(destroy);

exports.tareas = data;
