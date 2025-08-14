import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BlogManager from "@/components/BlogManager";
import SEO from "@/components/SEO";

// Product type
interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  additional_images?: string[];
  category?: string;
  created_at?: string;
  updated_at?: string;
}

const AdminPanel = () => {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({ feature_tags: [], specifications: null, colour_options: null });
  const [editingId, setEditingId] = useState<string | null>(null);
  // Removed local email/password auth; errors now managed via toasts where needed
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);

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
    if (name === 'name') {
      const slug = (value || '').toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-');
      setForm((prev: any) => ({ ...prev, slug }));
    }
  };
  const handleFeatureTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const tags = raw.split(',').map(t => t.trim()).filter(Boolean);
    setForm({ ...form, feature_tags: tags });
  };
  const handleSpecificationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsed = e.target.value ? JSON.parse(e.target.value) : null;
      setForm({ ...form, specifications: parsed });
    } catch {
      // ignore parse errors while typing
      setForm({ ...form, specifications: e.target.value });
    }
  };
  const handleColourOptionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsed = e.target.value ? JSON.parse(e.target.value) : null;
      setForm({ ...form, colour_options: parsed });
    } catch {
      setForm({ ...form, colour_options: e.target.value });
    }
  };
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImageFile(e.target.files[0]);
    }
  };
  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAdditionalImageFiles(Array.from(e.target.files));
    }
  };
  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm(product);
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
    let image_url = form.image_url || "";
    let additional_images: string[] = form.additional_images || [];
    // Ensure JSON fields are objects, not raw strings
    let specifications = form.specifications;
    let colour_options = form.colour_options;
    if (typeof specifications === 'string') {
      try { specifications = JSON.parse(specifications); } catch { specifications = null; }
    }
    if (typeof colour_options === 'string') {
      try { colour_options = JSON.parse(colour_options); } catch { colour_options = null; }
    }
    // Upload main image if selected
    if (mainImageFile) {
      const fileExt = mainImageFile.name.split('.').pop();
      const filePath = `products/${Date.now()}-main.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('aws-media').upload(filePath, mainImageFile, { upsert: true });
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('aws-media').getPublicUrl(filePath);
        image_url = publicUrlData.publicUrl;
      }
    }
    // Upload additional images if selected
    if (additionalImageFiles.length > 0) {
      const uploadedUrls: string[] = [];
      for (const file of additionalImageFiles) {
        const fileExt = file.name.split('.').pop();
        const filePath = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('aws-media').upload(filePath, file, { upsert: true });
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('aws-media').getPublicUrl(filePath);
          uploadedUrls.push(publicUrlData.publicUrl);
        }
      }
      additional_images = uploadedUrls;
    }
    if (editingId) {
      // Update
      const { data, error } = await supabase
        .from("products")
        .update({ ...form, image_url, additional_images })
        .eq("id", editingId)
        .select();
      if (!error && data) {
        setProducts(products.map((p) => (p.id === editingId ? data[0] : p)));
        setEditingId(null);
        setForm({});
        setMainImageFile(null);
        setAdditionalImageFiles([]);
      }
    } else {
      // Create
      const { data, error } = await supabase
        .from("products")
        .insert([{ ...form, image_url, additional_images }])
        .select();
      if (!error && data) {
        setProducts([...products, data[0]]);
        setForm({});
        setMainImageFile(null);
        setAdditionalImageFiles([]);
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
          <Button onClick={handleLogout}>Logout</Button>
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
              <input name="name" value={form.name || ""} onChange={handleChange} placeholder="Name" className="border p-2 rounded" required />
              <input name="slug" value={form.slug || ""} onChange={handleChange} placeholder="Slug" className="border p-2 rounded" required />
              
              <input name="category" value={form.category || ""} onChange={handleChange} placeholder="Category" className="border p-2 rounded" />
              <textarea name="description" value={form.description || ""} onChange={handleChange} placeholder="Description" className="border p-2 rounded col-span-1 md:col-span-2" required />
              <input name="feature_tags_input" value={(form.feature_tags || []).join(', ')} onChange={handleFeatureTagsChange} placeholder="Feature tags (comma-separated)" className="border p-2 rounded col-span-1 md:col-span-2" />
              <div className="col-span-1 md:col-span-2">
                <label className="block mb-1">Specifications (JSON)</label>
                <textarea name="specifications" value={typeof form.specifications === 'string' ? form.specifications : JSON.stringify(form.specifications || {}, null, 2)} onChange={handleSpecificationsChange} className="border p-2 rounded w-full h-40 font-mono text-sm" />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block mb-1">Colour Options (JSON)</label>
                <textarea name="colour_options" value={typeof form.colour_options === 'string' ? form.colour_options : JSON.stringify(form.colour_options || {}, null, 2)} onChange={handleColourOptionsChange} className="border p-2 rounded w-full h-40 font-mono text-sm" />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block mb-1">Main Featured Image</label>
                <input type="file" accept="image/*" onChange={handleMainImageChange} />
                {mainImageFile && <img src={URL.createObjectURL(mainImageFile)} alt="Preview" className="h-24 mt-2 object-cover" />}
                {form.image_url && !mainImageFile && <img src={form.image_url} alt="Current" className="h-24 mt-2 object-cover" />}
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block mb-1">Additional Images</label>
                <input type="file" accept="image/*" multiple onChange={handleAdditionalImagesChange} />
                <div className="flex gap-2 mt-2">
                  {additionalImageFiles.map((file, idx) => (
                    <img key={idx} src={URL.createObjectURL(file)} alt="Preview" className="h-16 object-cover" />
                  ))}
                  {form.additional_images && !additionalImageFiles.length && form.additional_images.map((url, idx) => (
                    <img key={idx} src={url} alt="Current" className="h-16 object-cover" />
                  ))}
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 flex gap-2">
                <Button type="submit">{editingId ? "Update" : "Add"} Product</Button>
                {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm({}); setMainImageFile(null); setAdditionalImageFiles([]); }}>Cancel</Button>}
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
                    <th className="p-2 border">Image</th>
                    <th className="p-2 border">Additional Images</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="p-2 border">{product.name}</td>
                      
                      <td className="p-2 border">{product.category}</td>
                      <td className="p-2 border"><img src={product.image_url} alt={product.name} className="h-12 w-12 object-cover" /></td>
                      <td className="p-2 border">
                        <div className="flex gap-1">
                          {product.additional_images && product.additional_images.map((url, idx) => (
                            <img key={idx} src={url} alt={product.name + " additional"} className="h-8 w-8 object-cover" />
                          ))}
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