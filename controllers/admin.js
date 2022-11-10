const Admin = require ('../models/admin');
const bcypt = require ('bcryptjs');
const passport = require ('passport');
let fs = require ('fs');

exports.getSigninPage = (req, res) => {
  res.render ('sign_in');
};
exports.getSignupPage = (req, res) => {
  res.render ('sign_up');
};

// handle
exports.postSignup = async (req, res) => {
  const {full_name, password, password2, email} = req.body;
  let errors = [];
  if (password !== password2) {
    errors.push ({msg: 'Passwords do not math!!!'});
  }
  if (password.length < 8) {
    errors.push ({msg: 'Passwords should be at least 6 characters!!!'});
  }
  if (errors.length > 0) {
    res.render ('sign_up', {
      errors,
      full_name,
      email,
    });
  } else {
    await Admin.findOne ({email: email}).then (admin => {
      if (admin) {
        errors.push ({msg: 'E-mail is already exist'});
        res.render ('sign_up', {
          errors,
          full_name,
          email,
        });
      } else {
        //add Admin
        const newAdmin = new Admin ({
          full_name,
          email,
          password,
        });
        bcypt.genSalt (10, (err, salt) =>
          bcypt.hash (newAdmin.password, salt, (err, hash) => {
            if (err) throw err;
            //set Password to hash
            newAdmin.password = hash;
            //saveUser
            newAdmin
              .save ()
              .then (admin => {
                console.log ('Save succesfull');
                req.flash (
                  'success_msg',
                  'You are now registered and can login'
                );
                res.redirect ('sign_in');
              })
              .catch (err => {
                console.log (err);
              });
          })
        );
      }
    });
  }
};

exports.getProfile = (req, res) => {
  Admin.findOne (req.user._id)
    .then (admin => {
      if (admin) {
        res.render ('profile', {
          admin: admin.toJSON (),
          activeProfile: true,
          user: req.user.toJSON(),
        });
      }
    })
    .catch (err => {
      console.log (err);
    });
};
exports.postProfile = (req, res) => {
  let errors = [];
  let id = req.user._id;
  const {email, full_name, birth, phone, address, about} = req.body;
  if (req.files) {
    let uploadedFile = req.files.image;
    let fileExtension = uploadedFile.mimetype.split ('/')[1];
    let image_name = id + '.' + fileExtension;
    if (
      uploadedFile.mimetype === 'image/png' ||
      uploadedFile.mimetype === 'image/jpeg' ||
      uploadedFile.mimetype === 'image/gif'
    ) {
      Admin.findById (id).then (admin => {
        if (!admin) {
          res.redirect ('profile');
        } else {
          uploadedFile.mv (`public/img/${image_name}`, err => {
            if (err) throw err;
            admin.email = email;
            admin.full_name = full_name;
            admin.birth = birth;
            admin.phone = phone;
            admin.address = address;
            admin.about = about;
            admin.image_path = image_name;
            admin.save (err => {
              if (!err) {
                req.flash ('success_msg', 'You are update profile success!');
                res.redirect ('profile');
              } else {
                req.flash ('error_msg', 'Update profile error!');
                res.redirect ('profile');
              }
            });
          });
        }
      });
    } else {
      errors.push ({
        msg: "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.",
      });
      res.render ('profile', {
        admin: req.user.toJSON (),
        activeProfile: true,
        user: req.user.toJSON(),
      });
    }
  } else {
    Admin.findOneAndUpdate ({_id: id}, req.body, {new: true}, (err, doc) => {
      if (!err) {
        req.flash ('success_msg', 'You are update profile success!');
        res.redirect ('profile');
      } else {
        req.flash ('error_msg', 'Update profile error!');
        res.redirect ('profile');
      }
    });
  }
};
exports.postSignin = (req, res, next) => {
  passport.authenticate ('local', {
    successRedirect: 'dashboard',
    failureRedirect: 'sign_in',
    failureFlash: true,
  }) (req, res, next);
};
exports.getLogOut = async (req, res) => {
  await req.logout ();
  await req.flash ('success_msg', 'You are logged out');
  await res.redirect ('sign_in');
};
