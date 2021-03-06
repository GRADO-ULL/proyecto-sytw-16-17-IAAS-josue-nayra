# Proyecto. Sistemas y Tecnologías Web
-------------
## Nuevas funcionalidades en los paquetes IAAS y Heroku
---------------------------------------
#### Paquete para el despliegue en Heroku:

Modificaciones realizadas en el plugin para el despliegue en Heroku. [Repositorio](https://github.com/ULL-ESIT-SYTW-1617/proyecto-sytw-16-17-josue-nayra)

- **Autenticación con: Google, Twitter, Facebook y Github.**

Por defecto el usuario propietario del Gitbook tendrá habilitada la autenticación local, además de las expuestas anteriormente en función de lo que desee.

La información relativa a la autenticación con Google, Twitter, Facebook y Github se dispondrá en un archivo "auth.json", en cual el usuario rellenará los datos relativos a la autenticación (clientID y clientSecret).

En función de los tipos de autenticación que elija el autor del libro aparecerán en el login nuevos botones para hacer la autenticación con cada uno de ellos.


- **Vista administrador para la gestión de los usuarios que visitan el libro por parte del autor del mismo.**

El administrador podrá crear nuevos usuarios desde esta vista, asignando un 'usuario', un 'password' y un 'displayName', como también borrar usuarios de los existentes en la base de datos a partir del 'id'.

En esta vista se facilitará una tabla al administrador con todos los usuarios existentes en la base de datos local.
Para cada uno de ellos se podrá visualizar su 'id', 'usuario', 'nombre completo' y las visitas que ha realizado al Gitbook.

Los cambios que se produzcan en esta sección de la aplicación se visualizarán en la tabla de usuarios.


- **Opción para elegir el tipo de base de datos: Sequelize o Dropbox**.

Se ha reestructurado el código para dar la opción al autor del libro de elegir la base de datos que desee, tanto Sequelize como Dropbox.

En función de la elección del usuario con su base de datos se generará un controlador para los usuarios diferente en función de si la base de datos es Sequelize o Dropbox.

Para el caso de **Dropbox** el usuario deberá disponer de un fichero como base de datos a su cuenta personal de Dropbox en formato JSON, siguiendo la siguiente estructura:

```json
{
  "users":[
    {
      "id": 1,
      "username": "admin",
      "password": "****",
      "displayName": "Administrador",
      "visitasGitbook": 0
    }
  ]
}
```

El plugin exigirá al usuario propietario del Gitbook la introducción de un token para utilizar la API de Dropbox y el link del archivo de base de datos que se deberá encontrar en su perfil.
Para generar un token para el Dropbox puede acceder al siguiente enlace: [Token Dropbox](https://dropbox.github.io/dropbox-api-v2-explorer/).
Estos datos se almacenarán en un directorio oculto: *~/.dropbox*, en un fichero "dropbox.json".


Para el caso de **Sequelize** el usuario no tendrá que configurar nada. El dialecto utilizado por parte de este ORM es Sqlite3.


- **Nueva tarea Gulp para administrar el servidor: "destroy" elimina la aplicación y el repositorio remoto de Heroku.**

Esta tarea se invoca ejecutando:

```bash
$ gulp destroy heroku
```

Utilizará la API de Heroku para borrar la aplicación.

-------------------------------------

#### Paquete para el despliegue en la máquina IAAS:

[Paquete gitbook-start-josue-nayra](https://github.com/ULL-ESIT-SYTW-1617/crear-repositorio-en-github-josue-nayra.git)

Se han añadido nuevas tareas gulp para facilitar las labores de configuración y administración al usuario propietario del Gitbook:

- **gulp deploy-iaas-ull-es**:

Esta tarea permitirá actualizar el contenido del gitbook que se encuentra alojado en el IAAS, ejecutando un git pull sobre el repositorio en Github. Es importante tener en cuenta de que éste último debe estar siempre actualizado para que esta tarea se ejecute eficientemente.

- **gulp install-iaas-ull-es**:

Posteriormente al despliegue inicial del gitbook en el IAAS mediante la ejecución del comando *gitbook-start --deploy iaas-ull-es**, esta tarea nos permite instalar todas las dependencias y paquetes necesarios en la máquina remota para poder ejecutar y lanzar la aplicación sin problemas.

- **gulp run-iaas-ull-es**:

En este caso, a partir de esta tarea podemos ejecutar el servidor en la máquina remota evitando la necesidad de acceder al IAAS y hacerlo manualmente, lo cual nos puede resultar bastante útil cuando el usuario realice testeos y pruebe la efectividad del despliegue.

- **gulp destroy-iaas-ull-es**:

En el caso de que el usuario decida eliminar el despliegue del IAAS, se ha facilitado esta tarea que realizará las siguientes cuestiones:

    - Eliminará el contenido del directorio que contiene el gitbook en la máquina remota en el IAAS.

    - Eliminará la clave que hemos transferido durante la etapa inicial del despliegue a la máquina remota.

### Pasos a seguir

1- Instalación del paquete **gitbook-start-josue-nayra**.

```bash
$ npm install -g gitbook-start-josue-nayra
```

2- Construir la estructura inicial del libro con el paquete instalado, por tanto se creará la jerarquía de directorios conteniendo los scripts y ficheros markdown para el libro

```bash
$ gitbook-start -d <directorio> --autor <nombre_autor> --name <nombre_libro>
```

*La opción -d <directorio> creará automáticamente un nuevo repositorio en Github.*


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


6.- Previamente a realizar el despliegue, es importante acceder al package.json de nuestro gitbook y rellenar los parámetros necesarios para poder configurar el acceso a la máquina IAAS:

```json
"IAAS": {
          "IP": " ",
          "path": " ",
          "usuarioremoto": " ",
          "authentication": "Si|No"
},
```

*NOTA: En el caso de que el usuario ignore este paso, el plugin pedirá por teclado estos parámetro y, una vez introducidos, se añadirán al package.json*

7.- Construimos el gitbook.

```bash
$ gulp build
```

8.- Actualizamos repositorio en Github:

```bash
$ gulp push
```


9- Ejecutar el plugin:

```bash
$ gitbook-start --deploy iaas-ull-es
```


10- Una vez ejecutado el comando anterior, se generará automáticamente en el gulpfile.js una tarea llamada
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

* Para comprobar que se ha realizado el despliegue correctamente debemos acceder en el navegador a nuestra app siguiendo el formato:

```
"https://<ip de máquina IAAS>:<PORT>"
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

* **deploy iaas-ull-es**

Tarea generada posteriormente a la realización y ejecución del comando gitbook-start --deploy, que permite al usuario realizar posteriores despliegues y actualizaciones de su gitbook en la máquina remota con gulp.
Por ejemplo, en el caso de que el usuario despliegue en el IAAS, después de haber desplegado con la opción gitbook-start --deploy iaas-ull-es, en el gulpfile se generará una tarea
con el nombre deploy-iaas-ull-es.

```
$ gulp deploy-iaas-ull-es
```

---------------------------------------------------------------------------------------------------------------

### Enlaces

- [Campus virtual](https://campusvirtual.ull.es/1617/course/view.php?id=1175)

- [Descripción del proyecto](https://crguezl.github.io/ull-esit-1617/proyectos/sytw/)

- [Publicación del paquete en npm](https://www.npmjs.com/package/gitbook-start-iaas-ull-es-josue-nayra)

- [Repositorio plugin de Heroku](https://github.com/ULL-ESIT-SYTW-1617/proyecto-sytw-16-17-josue-nayra.git)

- [Publicación plugin de Heroku](https://www.npmjs.com/package/gitbook-start-heroku-josue-nayra)

- [Repositorio en Github.com del paquete gitbook-start](https://github.com/ULL-ESIT-SYTW-1617/crear-repositorio-en-github-josue-nayra.git)



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
