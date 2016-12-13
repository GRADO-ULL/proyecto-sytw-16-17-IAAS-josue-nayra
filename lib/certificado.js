"use strict"
const pem = require('pem');
const fs = require('fs-extra');
const path = require('path');
const basePath = process.cwd();
const inquirer = require('inquirer');

var variables_CSR = (()=>
{
    return new Promise((resolve,reject)=>
    {
      var schema = [
        {
          name: "keyBitSize",
          message: "Bits de la clave privada:",
          type: 'list',
          default: '1024',
          choices: ['1024','2048']
        },
        {
          name: "hash",
          message: "Tipo de hash:",
          type: "list",
          default: "sha256",
          choices: ["sha1", "md5", "sha256"]
        },
        {
          name: "password",
          message: "Password for the CSR(Certificate Sign Request):",
          type: "password"
        },
        {
          name: "country",
          message: "País:",
          default: 'ES'
        },
        {
          name: "state",
          message: "Estado",
          default: 'ES'
        },
        {
          name: "organization",
          message: "Organización:",
          default: "ULL"
        },
        {
          name: "email",
          message: "Enter your email:"
        }
      ];

      inquirer.prompt(schema).then((respuestas) =>
      {
        resolve(respuestas);
      });
    });
});

var crear_CSR = (() =>
{
    return new Promise((result, reject) =>
    {
        variables_CSR().then((resolve,reject)=>
        {
          pem.createCSR({keyBitSize: resolve.keyBitSize, hash: resolve.hash, clientKeyPassword: resolve.password, country: resolve.country, state: resolve.state, organization: resolve.organization, emailAdress: resolve.email}, (error, datos) =>
          {
              if(error){
                  console.log("Error: "+error);
                  reject(error);
              }
              var respuesta = {clientKey: datos.clientKey, csr: datos.csr};
              result(respuesta);
          });
        });
    })
});

var generar_certificado = (() =>
{
   return new Promise((resolve, reject) =>
   {
        if(!fs.existsSync(path.join(basePath,'certs','server.crt')))
        {
            console.log("Generando certificado...");
            crear_CSR().then((resolve2, reject2) => {
                var schema = [
                  {
                    name: "password_certificate",
                    message: "Password for the certificate:",
                    type: "password"
                  }
                ];

                inquirer.prompt(schema).then((respuestas) =>
                {
                      pem.createCertificate({serviceKey: resolve2.clientKey, serviceKeyPassword: respuestas.password_certificate, csr: resolve2.csr, days: 1, selfSigned: true,  }, (err,keys) =>
                      {
                        if(err){
                           console.log("Error: "+err);
                           reject(err);
                        }
                        // console.log("keys.serviceKey: "+keys.serviceKey);
                        // console.log("keys.certificate: "+keys.certificate);

                        //Crear ficheros para el certificado

                        fs.mkdir(path.join(basePath,'certs'), (err) =>
                        {
                          if(err){
                            console.log("Error: "+err);
                            reject(err);
                          }
                          console.log("Creando carpeta certificados");
                          fs.writeFile(path.join(basePath,'certs','server.key'), keys.serviceKey, (err) =>
                          {
                              if(err){
                                console.log("Error: "+err);
                                reject(err);
                              }
                              console.log("Creado fichero server.key");
                          });

                          fs.writeFile(path.join(basePath,'certs','server.crt'), keys.certificate,(err)=>
                          {
                            if(err){
                              console.log("Error: "+err);
                              reject(err);
                            }

                            console.log("Creado fichero sever.crt");
                          });
                        });

                        // var respuesta = {serviceKey: keys.serviceKey, certificate: keys.certificate};
                        resolve(fs.existsSync(path.join(basePath,'certs','server.crt')));
                    });
                });
            });
        }
        else
        {
            console.log("El certificado ya ha sido configurado previamente");
            resolve(fs.existsSync(path.join(basePath,'certs','server.crt')));
        }
    });
});

exports.generar_certificado = generar_certificado;
