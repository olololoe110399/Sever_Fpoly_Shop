const { v4: uuidv4 } = require("uuid");
const Customer = require("../../../models/customer");
const bcypt = require("bcryptjs");
let fs = require("fs");

exports.checkLogin = (req, res) => {
  let username = req.query.username;
  let password = req.query.password;
  Customer.findOne({ username: username }).then((customer) => {
    if (customer) {
      bcypt.compare(password, customer.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          res.json({ status: "Success" });
        } else {
          res.json({ status: "Password is incorrect" });
        }
      });
    } else {
      res.json({ status: "That email is not resgistered" });
    }
  });
};
exports.getProfile = (req, res) => {
  let username = req.query.username;
  let password = req.query.password;
  Customer.findOne({ username: username }).then((customer) => {
    if (customer) {
      bcypt.compare(password, customer.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          res.json({ customer: customer, status: "" });
        } else {
          res.json({ customer: {}, status: "Password is incorrect" });
        }
      });
    } else {
      res.json({ customer: {}, status: "That email is not resgistered" });
    }
  });
};
exports.sign_up_android = (req, res) => {
  const image_path = uuidv4() + ".png";
  const { full_name, password, username, date, address, phone } = req.body;
  Customer.findOne({ username: username }).then((customer) => {
    if (customer) {
      res.json({ status: "E-mail is already exist" });
    } else {
      base64ToPNG(req.body.image_path, image_path);
      //add Adminái
      const newCustomer = new Customer({
        full_name,
        username,
        date,
        address,
        phone,
        image_path,
        password,
      });
      bcypt.genSalt(10, (err, salt) =>
        bcypt.hash(newCustomer.password, salt, (err, hash) => {
          if (err) throw err;
          //set Password to hash
          newCustomer.password = hash;
          //saveUser
          newCustomer
            .save()
            .then((customer) => {
              res.json({ status: "Success" });
            })
            .catch((err) => {
              console.log(err);
            });
        })
      );
    }
  });
};
function base64ToPNG(data, image_path) {
  data = data.replace(/^data:image\/png;base64,/, "");
  fs.writeFile(`public/img/${image_path}`, data, "base64", function (err) {
    if (err) throw err;
  });
}
exports.update_profile_android = async (req, res) => {
  console.log(req.body);
  const { full_name, password, username, date, address, phone } = req.body;
  Customer.findOne({ username: username }).then((customer) => {
    if (customer) {
      if (req.body.image_path) {
        base64ToPNG(req.body.image_path, customer.image_path);
      }
      customer.full_name = full_name;
      customer.address = address;
      customer.phone = phone;
      customer.date = date;
      bcypt.genSalt(10, (err, salt) =>
        bcypt.hash(password, salt, (err, hash) => {
          if (err) throw err;
          //set Password to hash
          customer.password = hash;
          //saveUser
          customer
            .save()
            .then((customer) => {
              res.json({ status: "Success" });
            })
            .catch((err) => {
              console.log(err);
            });
        })
      );
    } else {
      res.json({ status: "Error! Not found User" });
    }
  });
};
