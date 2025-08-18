import { useEffect, useMemo, useRef, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";

// Product type
interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  images?: string[];
  category?: string;
  sort_order?: number | null;
  created_at?: string;
  updated_at?: string;
  feature_tags?: string[];
  show_standard_configs?: boolean;
  standard_configurations?: StandardConfigItem[];
  tabbed_content?: any; // JSONB
}

type ProductFormValues = {
  name: string;
  slug: string;
  category: string;
  sort_order?: number | "";
  description: string;
  feature_tags: string[];
  images: string[];
  show_standard_configs: boolean;
  standard_configurations: StandardConfigItem[];
  tabbed_content: any | null | string; // allow temporary string for invalid JSON typing while editing
};

const tabbedContentSchema = Yup.object({
  tabs: Yup.array()
    .of(
      Yup.object({
        id: Yup.string().required(),
        title: Yup.string().required("Tab title is required"),
        columns: Yup.array()
          .of(
            Yup.object({
              sections: Yup.array()
                .of(
                  Yup.object({
                    heading: Yup.string().required("Section heading is required"),
                    rows: Yup.array()
                      .of(
                        Yup.object({
                          label: Yup.string().required("Row label is required"),
                          value: Yup.string().nullable().default("")
                        })
                      )
                      .default([])
                  })
                )
                .default([])
            })
          )
          .default([])
      })
    )
    .default([])
});

const productSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  slug: Yup.string().required("Slug is required"),
  category: Yup.string().nullable().default(""),
  sort_order: Yup.mixed<number | "">()
    .test("is-integer-or-empty", "Sort order must be a non-negative integer", (val) => {
      if (val === "" || val === undefined || val === null) return true;
      if (typeof val !== "number") return false;
      return Number.isInteger(val) && val >= 0;
    }),
  description: Yup.string().required("Description is required"),
  feature_tags: Yup.array().of(Yup.string().trim()).default([]),
  images: Yup.array().of(Yup.string().url("Image must be a valid URL")).default([]),
  show_standard_configs: Yup.boolean().default(false),
  standard_configurations: Yup.array()
    .of(
      Yup.object({
        id: Yup.string().required(),
        title: Yup.string().trim().required("Title is required"),
        image: Yup.string().trim().url("Image must be a valid URL").required("Image is required"),
      })
    )
    .default([])
    .when("show_standard_configs", {
      is: true,
      then: (schema) => schema.min(1, "Add at least one standard configuration"),
      otherwise: (schema) => schema
    }),
  tabbed_content: Yup.mixed()
    .nullable()
    .test("valid-tabbed-content", "Tabbed Content JSON is invalid", (value) => {
      if (value == null) return true;
      if (typeof value === "string") return false;
      try {
        tabbedContentSchema.validateSync(value, { abortEarly: false });
        return true;
      } catch {
        return false;
      }
    })
});

