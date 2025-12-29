import mongoose from 'mongoose';
import slugify from 'slugify';

const subCategorySchema = new mongoose.Schema({
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
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    }
},{timestamps: true});

// Auto-generate sub-category slug
subCategorySchema.pre("save", function () {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            trim: true
        });
    }
});

export const SubCategory = mongoose.model("SubCategory", subCategorySchema);