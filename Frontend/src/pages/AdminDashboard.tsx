
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BadgePercent,
  Boxes,
  ClipboardList,
  Layers,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Star,
  Tags,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  adminGetProductStats,
  adminGetOrderStats,
  adminGetUserStats,
  adminGetReviewStats,
  adminGetCouponStats,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminGetSubCategories,
  adminCreateSubCategory,
  adminUpdateSubCategory,
  adminDeleteSubCategory,
  adminGetBrands,
  adminCreateBrand,
  adminUpdateBrand,
  adminDeleteBrand,
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminMarkOrderPaid,
  adminCancelOrder,
  adminGetUsers,
  adminToggleUserStatus,
  adminDeleteUser,
  adminGetReviews,
  adminDeleteReview
} from '../lib/api';
import type {
  AdminBrand,
  AdminCategory,
  AdminCoupon,
  AdminOrder,
  AdminProduct,
  AdminSubCategory,
  AdminUser
} from '../types';
import { useAuthMutations, useMe } from '../hooks/useAuth';

type SectionId =
  | 'overview'
  | 'products'
  | 'categories'
  | 'subcategories'
  | 'brands'
  | 'coupons'
  | 'orders'
  | 'users'
  | 'reviews';

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const { data: me } = useMe();
  const { logoutMutation } = useAuthMutations();

  const sections = useMemo(
    () => [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'products', label: 'Products', icon: Package },
      { id: 'categories', label: 'Categories', icon: Tags },
      { id: 'subcategories', label: 'Subcategories', icon: Layers },
      { id: 'brands', label: 'Brands', icon: ShieldCheck },
      { id: 'coupons', label: 'Coupons', icon: BadgePercent },
      { id: 'orders', label: 'Orders', icon: ClipboardList },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'reviews', label: 'Reviews', icon: Star }
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="w-full max-w-[260px] border-r border-white/10 bg-slate-900/70 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent-gold/20 text-accent-gold flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-stone-400">Admin</p>
              <p className="text-lg font-display">ClassXNeedle</p>
            </div>
          </div>

          <div className="mt-10 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  activeSection === section.id
                    ? 'bg-white/10 text-white'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-8">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
              <p className="text-stone-400">Signed in as</p>
              <p className="font-medium">{me?.fullName || me?.username}</p>
              <button
                onClick={() => logoutMutation.mutate()}
                className="mt-4 w-full rounded-lg border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-stone-300 hover:bg-white/10"
              >
                Sign out
              </button>
              <Link to="/" className="mt-3 block text-center text-xs text-stone-400 hover:text-white">
                Return to storefront
              </Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8">
          {activeSection === 'overview' && <OverviewSection />}
          {activeSection === 'products' && <ProductsSection />}
          {activeSection === 'categories' && <CategoriesSection />}
          {activeSection === 'subcategories' && <SubCategoriesSection />}
          {activeSection === 'brands' && <BrandsSection />}
          {activeSection === 'coupons' && <CouponsSection />}
          {activeSection === 'orders' && <OrdersSection />}
          {activeSection === 'users' && <UsersSection />}
          {activeSection === 'reviews' && <ReviewsSection />}
        </main>
      </div>
    </div>
  );
};

