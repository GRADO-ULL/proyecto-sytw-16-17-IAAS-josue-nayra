var gulp = require('gulp');
var git = require('simple-git');
var install = require('gulp-install');
var shell = require('gulp-shell');
var myArgs = require('minimist')(process.argv.slice(2));

var sshexec = require('ssh-exec');


//---------------------------------------------------------------------------
// Tarea para subir al repositorio.

gulp.task('push', function(){
    var mensaje_commit = myArgs.mensaje || "Actualizando plugin para despliegue en iaas.";
    git()
        .add('./*')
        .commit(mensaje_commit)
        .push('origin','master');
});


//---------------------------------------------------------------------------
// Tarea para la instalación de dependencias provistas en el package.json

gulp.task('instalar_recursos', function(){
   gulp.src(['./package.json']).pipe(install()); 
});

//---------------------------------------------------------------------------
// Tarea para publicar el paquete

gulp.task('deploy', ['push'], function(){
    return gulp.src('')
            .pipe(shell([
                'npm publish'
            ]))
});