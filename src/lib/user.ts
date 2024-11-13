import { type User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";
interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export async function createUser({ name, email, password }: CreateUserInput) {
  return await prisma.user.create({
    data: {
      name,
      email,
      password: await hash(password, 10),
    },
  });
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findFirst({
    where: {
      email,
    },
    include: {
      userGroup: true,
    },
  });
}

export async function getUser(id: string) {
  return await prisma.user.findFirst({
    where: {
      id,
    },
  });
}

export async function updateUser(id: string, data: any) {
  return await prisma.user.update({
    where: {
      id,
    },
    data,
  });
}

export async function createGroup(user: User) {
  return await prisma.group.create({
    data: {
      members: {
        create: {
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      },
    },
  });
}

export async function getGroup(user: User) {
  const userWithGroup = await prisma.user.findFirst({
    where: {
      id: user.id,
    },
    include: {
      userGroup: true,
    },
  });

  return userWithGroup?.userGroup;
}

export async function createUserWithGroup(input: CreateUserInput) {
  return await prisma.$transaction(async () => {
    const user = await createUser(input);
    const group = await createGroup(user);
    return { user, group };
  });
}
