const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', (req, res) => {
  console.log('=======');
  // find all categories
  Category.findAll({
    order: ['id', 'DESC'],
    attributes: [
      'id',
      'category_name'
    ],
  // be sure to include its associated Products
  include:[
    {
      model:Product,
      attributes: [
        'id',
        'product_name',
        'price',
        'stock',
        'category_id']
    }
  ]
  })
  .then((dbCategoryData) => res.status(200).json(dbCategoryData))
  //.then((dbProductData => res.json(dbProductData))
  .catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });

});

router.get('/:id', (req, res) => {
  // find one category by its `id` value
  console.log('=======');
  Category.findOne({
    attributes: [
      'id',
      'category_name'
    ],
  // be sure to include its associated Products
  include:[
    {
      model:Product,
      attributes: [
        'id',
        'product_name',
        'price',
        'stock',
        'category_id']
    }
  ]
  })
  .then((dbCategoryData) => json(dbCategoryData))
  //.then((dbProductData => res.json(dbProductData))
  .catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
});

router.post('/', (req, res) => {
  // create a new category
  Category.create({
    category_name: req.body.category_name
  })
  .then((dbCategoryData) => json(dbCategoryData))
  .catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
});

router.put('/:id', (req, res) => {
  // update a category by its `id` value
  Category.update({
    category_name: req.body.category_name
  },
  {
    where:{
      id:req.params.id
    }
  })
  .then((dbCategoryData) => json(dbCategoryData))
  .catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
});

router.delete('/:id', (req, res) => {
  // delete a category by its `id` value
  Category.destroy({
    where:{
      id:req.params.id
    }
  })
  .then(dbCategoryData => {
    if(!dbCategoryData){
      res.status(404).json({message: 'No category found with this id'});
      return;
    }
    res.json(dbCategoryData);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

module.exports = router;
