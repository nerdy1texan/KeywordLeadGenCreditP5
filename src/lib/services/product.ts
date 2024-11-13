// src/lib/services/product.ts

import { prisma } from "@/lib/db";
import { type Product, type ProductFormData } from "@/types/product";
import { OpenAI } from "openai";
import { getGroup, createGroup } from "@/lib/user";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function createProduct(
  userId: string,
  data: ProductFormData
): Promise<Product> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userGroup: true }
    });

    if (!user) throw new Error("User not found");

    if (!user.userGroup) {
      await createGroup(user);
    }

    // Create the base product
    const product = await prisma.product.create({
      data: {
        name: data.name,
        url: data.url || null,
        description: data.description,
        keywords: data.keywords || [],
        userId,
      },
    });

    // Create plans if they exist
    if (data.plans && data.plans.length > 0) {
      await prisma.plan.createMany({
        data: data.plans.map(plan => ({
          name: plan.name,
          price: plan.price,
          features: plan.features,
          productId: product.id
        }))
      });
    }

    // Return complete product with relations
    return await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        plans: true,
        monitoredSubreddits: true,
        redditPosts: true,
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

export async function getProductsByUser(userId: string): Promise<Product[]> {
  return await prisma.product.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function extractProductInfo(url: string): Promise<ProductFormData> {
  try {
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website content: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Truncate HTML to fit within token limits (roughly 4000 tokens)
    const truncatedHtml = html.slice(0, 16000); 

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Extract product information from the website content. Return in format:
          {
            "name": "product name",
            "description": "clear, concise description (max 500 chars)",
            "keywords": ["keyword1", "keyword2", ...], // Extract 5-10 relevant keywords
            "plans": [
              {
                "name": "plan name",
                "price": number,
                "features": ["feature1", "feature2", ...]
              }
            ]
          }`
        },
        {
          role: "user",
          content: truncatedHtml
        }
      ]
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    
    return {
      name: result.name || '',
      url,
      description: result.description || '',
      keywords: result.keywords || [],
      plans: result.plans || [],
    };
  } catch (error: any) {
    console.error("Error in extractProductInfo:", error);
    throw new Error(error.message || "Failed to extract product information");
  }
}

export async function getLatestProductByUser(userId: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findFirst({
      where: {
        userId,
      },
      include: {
        plans: true,
        monitoredSubreddits: true,
        redditPosts: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return product; // This can be null if no product exists
  } catch (error) {
    console.error("Error fetching latest product:", error);
    return null; // Return null instead of throwing error
  }
}
