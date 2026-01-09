import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { adminCreateCategory, adminDeleteCategory, adminGetCategories, adminUpdateCategory } from '../../../lib/api';
import type { AdminCategory } from '../../../types';
import SectionShell from '../SectionShell';

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

export default CategoriesSection;
