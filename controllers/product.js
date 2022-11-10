const Producer = require ('../models/producer');
const Product = require ('../models/product');
const Genre = require ('../models/genre');
const {v4: uuidv4} = require ('uuid');
let fs = require ('fs');

exports.getProducts = (req, res) => {
  Product.find ({}).then (products => {
    res.render ('products', {
      products: products.map (product => product.toJSON ()),
      activeProducts: true,
      user: req.user.toJSON (),
    });
  });
};
exports.getProductCreatePage = (req, res) => {
  Genre.find ({}).then (genres => {
    Producer.find ({}).then (producers => {
      res.render ('add_product', {
        genres: genres.map (genre => genre.toJSON ()),
        producers: producers.map (producer => producer.toJSON ()),
        activeProducts: true,
        user: req.user.toJSON (),
      });
    });
  });
};
exports.getDeleteProduct = (req, res) => {
  let id = req.params.id;
  Product.findOne ({_id: id})
    .then (product => {
      if (product) {
        fs.unlink (`public/img/${product.toJSON ().image_path}`, err => {
          if (err) throw err;
          fs.unlink (`public/img/${product.toJSON ().backdrop_path}`, err => {
            if (err) throw err;
            Product.deleteOne ({_id: id})
              .then (() => {
                req.flash ('success_msg', 'Delete product succsess!');
                res.redirect ('products');
              })
              .catch (err => {
                console.log (err);
              });
          });
        });
      }
    })
    .catch (err => {
      console.log (err);
    });
};

exports.getProductEditPage = (req, res) => {
  Genre.find ({}).then (genres => {
    Producer.find ({}).then (producers => {
      Product.findById (req.params.id, (err, product) => {
        if (err) throw err;
        if (product) {
          console.log (product.toJSON ());
          res.render ('edit_product', {
            genres: genres.map (genre => genre.toJSON ()),
            producers: producers.map (producer => producer.toJSON ()),
            product: product.toJSON (),
            activeProducts: true,
            user: req.user.toJSON (),
          });
        } else {
          res.redirect ('404');
        }
      });
    });
  });
};
exports.postProductCreate = async (req, res) => {
  let errors = [];
  const {
    product_name,
    over_view,
    vote_average,
    quantity,
    category,
    release_date,
    genre,
    producer,
    price,
  } = req.body;
  let uploadedFile = req.files.image;
  let fileExtension = uploadedFile.mimetype.split ('/')[1];
  let image_path = uuidv4 () + '.' + fileExtension;
  let uploadedFile2 = req.files.image2;
  let fileExtension2 = uploadedFile2.mimetype.split ('/')[1];
  let backdrop_path = uuidv4 () + '.' + fileExtension2;
  if (vote_average < 0 || vote_average > 10) {
    errors.push ({
      msg: 'The vote must be greater than zero and smaller than 10!!!',
    });
  }
  if (category == 'Open this select category') {
    errors.push ({
      msg: 'Please chose category',
    });
  }
  if (genre == 'Open this select genre') {
    errors.push ({
      msg: 'Please chose genre',
    });
  }
  if (producer == 'Open this select production company') {
    errors.push ({
      msg: 'Please chose porduction company',
    });
  }
  if (errors.length > 0) {
    await Genre.find ({}).then (async genres => {
      await Producer.find ({}).then (async producers => {
        res.render ('add_product', {
          errors,
          genres: genres.map (genre => genre.toJSON ()),
          producers: producers.map (producer => producer.toJSON ()),
          product_name,
          over_view,
          vote_average,
          quantity,
          category,
          release_date,
          genre,
          producer,
          price,
          activeProducts: true,
          user: req.user.toJSON (),
        });
      });
    });
  } else {
    await Genre.find ({}).then (async genres => {
      await Product.findOne ({product_name: product_name}).then (product => {
        if (product) {
          errors.push ({msg: 'Produce_name is already exist'});
          res.render ('add_product', {
            errors,
            genres: genres.map (genre => genre.toJSON ()),
            producers: producers.map (producer => producer.toJSON ()),
            product_name,
            over_view,
            vote_average,
            quantity,
            category,
            release_date,
            genre,
            producer,
            price,
            activeProducts: true,

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
              uploadedFile2.mv (`public/img/${backdrop_path}`, err => {
                if (err) throw err;
                //add Product
                const newProduct = new Product ({
                  product_name,
                  over_view,
                  vote_average,
                  quantity,
                  category,
                  release_date,
                  genre,
                  producer,
                  price,
                  image_path,
                  backdrop_path,
                });
                newProduct
                  .save ()
                  .then (product => {
                    console.log ('Save succesfull');
                    req.flash (
                      'success_msg',
                      'You are create product success!'
                    );
                    res.redirect ('products');
                  })
                  .catch (err => {
                    console.log (err);
                  });
              });
            });
          } else {
            errors.push ({
              msg: "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.",
            });
            res.render ('add_product', {
              errors,
              genres: genres.map (genre => genre.toJSON ()),
              producers: producers.map (producer => producer.toJSON ()),
              product_name,
              over_view,
              vote_average,
              quantity,
              category,
              release_date,
              genre,
              producer,
              price,
              activeProducts: true,
              user: req.user.toJSON (),
            });
          }
        }
      });
    });
  }
};

