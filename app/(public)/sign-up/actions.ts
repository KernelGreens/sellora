"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { signUpSchema } from "@/lib/validations/auth"

export async function signUpAction(formData: FormData): Promise<void> {
  const rawData = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  }

  const parsed = signUpSchema.safeParse(rawData)

  if (!parsed.success) {
    redirect("/sign-up?error=Please%20check%20your%20details")
  }

  const { fullName, email, phone, password } = parsed.data
  const normalizedEmail = email.toLowerCase().trim()

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  })

  if (existingUser) {
    redirect("/sign-up?error=An%20account%20with%20this%20email%20already%20exists")
  }

  const passwordHash = await hashPassword(password)

  await prisma.user.create({
    data: {
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || null,
      passwordHash,
    },
  })

  redirect("/sign-in?success=Account%20created%20successfully.%20Please%20sign%20in")
}