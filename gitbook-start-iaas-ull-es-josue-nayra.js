"use strict"

const exec = require('child_process').exec;

console.log("File gitbook-start-iaas-ull-es.js");

var respuesta = ((error, stdout, stderr) => 
{
    if (error)
        console.error("Error:"+error);
    console.log("Stderr:"+stderr);
    console.log("Stdout:"+stdout);
});

var deploy = ((ip_maquina,source,url) => 
{
    console.log("Realizando deploy...");
    console.log("Ip_maquina:"+ip_maquina);
    console.log("Source:"+source);
    console.log("Url:"+url);
    
    // exec(`ssh ${ip_maquina}; cd ${source}; git clone ${url} master`, respuesta);
    exec(`ssh ${ip_maquina}; cd ${source}; git pull ${url} master`, respuesta);
});

exports.deploy = deploy;