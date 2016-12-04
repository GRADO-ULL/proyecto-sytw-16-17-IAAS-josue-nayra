# Práctica 9. Sistemas y Tecnologías Web

## Plugin: gitbook-start-iaas-ull-es-josue-nayra


Este plugin provee al paquete **gitbook-start-josue-nayra** del mecanismo necesario para realizar el despliegue en los servidores de **iaas-ull-es** de la ULL.

[Paquete gitbook-start-josue-nayra](https://github.com/ULL-ESIT-SYTW-1617/practica-localstrategy-y-base-de-datos-iaas-ull-es-josue-nayra.git)

### Pasos a seguir

1- Instalación del paquete **gitbook-start-josue-nayra**.
```bash
$ npm install -g gitbook-start-josue-nayra
```


2- Construir la estructura inicial del libro con el paquete instalado, por tanto se creará la jerarquía de directorios conteniendo los scripts y ficheros markdown para el libro
```bash
$ gitbook-start -d <directorio> --autor <nombre_autor> --name <nombre_libro> --url <url_repo>
```


3- Colocarse en la carpeta creada para nuestro libro e instalar las dependencias. 
```bash
$ cd <directorio>
$ npm install
```


4- Instalar el plugin requerido como dependendecia con la opción --save, como por ejemplo: **gitbook-start-iaas-ull-es-josue-nayra** para el despliegue en iaas.
    
```bash
$ npm install --save gitbook-start-iaas-ull-es-josue-nayra 
```


5- Para la actualización de nuestro repositorio podemos ejecutar una de las tareas descritas en el gulpfile: **gulp push --mensaje <mensaje commit>**.


7.- Previamente a realizar el despliegue, es importante acceder al package.json de nuestro gitbook y rellenar los parámetros necesarios para poder configurar el acceso a la máquina IAAS:

```json
"IAAS": {
          "IP": " ",
          "path": " ",
          "usuarioremoto": " ",
          "authentication": " "
},
```

*NOTA: En el caso de que el usuario ignore este paso, el plugin pedirá por teclado estos parámetro y, una vez introducidos, se añadirán al package.json*


8- Ejecutar el plugin:
   
```bash
$ gitbook-start --deploy iaas-ull-es
```


9- Una vez ejecutado el comando anterior, se generará automáticamente en el gulpfile.js una tarea llamada 
"deploy-iaas-ull-es" que permitirá al usuario actualizar el contenido de la máquina IAAS.

```javascript
gulp.task("deploy-iaas-ull-es", function(){
    require(path.join(basePath, 'node_modules','gitbook-start-iaas-ull-es-josue-nayra')).deploy();
});
```


**IMPORTANTE:**

El plugin se encargará de realizar las siguientes tareas en el initialize:

* Copiar el fichero de clave pública 'iaas.pub' en la máquina del iaas para poder acceder a la máquina.

* Se clonará automáticamente el repositorio que contiene el libro.


El usuario deberá:

* Tener su máquina IAAS encendida. 

* El despliegue en el IAAS se realizará por defecto en el puerto 8080. En el caso que quiera cambiarse hay que acceder al fichero app.js y modificarlo.

* Para poder visualizar nuestro gitbook en la máquina IAAS a través del navegador, debemos previamente hacer un npm install de todas las dependencias necesarias en el directorio que hayamos dispuesto en la máquina para alojar nuestro gitbook. Podemos ejecutar el siguiente comando desde nuestra máquina local:

```bash
 ssh <usuarioremoto>@<ip_maquinaIAAS> 'cd <directorio del gitbook>; npm install';
```


### Tareas Gulp


* **push**

Tarea habilitada para que el usuario pueda actualizar el repositorio que contiene el gitbook. Está disponible una opción --mensaje para especificar el mensaje del commit.

```bash
$ gulp push --mensaje <mensaje del commit>
```

* **deploy**

Tarea deploy genérica que actualiza las gh-pages del gitbook.
```
$ gulp deploy
```

* **deploy --iaas**

Tarea generada posteriormente a la realización y ejecución del comando gitbook-start --deploy, que permite al usuario realizar posteriores despliegues y actualizaciones de su gitbook en la máquina remota con gulp.
Por ejemplo, en el caso de que el usuario despliegue en el IAAS, después de haber desplegado con la opción gitbook-start --deploy iaas-ull-es, en el gulpfile se generará una tarea
con el nombre deploy-iaas-ull-es.

```
$ gulp deploy-<máquina en la se ha desplegado previamente>
```



---------------------------------------------------------------------------------------------------------------

### Enlaces

- [Campus virtual](https://campusvirtual.ull.es/1617/course/view.php?id=1175)

- [Descripción de la práctica](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/practicas/practicaplugin.html)

- [Publicación del paquete en npm](https://www.npmjs.com/package/gitbook-start-iaas-ull-es-josue-nayra)

- [Repositorio plugin](https://github.com/ULL-ESIT-SYTW-1617/gitbook-start-iaas-ull-es-josue-nayra)

- [Repositorio en Github.com del paquete gitbook-start](https://github.com/ULL-ESIT-SYTW-1617/nueva-funcionalidad-para-el-paquete-npm-plugins-josue-nayra)



### Referencias

- [Tutorial para publicar paquetes nodejs](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/nodejspackages.html)

- [Gulp](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/gulp/)

- [Uso de templates](https://www.npmjs.com/package/ejs)

- [Fyle System de Nodejs para el manejo de archivos](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/fs.html)

- [Construyendo package.json](https://docs.npmjs.com/files/package.json)



### Integrantes

- Josué Toledo Castro
    [Github personal](www.github.com/JosueTC94)
- María Nayra Rodríguez Pérez
    [Github personal](www.github.com/alu0100406122)