import SectionShell from '../SectionShell';
import ProductsForm from './products/ProductsForm';
import ProductsList from './products/ProductsList';
import useProductsSection from './products/useProductsSection';
import PaginationControls from '../components/PaginationControls';

const ProductsSection = () => {
  const {
    products,
    categories,
    subCategories,
    brands,
    page,
    totalPages,
    search,
    setPage,
    setSearch,
    editing,
    form,
    setForm,
    setCoverImage,
    setImages,
    submit,
    startEdit,
    resetForm,
    createMutation,
    updateMutation,
    deleteMutation
  } = useProductsSection();

  const handleFieldChange = (field: keyof typeof form, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <SectionShell title="Products" subtitle="Create, update, and manage inventory entries.">
      <ProductsForm
        editing={!!editing}
        form={form}
        categories={categories}
        subCategories={subCategories}
        brands={brands}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onFieldChange={handleFieldChange}
        onCoverImageChange={setCoverImage}
        onImagesChange={setImages}
        onSubmit={submit}
        onCancel={resetForm}
      />
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="input bg-white/10 text-white flex-1 min-w-[220px]"
            placeholder="Search products..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>
      <ProductsList
        products={products}
        onEdit={startEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </SectionShell>
  );
};

export default ProductsSection;
