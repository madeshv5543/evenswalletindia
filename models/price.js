const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const priceSchema = new Schema({
    date: String,
    value:Number,
    timestamp:Number
})

module.exports = mongoose.model('price', priceSchema);