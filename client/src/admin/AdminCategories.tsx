// client/src/admin/AdminCategories.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Tags, PlusCircle, CheckCircle2, XCircle, Utensils } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const toast = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Category Form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Utensils');
  const [creating, setCreating] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminCategories();
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error('Category name and slug are required.');
      return;
    }

    setCreating(true);
    try {
      const res = await api.createCategory({ name, slug, description, icon });
      if (res.success) {
        toast.success(`Category "${name}" created!`);
        setName('');
        setSlug('');
        setDescription('');
        fetchCategories();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create category.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (cat: any) => {
    const newActive = cat.is_active === 1 ? 0 : 1;
    try {
      await api.updateCategory(cat.id, { is_active: newActive });
      toast.success(`Category ${newActive ? 'activated' : 'disabled'}.`);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update category.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-white">Food Category Management</h2>
        <p className="text-xs text-saveplate-muted">
          Organize food listings into standardized taxonomy with nutritional classifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create Category Form */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass">
          <h3 className="text-base font-display font-bold text-white mb-1">Add New Category</h3>
          <p className="text-xs text-saveplate-muted mb-4">Define a new surplus category for donor listings.</p>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-saveplate-cream mb-1">Category Name *</label>
              <input
                type="text"
                required
                placeholder="E.g., Prepared Soups & Stews"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-saveplate-card border border-white/10 text-white focus:outline-none focus:border-saveplate-neon"
              />
            </div>

            <div>
              <label className="block font-semibold text-saveplate-cream mb-1">URL Slug *</label>
              <input
                type="text"
                required
                placeholder="prepared-soups"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-saveplate-card border border-white/10 text-white font-mono focus:outline-none focus:border-saveplate-neon"
              />
            </div>

            <div>
              <label className="block font-semibold text-saveplate-cream mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Guidance on items belonging to this category..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-saveplate-card border border-white/10 text-white focus:outline-none focus:border-saveplate-neon resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-2.5 rounded-xl bg-saveplate-neon text-black font-bold text-xs shadow-neon disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Food Category'}
            </button>
          </form>
        </div>

        {/* Existing Categories Table */}
        <div className="lg:col-span-7 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-saveplate-forest/30 text-saveplate-muted uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Active Listings</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-saveplate-muted">
                      Loading categories...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-saveplate-muted">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{c.name}</div>
                        <div className="text-[11px] text-saveplate-muted truncate max-w-[200px]">{c.description}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-saveplate-muted">
                        {c.slug}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-saveplate-neon">
                        {c.listing_count || 0} listings
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                          c.is_active === 1
                            ? 'bg-saveplate-neon/20 text-saveplate-neon'
                            : 'bg-white/10 text-saveplate-muted'
                        }`}>
                          {c.is_active === 1 ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleActive(c)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] transition-colors"
                        >
                          {c.is_active === 1 ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

