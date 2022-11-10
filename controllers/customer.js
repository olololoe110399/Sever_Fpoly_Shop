const {v4: uuidv4} = require ('uuid');
const Customer = require ('../models/customer');
const bcypt = require ('bcryptjs');
let fs = require ('fs');

exports.getCustomers = (req, res, next) => {
  Customer.find ({}).then (customers => {
    res.render ('customers', {
      customers: customers.map (customers => customers.toJSON ()),
      activeCustomers: true,
      user: req.user.toJSON (),
    });
  });
};

//===================================================================

//====================================================================
exports.getCustomerCreatPage = (req, res, next) => {
  res.render ('add_customer', {
    activeCustomers: true,
    user: req.user.toJSON (),
  });
};
exports.postCustomer = async (req, res, next) => {
  console.log (req.body);
  let errors = [];
  const {
    full_name,
    password,
    password2,
    username,
    date,
    address,
    phone,
  } = req.body;
  let uploadedFile = req.files.image;
  let fileExtension = uploadedFile.mimetype.split ('/')[1];
  let image_path = uuidv4 () + '.' + fileExtension;
  if (password !== password2) {
    errors.push ({msg: 'Passwords do not math!!!'});
  }
  if (password.length < 8) {
    errors.push ({msg: 'Passwords should be at least 6 characters!!!'});
  }
  if (errors.length > 0) {
    res.render ('add_customer', {
      errors,
      full_name,
      username,
      date,
      address,
      phone,
      activeCustomers: true,

      user: req.user.toJSON (),
    });
  } else {
    await Customer.findOne ({username: username}).then (customer => {
      if (customer) {
        errors.push ({msg: 'E-mail is already exist'});
        res.render ('add_customer', {
          errors,
          full_name,
          username,
          date,
          address,
          phone,
          activeCustomers: true,
          user: req.user.toJSON (),
        });
      } else {
        if (
          uploadedFile.mimetype === 'image/png' ||
          uploadedFile.mimetype === 'image/jpeg' ||
          uploadedFile.mimetype === 'image/gif'
        ) {
          uploadedFile.mv (`public/img/${image_path}`, err => {
            if (err) throw err;
            //add Adminái
            const newCustomer = new Customer ({
              full_name,
              username,
              date,
              address,
              phone,
              image_path,
              password,
            });
            bcypt.genSalt (10, (err, salt) =>
              bcypt.hash (newCustomer.password, salt, (err, hash) => {
                if (err) throw err;
                //set Password to hash
                newCustomer.password = hash;
                //saveUser
                newCustomer
                  .save ()
                  .then (customer => {
                    console.log ('Save succesfull');
                    req.flash (
                      'success_msg',
                      'You are create customer success!'
                    );
                    res.redirect ('customers');
                  })
                  .catch (err => {
                    console.log (err);
                  });
              })
            );
          });
        } else {
          errors.push ({
            msg: "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.",
          });
          res.render ('add_customer', {
            errors,
            full_name,
            username,
            date,
            address,
            phone,
            activeCustomers: true,

            user: req.user.toJSON (),
          });
        }
      }
    });
  }
};
exports.getDeleteCustomer = (req, res) => {
  let id = req.params.id;

  Customer.findOne ({_id: id})
    .then (customer => {
      if (customer) {
        let image_path = customer.toJSON ().image_path;
        fs.unlink (`public/img/${image_path}`, err => {
          if (err) throw err;
          Customer.deleteOne ({_id: id})
            .then (() => {
              req.flash ('success_msg', 'Delete customer succsess!');
              res.redirect ('customers');
            })
            .catch (err => {
              console.log (err);
            });
        });
      }
    })
    .catch (err => {
      console.log (err);
    });
};
exports.getCustomerEditPage = (req, res) => {
  let id = req.params.id;
  Customer.findById ({_id: id}, (err, customer) => {
    if (err) throw err;
    if (customer) {
      res.render ('edit_customer', {
        customer: customer.toJSON (),
        activeCustomers: true,
        user: req.user.toJSON (),
      });
    } else {
      res.redirect ('404');
    }
  });
};

exports.postCustomerEdit = (req, res) => {
  let id = req.params.id;
  const {full_name, date, address, phone} = req.body;

  if (req.files) {
    let uploadedFile = req.files.image;
    if (
      uploadedFile.mimetype === 'image/png' ||
      uploadedFile.mimetype === 'image/jpeg' ||
      uploadedFile.mimetype === 'image/gif'
    ) {
      Customer.findById (id).then (customer => {
        if (!customer) {
          res.redirect ('customers');
          return;
        } else {
          uploadedFile.mv (`public/img/${customer.image_path}`, err => {
            if (err) throw err;
            customer.full_name = full_name;
            customer.address = address;
            customer.phone = phone;
            customer.date = date;
          });
        }
        return customer
          .save ()
          .then (results => {
            req.flash ('success_msg', 'You are update customer success!');
            res.redirect ('customers');
          })
          .catch (err => {
            console.log (err);
          });
      });
    } else {
      let errors = [];
      errors.push ({
        msg: "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.",
      });
      Customer.findById ({_id: id}, (err, customer) => {
        if (err) throw err;
        res.render ('edit_customer', {
          customer: customer.toJSON (),
          errors,
          user: req.user.toJSON (),
          activeCustomers: true,
        });
      });
    }
  } else {
    Customer.findById (id).then (customer => {
      if (!customer) {
        res.redirect ('customers');
        return;
      } else {
        customer.full_name = full_name;
        customer.address = address;
        customer.phone = phone;
        customer.date = date;
      }
      return customer
        .save ()
        .then (results => {
          req.flash ('success_msg', 'You are update customer success!');
          res.redirect ('customers');
        })
        .catch (err => {
          console.log (err);
        });
    });
  }
};
