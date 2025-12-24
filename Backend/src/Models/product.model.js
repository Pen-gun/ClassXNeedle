import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    productImage: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        default: 0
    },
    material: {
        type: String,
    },
    gender: {
        type: String,
        required: true,
        enum: ["Male", "Female", "Unisex"]
    },
    size: {
        type: [String],
        required: true
    },
    color: {
        type: [String],
        required: true
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    }
},{timestamps: true});


// AUTO-GENERATE SLUG BEFORE SAVE
productSchema.pre("save", function(next) {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            trim: true
        });
    }
    next();
});
//on update as well
productSchema.pre("findOneAndUpdate", function(next) {
    const update = this.getUpdate();

    if (update.name) {
        update.slug = slugify(update.name, {
            lower: true,
            strict: true,
            trim: true
        });
    }

    next();
});

export const Product = mongoose.model("Product", productSchema);
