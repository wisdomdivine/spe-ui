import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, description, cover_image_url, author_name, author, category, tags")
    .eq("slug", slug)
    .eq("status", "Published")
    .single();

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The blog post you're looking for doesn't exist or isn't published yet.",
      openGraph: {
        images: [
          {
            url: "/opengraph-image",
            width: 1200,
            height: 630,
            alt: "SPE University of Ibadan",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        images: ["/twitter-image"],
      },
    };
  }

  const title = post.title;
  const description =
    post.description ||
    `Read "${post.title}" by ${post.author_name || post.author || "SPE UI"} on the SPE University of Ibadan blog.`;

  // Check if blog has a valid cover / feature image
  const featuredImage =
    post.cover_image_url && typeof post.cover_image_url === "string" && post.cover_image_url.trim().length > 0
      ? post.cover_image_url.trim()
      : null;

  const ogImages = featuredImage
    ? [{ url: featuredImage, alt: title }]
    : [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: title || "SPE University of Ibadan",
        },
      ];

  const twitterImages = featuredImage ? [featuredImage] : ["/twitter-image"];

  return {
    title,
    description,
    keywords: [
      ...(post.tags || []),
      post.category,
      "SPE",
      "University of Ibadan",
      "blog",
    ].filter(Boolean),
    openGraph: {
      type: "article",
      title,
      description,
      images: ogImages,
      authors: [post.author_name || post.author || "SPE UI"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: twitterImages,
    },
  };
}

export default function BlogSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
