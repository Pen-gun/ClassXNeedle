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
    },
    image: {
        type: String,
    }

},{timestamps: true});

// Auto-generate category slug
categorySchema.pre("save", function () {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            trim: true
        });
    }
});

export const Category = mongoose.model("Category", categorySchema);
