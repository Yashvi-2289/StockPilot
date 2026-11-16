
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    
    stock: {
    type: Number,
    required: true,
    min: 0,
    validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number"
    }
},

    price: {
        type: Number,
        required: true,
        min: 0.01
    },

    averageDailySales: {
        type: Number,
        default: 0,
        min: 0
    },

    
    leadTimeDays: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
        validator: Number.isInteger,
        message: "Lead time must be a whole number"
    }
},
safetyStock: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
        validator: Number.isInteger,
        message: "Safety stock must be a whole number"
    }
}

});

module.exports =
    mongoose.models.Product ||
    mongoose.model("Product", productSchema);