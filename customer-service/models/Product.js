const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    id: Number,
    name: String,
    price: Number,
    imageUrl: String,
    category: String

});

module.exports = mongoose.model('Product', ProductSchema);