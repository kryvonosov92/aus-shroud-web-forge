import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeExternalLinks from "rehype-external-links";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { generateExcerpt } from "@/lib/slugify";
import SEO from "@/components/SEO";
import { buildAbsoluteUrl, resolveOgImageAbsolute } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string | null;
  featured_image_url: string | null;
  published_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          content,
          meta_description,
          featured_image_url,
          published_at,
          profiles!blog_posts_author_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error || !data) {
        setNotFound(true);
        return;
      }

      setPost({
        ...data,
        profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
      });
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
                <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
                <div className="h-64 bg-muted rounded mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                  <div className="h-4 bg-muted rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !post) {
    return (
      <>
        <SEO 
          title="Post Not Found - AusWindowShrouds"
          description="The blog post you're looking for could not be found."
          noindex={true}
        />
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">Post Not Found</h1>
              <p className="text-xl text-muted-foreground mb-8">
                The blog post you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link to="/latest">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const description = post.meta_description || generateExcerpt(post.content, 25);
  const publishedDate = new Date(post.published_at);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": description,
    "image": resolveOgImageAbsolute(post.featured_image_url),
    "author": {
      "@type": "Person",
      "name": post.profiles?.full_name || "AusWindowShrouds Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AusWindowShrouds",
      "url": buildAbsoluteUrl()
    },
    "datePublished": post.published_at,
    "dateModified": post.published_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": buildAbsoluteUrl(`/latest/${post.slug}`)
    }
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": buildAbsoluteUrl("/")
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Latest",
        "item": buildAbsoluteUrl("/latest")
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": buildAbsoluteUrl(`/latest/${post.slug}`)
      }
    ]
  };

  return (
    <>
      <SEO 
        title={`${post.title} - AusWindowShrouds`}
        description={description}
        canonicalPath={`/latest/${post.slug}`}
        image={post.featured_image_url || undefined}
        structuredData={[structuredData, breadcrumbLd]}
      />
      
      <Header />
      
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back to blog button */}
            <div className="mb-8">
              <Button variant="ghost" asChild>
                <Link to="/latest">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>
            </div>

            {/* Article header */}
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
                {post.title}
              </h1>
              
              <div className="flex items-center gap-4 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage 
                      src={post.profiles?.avatar_url || undefined} 
                      alt={post.profiles?.full_name || "Author"} 
                    />
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {post.profiles?.full_name || "AusWindowShrouds Team"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.published_at}>
                    {publishedDate.toLocaleDateString('en-AU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
              </div>

              {/* Featured image */}
              {post.featured_image_url && (
                <div className="mb-8">
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full h-auto rounded-lg shadow-lg"
                    style={{ maxHeight: '500px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </header>

            {/* Article content */}
            <article className="prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                  rehypeSanitize,
                  [rehypeExternalLinks, { target: '_blank', rel: 'noopener noreferrer' }]
                ]}
                components={{
                  h1: ({ children }) => <h1 className="text-3xl font-bold text-foreground mt-8 mb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl font-semibold text-foreground mt-6 mb-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-semibold text-foreground mt-5 mb-2">{children}</h3>,
                  p: ({ children }) => <p className="text-foreground leading-relaxed mb-4">{children}</p>,
                  a: ({ href, children }) => (
                    <a 
                      href={href} 
                      className="text-primary hover:text-primary/80 underline underline-offset-2"
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {children}
                    </a>
                  ),
                  ul: ({ children }) => <ul className="list-disc list-inside mb-4 text-foreground">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-4 text-foreground">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>
                  ),
                  img: ({ src, alt }) => (
                    <img 
                      src={src} 
                      alt={alt || ''} 
                      className="w-full h-auto rounded-lg shadow-md my-6"
                    />
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </article>

            {/* Author footer */}
            <footer className="mt-12 pt-8 border-t border-border">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage 
                        src={post.profiles?.avatar_url || undefined} 
                        alt={post.profiles?.full_name || "Author"} 
                      />
                      <AvatarFallback className="text-lg">
                        <User className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {post.profiles?.full_name || "AusWindowShrouds Team"}
                      </h3>
                      <p className="text-muted-foreground">
                        Author of this article
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </footer>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default BlogPost;