import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Calendar, User } from "lucide-react";
import { generateExcerpt } from "@/lib/slugify";
import SEO from "@/components/SEO";
import { buildAbsoluteUrl } from "@/lib/site";
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

const POSTS_PER_PAGE = 10;

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Get total count
      const { count } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);

      setTotalPosts(count || 0);

      // Get posts for current page
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
        .eq('published', true)
        .order('published_at', { ascending: false })
        .range((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE - 1);

      if (error) throw error;
      setPosts((data || []).map(post => ({
        ...post,
        profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
      })));
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <PaginationItem key="prev">
          <PaginationPrevious 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(currentPage - 1);
            }}
          />
        </PaginationItem>
      );
    }

    // First page
    if (currentPage > 2) {
      pages.push(
        <PaginationItem key="1">
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(1);
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Ellipsis at start
    if (showEllipsisStart) {
      pages.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Current page and neighbors
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={i === currentPage}
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(i);
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Ellipsis at end
    if (showEllipsisEnd) {
      pages.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Last page
    if (currentPage < totalPages - 1) {
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(totalPages);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <PaginationItem key="next">
          <PaginationNext 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(currentPage + 1);
            }}
          />
        </PaginationItem>
      );
    }

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          {pages}
        </PaginationContent>
      </Pagination>
    );
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "AusWindowShrouds Latest News & Updates",
    "description": "Stay updated with the latest news, insights, and updates from AusWindowShrouds.",
    "url": buildAbsoluteUrl("/latest"),
    "publisher": {
      "@type": "Organization",
      "name": "AusWindowShrouds",
      "url": buildAbsoluteUrl()
    },
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.meta_description || generateExcerpt(post.content),
      "url": buildAbsoluteUrl(`/latest/${post.slug}`),
      "datePublished": post.published_at,
      "author": {
        "@type": "Person",
        "name": post.profiles?.full_name || "AusWindowShrouds Team"
      }
    }))
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
      }
    ]
  };

  return (
    <>
      <SEO 
        title="Latest News & Updates - AusWindowShrouds"
        description="Stay updated with the latest news, insights, and updates from AusWindowShrouds. Discover industry trends, product updates, and expert advice."
        canonicalPath="/latest"
        structuredData={[structuredData, breadcrumbLd]}
      />
      
      <Header />
      
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <header className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-4">Latest News & Updates</h1>
              <p className="text-xl text-muted-foreground">
                Stay informed with our latest insights, product updates, and industry news
              </p>
            </header>

            {loading ? (
              <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-semibold text-foreground mb-2">No Posts Yet</h2>
                    <p className="text-muted-foreground">
                      We're working on bringing you the latest updates. Check back soon for exciting content!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-6">
                  {posts.map((post) => (
                    <article key={post.id}>
                      <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                          <div className="flex items-start gap-4">
                            {post.featured_image_url && (
                              <div className="flex-shrink-0">
                                <img
                                  src={post.featured_image_url}
                                  alt={post.title}
                                  className="w-24 h-24 object-cover rounded-lg"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <CardTitle className="text-xl mb-2">
                                <Link
                                  to={`/latest/${post.slug}`}
                                  className="hover:text-primary transition-colors"
                                >
                                  {post.title}
                                </Link>
                              </CardTitle>
                              <CardDescription className="text-base">
                                {post.meta_description || generateExcerpt(post.content)}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage 
                                    src={post.profiles?.avatar_url || undefined} 
                                    alt={post.profiles?.full_name || "Author"} 
                                  />
                                  <AvatarFallback>
                                    <User className="w-3 h-3" />
                                  </AvatarFallback>
                                </Avatar>
                                <span>{post.profiles?.full_name || "AusWindowShrouds Team"}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <time dateTime={post.published_at}>
                                  {new Date(post.published_at).toLocaleDateString('en-AU', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </time>
                              </div>
                            </div>
                            <Badge variant="secondary">Article</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </article>
                  ))}
                </div>

                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Blog;