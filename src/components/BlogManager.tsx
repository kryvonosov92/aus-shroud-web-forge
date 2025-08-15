import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { uploadToAwsMedia } from "@/lib/storage";
import { createSlug } from "@/lib/slugify";
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description?: string;
  featured_image_url?: string;
  published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author_id: string;
}

interface BlogManagerProps {
  userId: string;
}

const BlogManager = ({ userId }: BlogManagerProps) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    meta_description: "",
    featured_image_url: "",
    published: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: false });
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch blog posts",
        variant: "destructive",
      });
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    const slug = createSlug(form.title);
    const postData = {
      ...form,
      slug,
      author_id: userId,
      published_at: form.published ? new Date().toISOString() : null
    };

    let result;
    if (editingPost) {
      result = await supabase
        .from("blog_posts")
        .update(postData)
        .eq("id", editingPost.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("blog_posts")
        .insert([postData])
        .select()
        .single();
    }

    if (result.error) {
      toast({
        title: "Error",
        description: `Failed to ${editingPost ? "update" : "create"} blog post`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Blog post ${editingPost ? "updated" : "created"} successfully`,
      });
      
      fetchPosts();
      setForm({
        title: "",
        content: "",
        meta_description: "",
        featured_image_url: "",
        published: false
      });
      setEditingPost(null);
      setIsCreating(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      content: post.content,
      meta_description: post.meta_description || "",
      featured_image_url: post.featured_image_url || "",
      published: post.published
    });
    setIsCreating(true);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", postId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
      fetchPosts();
    }
  };

  const togglePublish = async (post: BlogPost) => {
    const { error } = await supabase
      .from("blog_posts")
      .update({
        published: !post.published,
        published_at: !post.published ? new Date().toISOString() : null
      })
      .eq("id", post.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update publication status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Blog post ${!post.published ? "published" : "unpublished"}`,
      });
      fetchPosts();
    }
  };

  const handleCancel = () => {
    setForm({
      title: "",
      content: "",
      meta_description: "",
      featured_image_url: "",
      published: false
    });
    setEditingPost(null);
    setIsCreating(false);
  };

  if (loading) {
    return <div className="p-4">Loading blog posts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blog Management</h2>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          Create New Post
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingPost ? "Edit Blog Post" : "Create New Blog Post"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter blog post title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={form.meta_description}
                  onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                  placeholder="Brief description for SEO (160 characters max)"
                  maxLength={160}
                />
              </div>

              <div>
                <Label htmlFor="featured_image_url">Featured Image</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="featured_image_url"
                    value={form.featured_image_url}
                    onChange={(e) => setForm({ ...form, featured_image_url: e.target.value })}
                    placeholder="Paste image URL or upload below"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const url = await uploadToAwsMedia(file);
                        setForm((f) => ({ ...f, featured_image_url: url }));
                      } catch (err) {
                        console.error('Upload failed', err);
                        toast({ title: 'Upload failed', description: 'Could not upload image', variant: 'destructive' });
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <Label>Content * (Markdown)</Label>
                <div data-color-mode="light">
                  <MDEditor
                    value={form.content}
                    onChange={(val) => setForm({ ...form, content: val || "" })}
                    height={400}
                    preview="edit"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="published">Publish immediately</Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit">
                  {editingPost ? "Update Post" : "Create Post"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-muted-foreground">No blog posts yet. Create your first post!</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{post.title}</h3>
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(post.created_at).toLocaleDateString()}
                      {post.published_at && (
                        <> • Published: {new Date(post.published_at).toLocaleDateString()}</>
                      )}
                    </p>
                    {post.meta_description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {post.meta_description}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePublish(post)}
                    >
                      {post.published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(post)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(post.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogManager;