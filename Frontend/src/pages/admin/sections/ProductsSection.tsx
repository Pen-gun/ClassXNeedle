import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminGetBrands,
  adminGetCategories,
  adminGetProducts,
  adminGetSubCategories,
  adminUpdateProduct
} from '../../../lib/api';
import type { AdminProduct } from '../../../types';
import SectionShell from '../SectionShell';
import { formatCurrency } from '../utils';

const ProductsSection = () => {
  const qc = useQueryClient();
  const { data: productsData } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => adminGetProducts({ page: 1, limit: 100 })
  });
  const { data: categoriesData } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminGetCategories({ page: 1, limit: 200 })
  });
  const { data: subCategoriesData } = useQuery({
    queryKey: ['admin', 'subcategories'],
    queryFn: () => adminGetSubCategories({ page: 1, limit: 200 })
  });
  const { data: brandsData } = useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: () => adminGetBrands({ page: 1, limit: 200 })
  });

  const products = productsData?.products ?? [];
  const categories = categoriesData?.categories ?? [];
  const subCategories = subCategoriesData?.subCategories ?? [];
  const brands = brandsData?.brands ?? [];

  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    priceAfterDiscount: '',
    quantity: '',
    material: '',
    gender: '',
    size: '',
    color: '',
    category: '',
    subCategory: '',
    brand: ''
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | null>(null);

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: '',
      description: '',
      price: '',
      priceAfterDiscount: '',
      quantity: '',
      material: '',
      gender: '',
      size: '',
      color: '',
      category: '',
      subCategory: '',
      brand: ''
    });
    setCoverImage(null);
    setImages(null);
  };

  const createMutation = useMutation({
    mutationFn: adminCreateProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData }) => adminUpdateProduct(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] })
  });

  const buildFormData = () => {
    const data = new FormData();
    data.append('name', form.name);
    data.append('description', form.description);
    data.append('price', form.price);
    if (form.priceAfterDiscount) data.append('priceAfterDiscount', form.priceAfterDiscount);
    if (form.quantity) data.append('quantity', form.quantity);
    if (form.material) data.append('material', form.material);
    if (form.gender) data.append('gender', form.gender);
    if (form.category) data.append('category', form.category);
    if (form.subCategory) data.append('subCategory', form.subCategory);
    if (form.brand) data.append('brand', form.brand);

    if (form.size) {
      form.size
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((item) => data.append('size', item));
    }
    if (form.color) {
      form.color
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((item) => data.append('color', item));
    }
    if (coverImage) data.append('coverImage', coverImage);
    if (images) Array.from(images).forEach((file) => data.append('images', file));
    return data;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const payload = buildFormData();
    if (editing?._id) {
      updateMutation.mutate({ id: editing._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const startEdit = (product: AdminProduct) => {
    setEditing(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ? String(product.price) : '',
      priceAfterDiscount: product.priceAfterDiscount ? String(product.priceAfterDiscount) : '',
      quantity: product.quantity ? String(product.quantity) : '',
      material: product.material || '',
      gender: product.gender || '',
      size: product.size?.join(', ') || '',
      color: product.color?.join(', ') || '',
      category: product.category?._id || '',
      subCategory: product.subCategory?._id || '',
      brand: typeof product.brand === 'string' ? product.brand : product.brand?._id || ''
    });
    setCoverImage(null);
    setImages(null);
  };

  return (
    <SectionShell title="Products" subtitle="Create, update, and manage inventory entries.">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-medium">{editing ? 'Edit product' : 'Create new product'}</h3>
        <form onSubmit={handleSubmit} className="mt-4 grid lg:grid-cols-3 gap-4">
          <input
            className="input bg-white/10 text-white"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="input bg-white/10 text-white"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <input
            className="input bg-white/10 text-white"
            placeholder="Discount price"
            value={form.priceAfterDiscount}
            onChange={(e) => setForm({ ...form, priceAfterDiscount: e.target.value })}
          />
          <input
            className="input bg-white/10 text-white"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
          <input
            className="input bg-white/10 text-white"
            placeholder="Material"
            value={form.material}
            onChange={(e) => setForm({ ...form, material: e.target.value })}
          />
          <input
            className="input bg-white/10 text-white"
            placeholder="Gender (e.g. Men, Women, Unisex)"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            required
          />
          <input
            className="input bg-white/10 text-white"
            placeholder="Sizes (comma separated)"
            value={form.size}
            onChange={(e) => setForm({ ...form, size: e.target.value })}
          />
          <input
            className="input bg-white/10 text-white"
            placeholder="Colors (comma separated)"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
          />
          <select
            className="input bg-white/10 text-white"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
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
            onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
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
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
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
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <div className="lg:col-span-3 grid md:grid-cols-2 gap-4">
            <label className="text-sm text-stone-300">
              Cover image
              <input
                type="file"
                className="mt-2 block w-full text-xs text-stone-400"
                onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                required={!editing}
              />
            </label>
            <label className="text-sm text-stone-300">
              Gallery images
              <input
                type="file"
                multiple
                className="mt-2 block w-full text-xs text-stone-400"
                onChange={(e) => setImages(e.target.files)}
              />
            </label>
          </div>
          <div className="lg:col-span-3 flex items-center gap-3">
            <button
              type="submit"
              className="btn-gold"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editing ? 'Save changes' : 'Create product'}
            </button>
            {editing && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-medium">Inventory list</h3>
        <div className="mt-4 space-y-3">
          {products.map((product) => (
            <div
              key={product._id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-black/30 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-xs text-stone-400">
                  {product.category?.name || 'Uncategorized'} - Qty {product.quantity ?? 0}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>{formatCurrency(product.price)}</span>
                <button
                  onClick={() => startEdit(product)}
                  className="btn-ghost text-xs text-white/80 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate(product._id)}
                  className="btn-ghost text-xs text-red-400 hover:text-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && <p className="text-stone-400">No products added yet.</p>}
        </div>
      </div>
    </SectionShell>
  );
};

export default ProductsSection;
