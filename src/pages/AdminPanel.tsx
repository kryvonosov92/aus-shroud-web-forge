import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BlogManager from "@/components/BlogManager";
import SEO from "@/components/SEO";
import { createSlug } from "@/lib/slugify";
import ProductImagesManager from "@/components/ProductImagesManager";
import StandardConfigsEditor, { StandardConfigItem } from "@/components/admin/StandardConfigsEditor";
import TabbedContentEditor from "@/components/admin/TabbedContentEditor";
import ErrorBoundary from "@/components/ErrorBoundary";
import { uploadToAwsMedia } from "@/lib/storage";

// Product type
interface Product {
  id: string;
  name: string;
  description: string;
  images?: string[];
  category?: string;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

const AdminPanel = () => {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({ feature_tags: [], specifications: null, colour_options: null, sort_order: undefined, images: [] });
  const [initialForm, setInitialForm] = useState<any>(null);
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Auth state
  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Fetch products
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setProducts(data);
        setLoading(false);
      });
  }, [user]);

  // Auth handlers
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // CRUD handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setDirty((d) => ({ ...d, [name]: true }));
    if (name === 'name') {
      const slug = createSlug(value || '');
      setForm((prev: any) => ({ ...prev, slug }));
    }
  };
  const handleFeatureTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const tags = raw.split(',').map(t => t.trim()).filter(Boolean);
    setForm({ ...form, feature_tags: tags });
    setDirty((d) => ({ ...d, feature_tags: true }));
  };
  const handleSpecificationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsed = e.target.value ? JSON.parse(e.target.value) : null;
      setForm({ ...form, specifications: parsed });
      setDirty((d) => ({ ...d, specifications: true }));
    } catch {
      // ignore parse errors while typing
      setForm({ ...form, specifications: e.target.value });
    }
  };
  const handleColourOptionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsed = e.target.value ? JSON.parse(e.target.value) : null;
      setForm({ ...form, colour_options: parsed });
      setDirty((d) => ({ ...d, colour_options: true }));
    } catch {
      setForm({ ...form, colour_options: e.target.value });
    }
  };
  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    const base = { ...product } as any;
    if (!Array.isArray((base as any).images)) {
      const merged = [] as string[];
      if (base.image_url) merged.push(base.image_url);
      if (Array.isArray(base.additional_images)) merged.push(...base.additional_images);
      base.images = merged;
    }
    setForm(base);
    setInitialForm(base);
    setDirty({});
  };
  const handleDelete = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setProducts(products.filter((p) => p.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    // Basic validation for new flexible fields
    if (form.show_standard_configs) {
      const items = (form.standard_configurations as any[]) || [];
      const invalid = items.some((it) => !it || !it.title || !it.image);
      if (invalid) {
        setFormError("Please complete all Standard Configurations: each item requires a title and an image.");
        return;
      }
    }
    if (form.tabbed_content) {
      try {
        const tc = typeof form.tabbed_content === 'string' ? JSON.parse(form.tabbed_content) : form.tabbed_content;
        if (tc && Array.isArray(tc.tabs)) {
          for (const tab of tc.tabs) {
            if (!tab || !tab.title || !Array.isArray(tab.columns)) {
              setFormError("Each tab must include a title and at least one column.");
              return;
            }
            for (const col of tab.columns) {
              if (!col || !Array.isArray(col.sections)) continue;
              for (const sec of col.sections) {
                if (sec && Array.isArray(sec.rows)) {
                  for (const row of sec.rows) {
                    if (!row || !row.label) {
                      setFormError("All rows in tabbed content must have a label.");
                      return;
                    }
                  }
                }
              }
            }
          }
        }
      } catch {
        setFormError("Tabbed Content JSON is invalid. Please correct the JSON.");
        return;
      }
    }
    // Build partial update based on dirty fields
    const updatePayload: any = {};
    Object.keys(dirty).forEach((key) => {
      if (dirty[key]) updatePayload[key] = (form as any)[key];
    });
    
    // Ensure JSON fields are objects, not raw strings
    let specifications = updatePayload.specifications;
    let colour_options = updatePayload.colour_options;
    let tabbed_content = updatePayload.tabbed_content;
    if (typeof specifications === 'string') {
      try { specifications = JSON.parse(specifications); } catch { specifications = null; }
    }
    if (typeof colour_options === 'string') {
      try { colour_options = JSON.parse(colour_options); } catch { colour_options = null; }
    }
    if (typeof tabbed_content === 'string') {
      try { tabbed_content = JSON.parse(tabbed_content); } catch { tabbed_content = null; }
    }
    updatePayload.specifications = specifications;
    updatePayload.colour_options = colour_options;
    updatePayload.tabbed_content = tabbed_content;
    // images handled via ProductImagesManager
    if (editingId) {
      // Update
      const { data, error } = await supabase
        .from("products")
        .update(updatePayload)
        .eq("id", editingId)
        .select();
      if (!error && data) {
        setProducts(products.map((p) => (p.id === editingId ? data[0] : p)));
        setEditingId(null);
        setForm({});
        
      }
    } else {
      // Create
      const { data, error } = await supabase
        .from("products")
        .insert([{ ...form }])
        .select();
      if (!error && data) {
        setProducts([...products, data[0]]);
        setForm({});
        
      }
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Admin Panel | AusWindowShrouds" noindex canonicalPath="/admin" />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="flex gap-2">
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        </div>
        
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="space-y-6">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Product" : "Add Product"}</CardTitle>
          </CardHeader>
          <CardContent>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formError && (
                <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
                  {formError}
                </div>
              )}
              <input name="name" value={form.name || ""} onChange={handleChange} placeholder="Name" className="border p-2 rounded" required />
              <input name="slug" value={form.slug || ""} onChange={handleChange} placeholder="Slug" className="border p-2 rounded" required />
              
              <input name="category" value={form.category || ""} onChange={handleChange} placeholder="Category" className="border p-2 rounded" />
              <input name="sort_order" value={form.sort_order ?? ''} onChange={(e) => setForm({ ...form, sort_order: e.target.value === '' ? undefined : (Number(e.target.value) || 0) })} placeholder="Sort Order Priority" type="number" min="0" step="1" className="border p-2 rounded" />
              <textarea name="description" value={form.description || ""} onChange={handleChange} placeholder="Description" className="border p-2 rounded col-span-1 md:col-span-2" required />
              <input name="feature_tags_input" value={Array.isArray(form.feature_tags) ? (form.feature_tags as string[]).join(', ') : ''} onChange={handleFeatureTagsChange} placeholder="Feature tags (comma-separated)" className="border p-2 rounded col-span-1 md:col-span-2" />
              
              <div className="col-span-1 md:col-span-2">
                <label className="block mb-2">Images</label>
                <ProductImagesManager
                  images={form.images || []}
                  onChange={(imgs) => { setForm({ ...form, images: imgs }); setDirty((d) => ({ ...d, images: true })); }}
                  onUploadFiles={async (files) => {
                    const urls: string[] = [];
                    for (const file of files) {
                      const url = await uploadToAwsMedia(file);
                      urls.push(url);
                    }
                    return urls;
                  }}
                  onDeleteImage={async (_url) => { return; }}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="show_standard_configs"
                    checked={!!form.show_standard_configs}
                    onChange={(e)=>{ setForm({ ...form, show_standard_configs: e.target.checked }); setDirty((d)=>({ ...d, show_standard_configs: true })); }}
                  />
                  <label htmlFor="show_standard_configs">Show Standard Configurations</label>
                </div>
                {form.show_standard_configs && (
                  <StandardConfigsEditor
                    items={(form.standard_configurations as StandardConfigItem[]) || []}
                    onChange={(next)=>{ setForm({ ...form, standard_configurations: next }); setDirty((d)=>({ ...d, standard_configurations: true })); }}
                  />
                )}
              </div>

              <div className="col-span-1 md:col-span-2 space-y-4">
                <ErrorBoundary>
                  <TabbedContentEditor
                    value={form.tabbed_content || null}
                    onChange={(v)=>{ setForm({ ...form, tabbed_content: v }); setDirty((d)=>({ ...d, tabbed_content: true })); }}
                  />
                </ErrorBoundary>
                <div>
                  <label className="block mb-1">Tabbed Content (JSON)</label>
                  <textarea
                    name="tabbed_content"
                    value={typeof form.tabbed_content === 'string' ? form.tabbed_content : JSON.stringify(form.tabbed_content || { tabs: [] }, null, 2)}
                    onChange={(e)=>{
                      try {
                        const parsed = e.target.value ? JSON.parse(e.target.value) : null;
                        setForm({ ...form, tabbed_content: parsed });
                      } catch {
                        setForm({ ...form, tabbed_content: e.target.value });
                      }
                      setDirty((d)=>({ ...d, tabbed_content: true }));
                    }}
                    className="border p-2 rounded w-full h-40 font-mono text-sm"
                  />
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 flex gap-2">
                <Button type="submit">{editingId ? "Update" : "Add"} Product</Button>
                {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm({}); }}>Cancel</Button>}
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <table className="w-full border mt-4">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 border">Name</th>
                    
                    <th className="p-2 border">Category</th>
                    <th className="p-2 border">Images</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="p-2 border">{product.name}</td>
                      
                      <td className="p-2 border">{product.category}</td>
                      <td className="p-2 border">
                        <div className="flex items-center gap-2">
                          {product.images && product.images.length > 0 && (
                            <img src={product.images[0]} alt={product.name} className="h-12 w-12 object-cover" />
                          )}
                          {product.images && product.images.length > 1 && (
                            <span className="text-xs text-muted-foreground">+{product.images.length - 1}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 border">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)} className="ml-2">Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
          </TabsContent>
          
          <TabsContent value="blog">
            <BlogManager userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPanel; 