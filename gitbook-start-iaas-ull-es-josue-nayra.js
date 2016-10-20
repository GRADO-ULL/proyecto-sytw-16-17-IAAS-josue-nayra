"use strict"
const exec = require('ssh-exec');

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

    exec('cd src/sytw/migitbook/; git pull origin master', {
      user: 'usuario',
      host: '10.6.128.176',
      key: '~/.ssh/id_rsa.pub'
    }, respuesta);
});

exports.deploy = deploy;
