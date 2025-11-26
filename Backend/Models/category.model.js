import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    }

},{timestamps: true});

// Auto-generate category slug
categorySchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            trim: true
        });
    }
    next();
});

export const Category = mongoose.model("Category", categorySchema);
