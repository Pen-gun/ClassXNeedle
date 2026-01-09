import type { FormEvent } from 'react';
import type { AdminBrand, AdminCategory, AdminSubCategory } from '../../../../types';
import type { ProductFormState } from './useProductsSection';

type Props = {
  editing: boolean;
  form: ProductFormState;
  categories: AdminCategory[];
  subCategories: AdminSubCategory[];
  brands: AdminBrand[];
  isSubmitting: boolean;
  onFieldChange: (field: keyof ProductFormState, value: string) => void;
  onCoverImageChange: (file: File | null) => void;
  onImagesChange: (files: FileList | null) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
};

const ProductsForm = ({
  editing,
  form,
  categories,
  subCategories,
  brands,
  isSubmitting,
  onFieldChange,
  onCoverImageChange,
  onImagesChange,
  onSubmit,
  onCancel
}: Props) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
    <h3 className="text-lg font-medium">{editing ? 'Edit product' : 'Create new product'}</h3>
    <form onSubmit={onSubmit} className="mt-4 grid lg:grid-cols-3 gap-4">
      <input
        className="input bg-white/10 text-white"
        placeholder="Name"
        value={form.name}
        onChange={(e) => onFieldChange('name', e.target.value)}
        required
      />
      <input
        className="input bg-white/10 text-white"
        placeholder="Price"
        value={form.price}
        onChange={(e) => onFieldChange('price', e.target.value)}
        required
      />
      <input
        className="input bg-white/10 text-white"
        placeholder="Discount price"
        value={form.priceAfterDiscount}
        onChange={(e) => onFieldChange('priceAfterDiscount', e.target.value)}
      />
      <input
        className="input bg-white/10 text-white"
        placeholder="Quantity"
        value={form.quantity}
        onChange={(e) => onFieldChange('quantity', e.target.value)}
      />
      <input
        className="input bg-white/10 text-white"
        placeholder="Material"
        value={form.material}
        onChange={(e) => onFieldChange('material', e.target.value)}
      />
      <input
        className="input bg-white/10 text-white"
        placeholder="Gender (e.g. Men, Women, Unisex)"
        value={form.gender}
        onChange={(e) => onFieldChange('gender', e.target.value)}
        required
      />
      <input
        className="input bg-white/10 text-white"
        placeholder="Sizes (comma separated)"
        value={form.size}
        onChange={(e) => onFieldChange('size', e.target.value)}
      />
      <input
        className="input bg-white/10 text-white"
        placeholder="Colors (comma separated)"
        value={form.color}
        onChange={(e) => onFieldChange('color', e.target.value)}
      />
      <select
        className="input bg-white/10 text-white"
        value={form.category}
        onChange={(e) => onFieldChange('category', e.target.value)}
        required
      >
        <option value="">Category</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>
      <select
        className="input bg-white/10 text-white"
        value={form.subCategory}
        onChange={(e) => onFieldChange('subCategory', e.target.value)}
      >
        <option value="">Subcategory</option>
        {subCategories.map((sub) => (
          <option key={sub._id} value={sub._id}>
            {sub.name}
          </option>
        ))}
      </select>
      <select
        className="input bg-white/10 text-white"
        value={form.brand}
        onChange={(e) => onFieldChange('brand', e.target.value)}
      >
        <option value="">Brand</option>
        {brands.map((brand) => (
          <option key={brand._id} value={brand._id}>
            {brand.name}
          </option>
        ))}
      </select>
      <textarea
        className="input bg-white/10 text-white lg:col-span-3"
        placeholder="Description"
        value={form.description}
        onChange={(e) => onFieldChange('description', e.target.value)}
        required
      />
      <div className="lg:col-span-3 grid md:grid-cols-2 gap-4">
        <label className="text-sm text-stone-300">
          Cover image
          <input
            type="file"
            className="mt-2 block w-full text-xs text-stone-400"
            onChange={(e) => onCoverImageChange(e.target.files?.[0] || null)}
            required={!editing}
          />
        </label>
        <label className="text-sm text-stone-300">
          Gallery images
          <input
            type="file"
            multiple
            className="mt-2 block w-full text-xs text-stone-400"
            onChange={(e) => onImagesChange(e.target.files)}
          />
        </label>
      </div>
      <div className="lg:col-span-3 flex items-center gap-3">
        <button type="submit" className="btn-gold" disabled={isSubmitting}>
          {editing ? 'Save changes' : 'Create product'}
        </button>
        {editing && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  </div>
);

export default ProductsForm;
