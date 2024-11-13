import { prisma } from "@/lib/db";

export async function getSubscriberByEmail(email: string) {
  return await prisma.newsletterSubscriber.findFirst({
    where: {
      email,
    },
  });
}

export async function updateSubscriber({
  email,
  active,
}: {
  email: string;
  active: boolean;
}) {
  await prisma.newsletterSubscriber.upsert({
    where: {
      email: email,
    },
    create: {
      email: email,
      active: active,
    },
    update: {
      active: active,
    },
  });
}
