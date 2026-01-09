import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { adminCreateBrand, adminDeleteBrand, adminGetBrands, adminUpdateBrand } from '../../../lib/api';
import type { AdminBrand } from '../../../types';
import SectionShell from '../SectionShell';

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

export default BrandsSection;