const SectionShell = ({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-display">{title}</h1>
      {subtitle && <p className="text-stone-400 mt-1">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const OverviewSection = () => {
  const { data: productStats } = useQuery({ queryKey: ['admin', 'stats', 'products'], queryFn: adminGetProductStats });
  const { data: orderStats } = useQuery({ queryKey: ['admin', 'stats', 'orders'], queryFn: adminGetOrderStats });
  const { data: userStats } = useQuery({ queryKey: ['admin', 'stats', 'users'], queryFn: adminGetUserStats });
  const { data: reviewStats } = useQuery({ queryKey: ['admin', 'stats', 'reviews'], queryFn: adminGetReviewStats });
  const { data: couponStats } = useQuery({ queryKey: ['admin', 'stats', 'coupons'], queryFn: adminGetCouponStats });

  const totalProducts = productStats?.totalStats?.[0]?.totalProducts ?? 0;
  const lowStock = productStats?.lowStock ?? [];

  const totalOrders = orderStats?.overall?.[0]?.totalOrders ?? 0;
  const totalRevenue = orderStats?.overall?.[0]?.totalRevenue ?? 0;

  const totalUsers = userStats?.overall?.[0]?.totalUsers ?? 0;
  const activeUsers = userStats?.overall?.[0]?.activeUsers ?? 0;

  const totalReviews = reviewStats?.overall?.[0]?.totalReviews ?? 0;
  const averageRating = reviewStats?.overall?.[0]?.averageRating ?? 0;

  const totalCoupons = couponStats?.overall?.[0]?.totalCoupons ?? 0;
  const activeCoupons = couponStats?.overall?.[0]?.activeCoupons ?? 0;

  return (
    <SectionShell title="Operations overview" subtitle="High-level visibility across your store.">
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Products" value={totalProducts} detail={`${lowStock.length} low stock items`} />
        <StatCard title="Orders" value={totalOrders} detail={formatCurrency(totalRevenue)} />
        <StatCard title="Customers" value={totalUsers} detail={`${activeUsers} active`} />
        <StatCard title="Reviews" value={totalReviews} detail={`${averageRating.toFixed(1)} avg rating`} />
        <StatCard title="Coupons" value={totalCoupons} detail={`${activeCoupons} active`} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-medium">Low stock watchlist</h3>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          {lowStock.length === 0 && <p className="text-stone-400">All inventory healthy.</p>}
          {lowStock.map((item: { name: string; quantity: number; price?: number }) => (
            <div key={item.name} className="flex items-center justify-between rounded-xl bg-black/30 px-4 py-3">
              <div>
                <p className="text-sm">{item.name}</p>
                <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm">{formatCurrency(item.price)}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
};

const StatCard = ({ title, value, detail }: { title: string; value: string | number; detail?: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
    <p className="text-sm text-stone-400">{title}</p>
    <p className="text-2xl font-semibold mt-2">{value}</p>
    {detail && <p className="text-xs text-stone-500 mt-1">{detail}</p>}
  </div>
);
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
      form.size.split(',').map((s) => s.trim()).filter(Boolean).forEach((item) => data.append('size', item));
    }
    if (form.color) {
      form.color.split(',').map((s) => s.trim()).filter(Boolean).forEach((item) => data.append('color', item));
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
            <div key={product._id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-black/30 px-4 py-3">
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
          {products.length === 0 && <p className="text-stone-400">No products yet.</p>}
        </div>
      </div>
    </SectionShell>
  );
};

const CategoriesSection = () => {
  const qc = useQueryClient();
  const { data: categoriesData } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminGetCategories({ page: 1, limit: 200 })
  });
  const categories = categoriesData?.categories ?? [];

  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState<File | null>(null);

  const reset = () => {
    setEditing(null);
    setName('');
    setImage(null);
  };

  const createMutation = useMutation({
    mutationFn: adminCreateCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      reset();
    }
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData }) => adminUpdateCategory(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      reset();
    }
  });
  const deleteMutation = useMutation({
    mutationFn: adminDeleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] })
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const payload = new FormData();
    payload.append('name', name);
    if (image) payload.append('image', image);
    if (editing?._id) updateMutation.mutate({ id: editing._id, payload });
    else createMutation.mutate(payload);
  };

  return (
    <SectionShell title="Categories" subtitle="Organize products by high-level categories.">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-medium">{editing ? 'Edit category' : 'New category'}</h3>
        <form onSubmit={submit} className="mt-4 flex flex-wrap gap-3">
          <input
            className="input bg-white/10 text-white flex-1 min-w-[220px]"
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="file"
            className="text-xs text-stone-400"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
          <button type="submit" className="btn-gold">
            {editing ? 'Save' : 'Create'}
          </button>
          {editing && (
            <button type="button" onClick={reset} className="btn-secondary">
              Cancel
            </button>
          )}
        </form>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-medium">Category list</h3>
        <div className="mt-4 space-y-3">
          {categories.map((category) => (
            <div key={category._id} className="flex items-center justify-between rounded-xl bg-black/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{category.name}</p>
                <p className="text-xs text-stone-400">Products: {category.productCount ?? 0}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => {
                    setEditing(category);
                    setName(category.name);
                    setImage(null);
                  }}
                  className="btn-ghost text-xs text-white/80 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate(category._id)}
                  className="btn-ghost text-xs text-red-400 hover:text-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && <p className="text-stone-400">No categories created yet.</p>}
        </div>
      </div>
    </SectionShell>
  );
};
const SubCategoriesSection = () => {
  const qc = useQueryClient();
  const { data: categoriesData } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminGetCategories({ page: 1, limit: 200 })
  });
  const { data: subCategoriesData } = useQuery({
    queryKey: ['admin', 'subcategories'],
    queryFn: () => adminGetSubCategories({ page: 1, limit: 200 })
  });

  const categories = categoriesData?.categories ?? [];
  const subCategories = subCategoriesData?.subCategories ?? [];

  const [editing, setEditing] = useState<AdminSubCategory | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');

  const reset = () => {
    setEditing(null);
    setName('');
    setCategory('');
  };

  const createMutation = useMutation({
    mutationFn: adminCreateSubCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'subcategories'] });
      reset();
    }
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; category?: string } }) =>
      adminUpdateSubCategory(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'subcategories'] });
      reset();
    }
  });
  const deleteMutation = useMutation({
    mutationFn: adminDeleteSubCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'subcategories'] })
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (editing?._id) {
      updateMutation.mutate({ id: editing._id, payload: { name, category } });
    } else {
      createMutation.mutate({ name, category });
    }
  };

  return (
    <SectionShell title="Subcategories" subtitle="Add richer structure inside each category.">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-medium">{editing ? 'Edit subcategory' : 'New subcategory'}</h3>
        <form onSubmit={submit} className="mt-4 flex flex-wrap gap-3">
          <input
            className="input bg-white/10 text-white flex-1 min-w-[220px]"
            placeholder="Subcategory name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <select
            className="input bg-white/10 text-white min-w-[200px]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select category</option>
            {categories.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-gold">
            {editing ? 'Save' : 'Create'}
          </button>
          {editing && (
            <button type="button" onClick={reset} className="btn-secondary">
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-medium">Subcategory list</h3>
        <div className="mt-4 space-y-3">
          {subCategories.map((sub) => (
            <div key={sub._id} className="flex items-center justify-between rounded-xl bg-black/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{sub.name}</p>
                <p className="text-xs text-stone-400">{sub.category?.name}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => {
                    setEditing(sub);
                    setName(sub.name);
                    setCategory(sub.category?._id || '');
                  }}
                  className="btn-ghost text-xs text-white/80 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate(sub._id)}
                  className="btn-ghost text-xs text-red-400 hover:text-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {subCategories.length === 0 && <p className="text-stone-400">No subcategories yet.</p>}
        </div>
      </div>
    </SectionShell>
  );
};

const BrandsSection = () => {
  const qc = useQueryClient();
  const { data: brandsData } = useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: () => adminGetBrands({ page: 1, limit: 200 })
  });
  const brands = brandsData?.brands ?? [];

  const [editing, setEditing] = useState<AdminBrand | null>(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState<File | null>(null);

  const reset = () => {
    setEditing(null);
    setName('');
    setImage(null);
  };

  const createMutation = useMutation({
    mutationFn: adminCreateBrand,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'brands'] });
      reset();
    }
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData }) => adminUpdateBrand(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'brands'] });
      reset();
    }
  });
  const deleteMutation = useMutation({
    mutationFn: adminDeleteBrand,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'brands'] })
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const payload = new FormData();
    payload.append('name', name);
    if (image) payload.append('image', image);
    if (editing?._id) updateMutation.mutate({ id: editing._id, payload });
    else createMutation.mutate(payload);
  };

  return (
    <SectionShell title="Brands" subtitle="Manage brand presence and assets.">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-medium">{editing ? 'Edit brand' : 'New brand'}</h3>
        <form onSubmit={submit} className="mt-4 flex flex-wrap gap-3">
          <input
            className="input bg-white/10 text-white flex-1 min-w-[220px]"
            placeholder="Brand name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="file"
            className="text-xs text-stone-400"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
          <button type="submit" className="btn-gold">
            {editing ? 'Save' : 'Create'}
          </button>
          {editing && (
            <button type="button" onClick={reset} className="btn-secondary">
              Cancel
            </button>
          )}
        </form>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-medium">Brand list</h3>
        <div className="mt-4 space-y-3">
          {brands.map((brand) => (
            <div key={brand._id} className="flex items-center justify-between rounded-xl bg-black/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{brand.name}</p>
                <p className="text-xs text-stone-400">Products: {brand.productCount ?? 0}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => {
                    setEditing(brand);
                    setName(brand.name);
                    setImage(null);
                  }}
                  className="btn-ghost text-xs text-white/80 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate(brand._id)}
                  className="btn-ghost text-xs text-red-400 hover:text-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {brands.length === 0 && <p className="text-stone-400">No brands created yet.</p>}
        </div>
      </div>
    </SectionShell>
  );
};
const CouponsSection = () => {
  const qc = useQueryClient();
  const { data: couponsData } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => adminGetCoupons({ page: 1, limit: 100 })
  });
  const coupons = couponsData?.coupons ?? [];

  const [editing, setEditing] = useState<AdminCoupon | null>(null);
  const [form, setForm] = useState({ code: '', discountPercentage: '', expirationDate: '' });

  const reset = () => {
    setEditing(null);
    setForm({ code: '', discountPercentage: '', expirationDate: '' });
  };

  const createMutation = useMutation({
    mutationFn: adminCreateCoupon,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      reset();
    }
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { code?: string; discountPercentage?: number; expirationDate?: string } }) =>
      adminUpdateCoupon(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      reset();
    }
  });
  const deleteMutation = useMutation({
    mutationFn: adminDeleteCoupon,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] })
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      code: form.code,
      discountPercentage: Number(form.discountPercentage),
      expirationDate: form.expirationDate
    };
    if (editing?._id) updateMutation.mutate({ id: editing._id, payload });
    else createMutation.mutate(payload);
  };

  return (
    <SectionShell title="Coupons" subtitle="Create and manage discount codes.">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-medium">{editing ? 'Edit coupon' : 'New coupon'}</h3>
        <form onSubmit={submit} className="mt-4 grid md:grid-cols-3 gap-3">
          <input
            className="input bg-white/10 text-white"
            placeholder="CODE2025"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
          <input
            className="input bg-white/10 text-white"
            placeholder="Discount %"
            value={form.discountPercentage}
            onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })}
            required
          />
          <input
            type="date"
            className="input bg-white/10 text-white"
            value={form.expirationDate}
            onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
            required
          />
          <div className="md:col-span-3 flex items-center gap-3">
            <button type="submit" className="btn-gold">
              {editing ? 'Save' : 'Create'}
            </button>
            {editing && (
              <button type="button" onClick={reset} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-medium">Coupon list</h3>
        <div className="mt-4 space-y-3">
          {coupons.map((coupon) => (
            <div key={coupon._id} className="flex items-center justify-between rounded-xl bg-black/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{coupon.code}</p>
                <p className="text-xs text-stone-400">
                  {coupon.discountPercentage}% - expires {new Date(coupon.expirationDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => {
                    setEditing(coupon);
                    setForm({
                      code: coupon.code,
                      discountPercentage: String(coupon.discountPercentage),
                      expirationDate: coupon.expirationDate.slice(0, 10)
                    });
                  }}
                  className="btn-ghost text-xs text-white/80 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate(coupon._id)}
                  className="btn-ghost text-xs text-red-400 hover:text-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {coupons.length === 0 && <p className="text-stone-400">No coupons available.</p>}
        </div>
      </div>
    </SectionShell>
  );
};

const OrdersSection = () => {
  const qc = useQueryClient();
  const { data: ordersData } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () => adminGetOrders({ page: 1, limit: 100 })
  });

  const orders = ordersData?.orders ?? [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminUpdateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
  });
  const markPaidMutation = useMutation({
    mutationFn: adminMarkOrderPaid,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
  });
  const cancelMutation = useMutation({
    mutationFn: adminCancelOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
  });

  return (
    <SectionShell title="Orders" subtitle="Track and fulfill customer orders.">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-medium">Order list</h3>
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <OrderRow
              key={order._id}
              order={order}
              onStatus={(status) => updateStatusMutation.mutate({ id: order._id, status })}
              onPaid={() => markPaidMutation.mutate(order._id)}
              onCancel={() => cancelMutation.mutate(order._id)}
            />
          ))}
          {orders.length === 0 && <p className="text-stone-400">No orders found.</p>}
        </div>
      </div>
    </SectionShell>
  );
};

