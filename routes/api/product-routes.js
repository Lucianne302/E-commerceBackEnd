const router = require('express').Router();
const models = require('../../models');
const { Product, Category, Tag, ProductTag } = require('../../models');
const { removeAttribute } = require('../../models/Tag');

// The `/api/products` endpoint

// get all products
router.get('/', (req, res) => {
  console.log('=======');
  // find all products
  Product.findAll({
    order: [['id', 'DESC']],
    attributes: [
      'id',
      'product_name',
      'price',
      'stock',
      'category_id'
    ],
    // be sure to include its associated Category and Tag data
    include: [
      {
        model: Category,
        attributes: ['id', 'category_name']
      },
      {
        model:Tag,
        attributes:['id', 'tag_name']
      }
    ]
  })
  .then((dbProductData) => res.status(200).json(dbProductData))
  .catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
});

// get one product
router.get('/:id', (req, res) => {
  console.log('=======');
  // find a single product by its `id`
  Product.findOne({
    attributes: [
      'id',
      'product_name',
      'price',
      'stock',
      'category_id'
    ],
    where: {
      id: req.params.id
    },
    // be sure to include its associated Category and Tag data
    include: [
      {
      model: Category,
      attributes: ['id', 'category_name']
      },
      {
        model:Tag,
        attributes:['id', 'tag_name']
      }
    ]
  })
  .then((dbProductData) => res.status(200).json(dbProductData))
  //.then((dbProductData => res.json(dbProductData))
  .catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
});

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.json(product);
    })
    .then((productTagIds) => res.json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
  Product.destroy({
    where:{
      id:req.params.id
    }
  })
  .then(dbProductData => {
    if (!dbProductData) {
      res.status(404).json({ message: 'No products found with this id'});
      return;
    }
    res.json(dbProductData);
  })
  .catch(err=> {
    console.log(err);
    res.status(500).json(err);
  });
});

module.exports = router;
