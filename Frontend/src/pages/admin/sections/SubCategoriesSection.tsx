import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import {
  adminCreateSubCategory,
  adminDeleteSubCategory,
  adminGetCategories,
  adminGetSubCategories,
  adminUpdateSubCategory
} from '../../../lib/api';
import type { AdminSubCategory } from '../../../types';
import SectionShell from '../SectionShell';

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

export default SubCategoriesSection;
