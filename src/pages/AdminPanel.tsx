import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Product type
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

const AdminPanel = () => {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Product>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const email = (e.target as any).email.value;
    const password = (e.target as any).password.value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // CRUD handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    if (editingId) {
      // Update
      const { data, error } = await supabase
        .from("products")
        .update(form)
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
        .insert([{ ...form, price: Number(form.price) }])
        .select();
      if (!error && data) {
        setProducts([...products, data[0]]);
        setForm({});
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-auto">
            <CardHeader>
              <CardTitle>Admin Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <input name="email" type="email" placeholder="Email" className="w-full border p-2 rounded" required />
                <input name="password" type="password" placeholder="Password" className="w-full border p-2 rounded" required />
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <Button type="submit" className="w-full">Login</Button>
              </form>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Product" : "Add Product"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" value={form.name || ""} onChange={handleChange} placeholder="Name" className="border p-2 rounded" required />
              <input name="price" value={form.price || ""} onChange={handleChange} placeholder="Price" type="number" min="0" step="0.01" className="border p-2 rounded" required />
              <input name="image_url" value={form.image_url || ""} onChange={handleChange} placeholder="Image URL" className="border p-2 rounded" required />
              <input name="category" value={form.category || ""} onChange={handleChange} placeholder="Category" className="border p-2 rounded" />
              <textarea name="description" value={form.description || ""} onChange={handleChange} placeholder="Description" className="border p-2 rounded col-span-1 md:col-span-2" required />
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
                    <th className="p-2 border">Price</th>
                    <th className="p-2 border">Category</th>
                    <th className="p-2 border">Image</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="p-2 border">{product.name}</td>
                      <td className="p-2 border">${parseFloat(product.price as any).toLocaleString()}</td>
                      <td className="p-2 border">{product.category}</td>
                      <td className="p-2 border"><img src={product.image_url} alt={product.name} className="h-12 w-12 object-cover" /></td>
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
      </main>
      <Footer />
    </div>
  );
};

export default AdminPanel; 