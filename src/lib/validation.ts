import { z } from "zod";

export const checkoutSchema = z.object({
  stripePriceId: z.string().optional(),
  quantity: z.number().min(1).max(1).optional(),
  ref: z.string(),
});

export const emailSchema = z.object({
  email: z.string().email(),
});

export const passwordSchema = z.object({
  password: z.string().min(6).max(12),
});

export const userSchema = z.object({
  name: z.string().min(2).max(30),
});

export const confirmPasswordSchema = passwordSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const signInSchema = emailSchema.merge(passwordSchema);

export const signUpSchema = signInSchema.merge(userSchema);

export const resetPasswordSchema = passwordSchema.extend({
  token: z.string(),
});

export const newsletterSchema = emailSchema.extend({
  active: z.boolean(),
});

export const activationSchema = emailSchema.extend({
  code: z.string().min(2).max(30),
});

export type ISignIn = z.infer<typeof signInSchema>;
export type ISignUp = z.infer<typeof signUpSchema>;
export type IUserSchema = z.infer<typeof userSchema>;
export type IEmail = z.infer<typeof emailSchema>;
export type IPassword = z.infer<typeof passwordSchema>;
export type IResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