const OrderRow = ({
  order,
  onStatus,
  onPaid,
  onCancel
}: {
  order: AdminOrder;
  onStatus: (status: string) => void;
  onPaid: () => void;
  onCancel: () => void;
}) => {
  const [status, setStatus] = useState(order.status);

  return (
    <div className="rounded-xl bg-black/30 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Order #{order._id.slice(-6)}</p>
          <p className="text-xs text-stone-400">
            {order.customer?.fullName || order.customer?.username} - {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-sm">{formatCurrency(order.orderPrice)}</div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-stone-400">
        <span>Status: {order.status}</span>
        <span>Paid: {order.isPaid ? 'Yes' : 'No'}</span>
        <span>Items: {order.orderItems.length}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select
          className="input bg-white/10 text-white text-xs"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="Pending">Pending</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <button
          onClick={() => onStatus(status)}
          className="btn-secondary text-xs border-white/30 text-white/90 hover:bg-white/10 hover:text-white"
        >
          Update status
        </button>
        {!order.isPaid && (
          <button onClick={onPaid} className="btn-gold text-xs">
            Mark paid
          </button>
        )}
        {order.status !== 'Cancelled' && (
          <button onClick={onCancel} className="btn-ghost text-xs text-red-400 hover:text-red-200">
            Cancel order
          </button>
        )}
      </div>
    </div>
  );
};

const UsersSection = () => {
  const qc = useQueryClient();
  const { data: usersData } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminGetUsers({ page: 1, limit: 100 })
  });
  const users = usersData?.users ?? [];

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => adminToggleUserStatus(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] })
  });
  const deleteMutation = useMutation({
    mutationFn: adminDeleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] })
  });

  return (
    <SectionShell title="Users" subtitle="Manage customer access and activity.">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-medium">User list</h3>
        <div className="mt-4 space-y-3">
          {users.map((user) => (
            <div key={user._id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-black/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{user.fullName || user.username}</p>
                <p className="text-xs text-stone-400">{user.email || 'No email'}</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-stone-400">Orders: {user.totalOrders ?? 0}</span>
                <span className="text-stone-400">Spent: {formatCurrency(user.totalSpent)}</span>
                <button
                  onClick={() => toggleMutation.mutate({ id: user._id, active: !user.active })}
                  className="btn-secondary text-xs"
                >
                  {user.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteMutation.mutate(user._id)}
                  className="btn-ghost text-xs text-red-400 hover:text-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && <p className="text-stone-400">No users available.</p>}
        </div>
      </div>
    </SectionShell>
  );
};

const ReviewsSection = () => {
  const qc = useQueryClient();
  const { data: reviewsData } = useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: () => adminGetReviews({ page: 1, limit: 100 })
  });
  const reviews = reviewsData?.reviews ?? [];

  const deleteMutation = useMutation({
    mutationFn: adminDeleteReview,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reviews'] })
  });

  return (
    <SectionShell title="Reviews" subtitle="Moderate feedback and ratings.">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-medium">Review list</h3>
        <div className="mt-4 space-y-3">
          {reviews.map((review) => (
            <div key={review._id} className="rounded-xl bg-black/30 px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium">{review.product?.name}</p>
                <span className="text-amber-300">{review.rating} *</span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {review.user?.fullName || review.user?.username} - {new Date(review.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-stone-200 mt-2">{review.comment}</p>
              <button
                onClick={() => deleteMutation.mutate(review._id)}
                className="mt-3 btn-ghost text-xs text-red-400 hover:text-red-200"
              >
                Delete review
              </button>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-stone-400">No reviews available.</p>}
        </div>
      </div>
    </SectionShell>
  );
};

export default AdminDashboard;