const AdminPanel = () => {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const formikRef = useRef<import("formik").FormikProps<ProductFormValues> | null>(null);

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
  const initialValues: ProductFormValues = useMemo(() => ({
    name: "",
    slug: "",
    category: "",
    sort_order: "",
    description: "",
    feature_tags: [],
    images: [],
    show_standard_configs: false,
    standard_configurations: [],
    tabbed_content: null
  }), []);
  
  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    const base = { ...(product as any) } as ProductFormValues & Partial<Product>;
    const nextValues: ProductFormValues = {
      name: String(base.name || ""),
      slug: String(base.slug || createSlug(base.name || "")),
      category: String(base.category || ""),
      sort_order: typeof base.sort_order === "number" ? base.sort_order : "",
      description: String(base.description || ""),
      feature_tags: Array.isArray(base.feature_tags) ? base.feature_tags as string[] : [],
      images: Array.isArray(base.images) ? (base.images as string[]) : [],
      show_standard_configs: Boolean(base.show_standard_configs),
      standard_configurations: Array.isArray(base.standard_configurations) ? (base.standard_configurations as StandardConfigItem[]) : [],
      tabbed_content: base.tabbed_content ?? null
    };
    formikRef.current?.setValues(nextValues, false);
    // Reset form state: touched/errors will be reset by setValues(false)
  };
  const handleDelete = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setProducts(products.filter((p) => p.id !== id));
    if (editingId === id) {
      setEditingId(null);
      formikRef.current?.resetForm({ values: initialValues });
    }
  };

  const onSubmit = async (values: ProductFormValues, helpers: import("formik").FormikHelpers<ProductFormValues>) => {
    // Prepare payload
    const cleaned: any = {
      name: values.name,
      slug: values.slug,
      category: values.category || null,
      sort_order: values.sort_order === "" ? null : values.sort_order,
      description: values.description,
      feature_tags: values.feature_tags || [],
      images: values.images || [],
      show_standard_configs: values.show_standard_configs,
      standard_configurations: values.show_standard_configs ? (values.standard_configurations || []) : [],
      tabbed_content: values.tabbed_content == null || typeof values.tabbed_content === 'string' ? null : values.tabbed_content
    };

    if (editingId) {
      // Update only changed fields by diffing with current product
      const existing = products.find((p) => p.id === editingId);
      const updatePayload: Record<string, any> = {};
      if (existing) {
        const keys = Object.keys(cleaned) as Array<keyof typeof cleaned>;
        for (const key of keys) {
          const prevVal = (existing as any)[key];
          const nextVal = (cleaned as any)[key];
          const isEqual = JSON.stringify(prevVal) === JSON.stringify(nextVal);
          if (!isEqual) updatePayload[key as string] = nextVal;
        }
      } else {
        Object.assign(updatePayload, cleaned);
      }

      const { data, error } = await supabase
        .from("products")
        .update(updatePayload)
        .eq("id", editingId)
        .select();
      if (!error && data) {
        setProducts(products.map((p) => (p.id === editingId ? data[0] : p)));
        setEditingId(null);
        helpers.resetForm({ values: initialValues });
      }
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert([{ ...cleaned }])
        .select();
      if (!error && data) {
        setProducts([...products, data[0] as Product]);
        helpers.resetForm({ values: initialValues });
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
            <Formik
              innerRef={(ref) => (formikRef.current = ref)}
              initialValues={initialValues}
              validationSchema={productSchema}
              enableReinitialize={false}
              onSubmit={onSubmit}
            >
              {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
                <FormikForm className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(errors as any)?.tabbed_content === "Tabbed Content JSON is invalid" && (
                    <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
                      Tabbed Content JSON is invalid. Please correct the JSON.
                    </div>
                  )}
                  <Input
                    name="name"
                    value={values.name}
                    onChange={(e) => {
                      handleChange(e);
                      setFieldValue("slug", createSlug(e.target.value || ""), false);
                    }}
                    onBlur={handleBlur}
                    placeholder="Name"
                    required
                  />
                  <Input
                    name="slug"
                    value={values.slug}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Slug"
                    required
                  />
                  <Input name="category" value={values.category} onChange={handleChange} onBlur={handleBlur} placeholder="Category" />
                  <Input
                    name="sort_order"
                    value={values.sort_order === "" ? "" : String(values.sort_order)}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") setFieldValue("sort_order", "");
                      else setFieldValue("sort_order", Number(raw) || 0);
                    }}
                    placeholder="Sort Order Priority"
                    type="number"
                    min="0"
                    step="1"
                    required
                  />
                  <Textarea
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Description"
                    className="col-span-1 md:col-span-2"
                    required
                  />
                  <Input
                    name="feature_tags_input"
                    value={(values.feature_tags || []).join(', ')}
                    onChange={(e) => {
                      const raw = e.target.value ?? "";
                      const tags = raw.split(',').map((t) => t.trim()).filter(Boolean);
                      setFieldValue('feature_tags', tags);
                    }}
                    placeholder="Feature tags (comma-separated)"
                    className="col-span-1 md:col-span-2"
                  />

                  <div className="col-span-1 md:col-span-2">
                    <label className="block mb-2">Images</label>
                    <ProductImagesManager
                      images={values.images || []}
                      onChange={(imgs) => setFieldValue('images', imgs)}
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
                      <Checkbox
                        id="show_standard_configs"
                        checked={!!values.show_standard_configs}
                        onCheckedChange={(v) => setFieldValue('show_standard_configs', Boolean(v))}
                      />
                      <label htmlFor="show_standard_configs">Show Standard Configurations</label>
                    </div>
                    {values.show_standard_configs && (
                      <StandardConfigsEditor
                        items={(values.standard_configurations as StandardConfigItem[]) || []}
                        onChange={(next) => setFieldValue('standard_configurations', next)}
                      />
                    )}
                    {touched.standard_configurations && typeof errors.standard_configurations === 'string' && (
                      <div className="text-xs text-red-600 mt-2">{errors.standard_configurations}</div>
                    )}
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-4">
                    <ErrorBoundary>
                      <TabbedContentEditor
                        value={typeof values.tabbed_content === 'string' ? null : (values.tabbed_content || null)}
                        onChange={(v) => setFieldValue('tabbed_content', v)}
                      />
                    </ErrorBoundary>
                    <div>
                      <label className="block mb-1">Tabbed Content (JSON)</label>
                      <Textarea
                        name="tabbed_content_json"
                        value={typeof values.tabbed_content === 'string' ? values.tabbed_content : JSON.stringify(values.tabbed_content || { tabs: [] }, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = e.target.value ? JSON.parse(e.target.value) : null;
                            setFieldValue('tabbed_content', parsed, true);
                          } catch {
                            setFieldValue('tabbed_content', e.target.value, true);
                          }
                        }}
                        className="w-full h-40 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 flex gap-2">
                    <Button type="submit" disabled={isSubmitting}>{editingId ? "Update" : "Add"} Product</Button>
                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          (formikRef.current as any)?.resetForm({ values: initialValues });
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </FormikForm>
              )}
            </Formik>
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