const Producer = require("../../../models/producer");
const Product = require("../../../models/product");
const Genre = require("../../../models/genre");

exports.getGenres = (req, res) => {
  Genre.find({}).then((genres) => {
    return res.json({ genres });
  });
};
exports.getProducers = (req, res) => {
  Producer.find({}).then((producer) => {
    return res.json({ producer });
  });
};
exports.getProductsByCategory = (req, res) => {
  const category = req.params.category;
  switch (category) {
    case "hot":
      CategoryProduct(res, "Hot");
      break;
    case "promotion":
      CategoryProduct(res, "Promotion");
      break;
    case "selling":
      CategoryProduct(res, "Selling");
      break;
    case "top_rated":
      CategoryProduct(res, "Top rated");
      break;
    case "good_price":
      CategoryProduct(res, "Good price");
      break;
  }
};
async function CategoryProduct(res, category) {
  await Product.find({ category: category }).then((products) => {
    return res.json({ products });
  });
}
exports.getProductsDiscover = (req, res) => {
  const { with_genre, with_producer } = req.query;
  if (with_genre && with_producer) {
    discoverProduct(res, { genre: with_genre, producer: with_producer });
  } else if (with_producer) {
    discoverProduct(res, { producer: with_producer });
  } else {
    discoverProduct(res, { genre: with_genre });
  }
};
async function discoverProduct(res, object) {
  await Product.find(object).then((products) => {
    return res.json({ products });
  });
}
exports.getProductsByName = async (req, res) => {
  const query = req.query.query;
  await Product.find({}).then((products) => {
    return res.json({
      products: products.filter((product) => {
        return (
          product.product_name.toLowerCase().indexOf(query.toLowerCase()) !== -1
        );
      }),
    });
  });
};
exports.getProductDetails = async (req, res) => {
  const id = req.params.movie_id;
  if (id) {
    await Product.findById(id)
      .lean()
      .exec((err, product) => {
        if (!err) {
          res.json({ product });
        } else {
          console.log(err);
        }
      });
  }
};
