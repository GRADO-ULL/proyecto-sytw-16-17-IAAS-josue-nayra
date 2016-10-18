var gulp = require('gulp');
var git = require('simple-git');
var install = require('gulp-install');
var shell = require('gulp-shell');

//---------------------------------------------------------------------------
// Tarea para subir al repositorio.

gulp.task('push', function(){
   git()
        .add('./*')
        .commit("Actualizando plugin para despliegue en iaas.")
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