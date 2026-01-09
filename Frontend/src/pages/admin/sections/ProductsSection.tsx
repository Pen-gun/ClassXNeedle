import SectionShell from '../SectionShell';
import ProductsForm from './products/ProductsForm';
import ProductsList from './products/ProductsList';
import useProductsSection from './products/useProductsSection';

const ProductsSection = () => {
  const {
    products,
    categories,
    subCategories,
    brands,
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
      <ProductsList
        products={products}
        onEdit={startEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
    </SectionShell>
  );
};

export default ProductsSection;
