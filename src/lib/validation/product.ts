// src/lib/validation/product.ts

import { z } from "zod";

const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  price: z.number().min(0, "Price must be a positive number"),
  features: z.array(z.string()).min(1, "At least one feature is required"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  url: z.string().url().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  keywords: z.array(z.string()).min(1, "At least one keyword is required"),
  plans: z.array(planSchema).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
