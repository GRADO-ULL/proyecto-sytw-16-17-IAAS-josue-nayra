const bcrypt = require('bcrypt-nodejs');
const path = require('path');
const models = require(path.join(process.cwd(),'models','models.js'));

var findByUsername = ((username_, password_, cb) => {
    models.User.findAll({where: {
        username: username_
    }}).then((datos) => {
        console.log(JSON.stringify(datos));
        if(datos.length > 0) {
            console.log("Array respuesta no vacio");
            console.log("password_:"+password_);
            console.log("password en BD:"+datos[0].password);
            console.log("Comparacion:"+bcrypt.compareSync(password_,datos[0].password));
            if(bcrypt.compareSync(password_,datos[0].password))
            {
                console.log("Encontrado el usuario:"+JSON.stringify(datos[0]));
                return cb(null, datos[0]);
            }
            return cb(null,false);
        }
        return cb(null,false);
    });
});

var change_password = ((username_,password_actual,new_password, cb) =>
{
  models.User.find({ where: { username: username_ } })
    .then((datos) =>
    {
      if(datos)
      {
        console.log("Password actual query:"+password_actual);
        console.log("Password en base de datos:"+datos.password);

        if(bcrypt.compareSync(password_actual, datos.password))
        {
          datos.updateAttributes({
            password: new_password
          })
          .then((respuesta)=>
          {
            console.log("ACTUALIZADO PASSWORD:"+JSON.stringify(respuesta));
            models.User.findAll({where: {
                username: username_
            }}).then((datos) => {
                console.log("USUUUUUU:"+JSON.stringify(datos[0]));
                return cb(null);
            })
            .catch((error)=>
            {
                console.log("ea ea ea macarena");
                return cb(null);
            });
          })
          .catch((err)=>
          {
            console.log("ERROR ACTUALIZANDO PASSWORD:"+err);
            return cb(err);
          });
        }
        else
        {
            console.log("Passwords no coinciden");
            return cb(true);
        }
      }
    })
    .catch((err) =>
    {
        console.log("ERROR ACTUALIZANDO PASSWORD:"+err);
        return cb(err);
    });
});

var existe_usuario = ((username_, password_, displayName_, cb) => 
{
  models.User.find({where: {username: username_}})
      .then((user) => 
      {
        if (user) {
            return cb(null, user);
        }
        else {
          return cb(null, null);  
        }
        
      })
      .catch(function (err) {
          return cb(err, null);
      });
  
});

var create_user = ((username_, password_, displayName_, cb) =>
{
    existe_usuario(username_, password_, displayName_, (error,user) =>
    {
      if(error){
        return cb(error);
      }
      if(user){
        return cb("Ya existe el usuario");
      }
      
      models.User.create(
      {
        username: username_,
        password: password_,
        displayName: displayName_

      }).then((datos)=> {
          models.User.findAll({where: {
            username: username_,
            password: password_,
            displayName: displayName_
          }}).then((datos)=>
          {
            return cb(null);
          })
          .catch((err)=>
          {
            return cb(err);
          });
        })
        .catch((err)=>
        {
          return cb(err);
        });
    });
    
});

var borrar_cuenta = ((username_, password_, displayName_, cb) =>
{
    models.User.destroy({
      where: {
        username: username_,
        password: password_,
        displayName: displayName_
      }
    }).then(()=>
    {
      return cb(null);
    }).catch((error) =>
    {
      return cb(error);
    });
});

exports.findByUsername = findByUsername;
exports.change_password = change_password;
exports.create_user = create_user;
exports.borrar_cuenta = borrar_cuenta;