exports.postProductEdit = (req, res) => {
  let errors = [];
  let id = req.params.id;
  const {
    product_name,
    over_view,
    vote_average,
    quantity,
    category,
    release_date,
    genre,
    producer,
    price,
  } = req.body;
  console.log (req.body);
  if (vote_average < 0 || vote_average > 10) {
    errors.push ({
      msg: 'The vote must be greater than zero and smaller than 10!!!',
    });
  }
  if (category == 'Open this select new category') {
    errors.push ({
      msg: 'Please chose category',
    });
  }
  if (genre == 'Open this select new genre') {
    errors.push ({
      msg: 'Please chose genre',
    });
  }
  if (producer == 'Open this select production company') {
    errors.push ({
      msg: 'Please chose porduction company',
    });
  }
  if (errors.length > 0) {
    Genre.find ({}).then (genres => {
      Producer.find ({}).then (producers => {
        Product.findById (req.params.id, (err, product) => {
          if (err) throw err;
          if (product) {
            res.render ('edit_product', {
              errors,
              genres: genres.map (genre => genre.toJSON ()),
              producers: producers.map (producer => producer.toJSON ()),
              product: product.toJSON (),
              activeProducts: true,

              user: req.user.toJSON (),
            });
          } else {
            res.redirect ('404');
          }
        });
      });
    });
  } else {
    if (req.files) {
      let uploadedFile = req.files.image;
      let uploadedFile2 = req.files.image2;
      if (
        uploadedFile.mimetype === 'image/png' ||
        uploadedFile.mimetype === 'image/jpeg' ||
        uploadedFile.mimetype === 'image/gif' ||
        uploadedFile2.mimetype === 'image/png' ||
        uploadedFile2.mimetype === 'image/jpeg' ||
        uploadedFile2.mimetype === 'image/gif'
      ) {
        Product.findById (id).then (product => {
          if (!product) {
            res.redirect ('products');
            return;
          } else {
            uploadedFile.mv (`public/img/${product.image_path}`, err => {
              if (err) throw err;
              uploadedFile2.mv (`public/img/${product.backdrop_path}`, err2 => {
                if (err2) throw err2;
                product.product_name = product_name;
                product.over_view = over_view;
                product.vote_average = vote_average;
                product.quantity = quantity;
                product.category = category;
                product.release_date = release_date;
                product.genre = genre;
                product.producer = producer;
                product.price = price;
              });
            });
          }
          return product
            .save ()
            .then (results => {
              req.flash ('success_msg', 'You are update product success!');
              res.redirect ('products');
            })
            .catch (err => {
              console.log (err);
            });
        });
      } else {
        errors.push ({
          msg: "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.",
        });
        Genre.find ({}).then (genres => {
          Producer.find ({}).then (producers => {
            Product.findById (req.params.id, (err, product) => {
              if (err) throw err;
              if (product) {
                res.render ('edit_product', {
                  genres: genres.map (genre => genre.toJSON ()),
                  producers: producers.map (producer => producer.toJSON ()),
                  product: product.toJSON (),
                  activeProducts: true,
                  errors,
                  user: req.user.toJSON (),
                });
              } else {
                res.redirect ('404');
              }
            });
          });
        });
      }
    } else {
      Product.findById (id).then (product => {
        if (!product) {
          res.redirect ('products');
          return;
        } else {
          product.product_name = product_name;
          product.over_view = over_view;
          product.vote_average = vote_average;
          product.quantity = quantity;
          product.category = category;
          product.release_date = release_date;
          product.genre = genre;
          product.producer = producer;
          product.price = price;
        }
        return product
          .save ()
          .then (results => {
            req.flash ('success_msg', 'You are update product success!');
            res.redirect ('products');
          })
          .catch (err => {
            console.log (err);
          });
      });
    }
  }
};
