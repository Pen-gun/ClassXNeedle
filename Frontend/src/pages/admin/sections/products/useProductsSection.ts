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
} from '../../../../lib/api';
import type { AdminBrand, AdminCategory, AdminProduct, AdminSubCategory } from '../../../../types';
import useDebouncedValue from '../../../../hooks/useDebouncedValue';

export type ProductFormState = {
  name: string;
  description: string;
  price: string;
  priceAfterDiscount: string;
  quantity: string;
  material: string;
  gender: string;
  size: string;
  color: string;
  category: string;
  subCategory: string;
  brand: string;
};

const initialFormState: ProductFormState = {
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
};

const useProductsSection = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 20;
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: productsData } = useQuery({
    queryKey: ['admin', 'products', { page, limit, search: debouncedSearch }],
    queryFn: () => adminGetProducts({ page, limit, search: debouncedSearch || undefined }),
    placeholderData: (previous) => previous
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

  const products = (productsData?.products ?? []) as AdminProduct[];
  const totalPages = productsData?.pagination?.totalPages ?? 1;
  const categories = (categoriesData?.categories ?? []) as AdminCategory[];
  const subCategories = (subCategoriesData?.subCategories ?? []) as AdminSubCategory[];
  const brands = (brandsData?.brands ?? []) as AdminBrand[];

  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<ProductFormState>(initialFormState);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | null>(null);

  const resetForm = () => {
    setEditing(null);
    setForm(initialFormState);
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

  const submit = (event: FormEvent) => {
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

  return {
    products,
    page,
    totalPages,
    search,
    setPage,
    setSearch,
    categories,
    subCategories,
    brands,
    editing,
    form,
    setForm,
    coverImage,
    setCoverImage,
    images,
    setImages,
    submit,
    startEdit,
    resetForm,
    createMutation,
    updateMutation,
    deleteMutation
  };
};

export default useProductsSection;
