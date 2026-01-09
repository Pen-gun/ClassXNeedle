import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { adminCreateCoupon, adminDeleteCoupon, adminGetCoupons, adminUpdateCoupon } from '../../../lib/api';
import type { AdminCoupon } from '../../../types';
import SectionShell from '../SectionShell';

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

export default CouponsSection;
