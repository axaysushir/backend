const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Product not found"
        });
      }
      req.product = product;
      next();
    });
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Problem with Image File"
      });
    }
    // destructure field
    const { name, description, price, category, stock } = fields;

    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        error: "Please include all fields"
      });
    }
    // restrict on field
    let product = new Product(fields);

    //handle file
    if (file.photo) {
      if (file.photo.size > 3000000) {
        // 3mb * 1024 * 1024
        return res.status(400).json({
          error: "File size too Big! at least 3MB Max."
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }
    // console.log(product)
    // save to db
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Saving Tshirt in DB Fail"
        });
      }
      res.json(product);
    });
  });
};

exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to Delete Product"
      });
    }
    res.json({
      message: "Delete product was successful",
      deletedProduct
    });
  });
};

exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Problem with Image File"
      });
    }

    // update code
    let product = req.product;
    product = _.extend(product, fields);

    //handle file
    if (file.photo) {
      if (file.photo.size > 3000000) {
        // 3mb * 1024 * 1024
        return res.status(400).json({
          error: "File size too Big! at least 3MB Max."
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }
    // console.log(product)
    // save to db
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Updatation of product failed !!!"
        });
      }
      res.json(product);
    });
  });
};

// listing
exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

  Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, "asc"]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "No Product Found..."
        });
      }
      res.json(products);
    });
};

exports.updateStock = (req, res, next) => {
  let Operations = req.body.order.products.map(product => {
    return {
      updateOne: {
        filter: { _id: product._id },
        update: { $inc: { stock: -product.count, sold: +product.count } }
      }
    };
  });

  Product.bulkWrite(Operations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: "Bulk operation failed..."
      });
    }
    next();
  });
};

exports.getAllUniqueCategories = (req, res) => {
    Product.distinct('category', {}, (err, category) => {
        if (err) {
            return res.status(400).json({
              error: "No category found..."
            });
          }
          res.json(category)
    })
}
