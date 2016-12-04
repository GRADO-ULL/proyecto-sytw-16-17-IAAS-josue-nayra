const bcrypt = require('bcrypt-nodejs');
const path = require('path');
const models = require(path.join(process.cwd(),'models','models.js'));

var findByUsername = ((username_, password_, cb) => {
    models.User.find({where: {
        username: username_
    }})
    .then((datos) => {
        console.log(JSON.stringify(datos));
        if(datos) {
            console.log("Array respuesta no vacio");
            console.log("password_:"+password_);
            console.log("password en BD:"+datos.password);
            console.log("Comparacion:"+bcrypt.compareSync(password_,datos.password));
            if(bcrypt.compareSync(password_,datos.password))
            {
                console.log("Encontrado el usuario:"+JSON.stringify(datos));
                return cb(null, datos);
            }
            else
            {
              console.log("Los passwords no coinciden");
              return cb("Password no coinciden",false);
            }
          }
          else
          {
              console.log("La consulta no devuelve ningun usuario");
              return cb("La consulta no devuelve ningun usuario",false);
          }
      })
      .catch((error) =>
      {
        return cb(error,false);
      });
});

var change_password = ((username_,password_actual,new_password, cb) =>
{
  models.User.find({ where: { username: username_ } })
    .then((datos) =>
    {
      if(datos)
      {
        if(bcrypt.compareSync(password_actual, datos.password))
        {
          datos.updateAttributes({
            password: new_password
          })
          .then((respuesta)=>
          {
            // console.log("ACTUALIZADO PASSWORD:"+JSON.stringify(respuesta));
            models.User.find({where: {
                username: username_
            }}).then((datos) => {
                return cb(null);
            })
            .catch((error)=>
            {
                return cb(null);
            });
          })
          .catch((err)=>
          {
            return cb(err);
          });
        }
        else
        {
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
