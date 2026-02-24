"use server";

import { prisma } from "@/lib/prisma";
import rift from "@/lib/rift";

export async function signupAction(externalId: string, password: string) {
  try {
    // Check if user already exists in our DB
    const existingUser = await prisma.user.findUnique({
      where: { externalId },
    });

    if (existingUser) {
      return { error: "User already exists" };
    }

    // Create user in Rift — only externalId and password
    const riftSignupResponse = await rift.auth.signup({
      externalId,
      password,
    } as any);

    // After signup, login to get JWT token
    const riftLoginResponse = await rift.auth.login({
      externalId,
      password,
    });
    const accessToken = riftLoginResponse.accessToken;
    const walletAddress = riftLoginResponse.address;

    // Store user in our database
    const user = await prisma.user.create({
      data: {
        externalId,
        email: externalId,
        name: externalId,
        riftUserId: riftSignupResponse.userId,
        bearerToken: accessToken,
        walletAddress: walletAddress,
        role: "USER",
      },
      select: {
        id: true,
        externalId: true,
        email: true,
        name: true,
        role: true,
        bearerToken: true,
        riftUserId: true,
        walletAddress: true,
      },
    });

    return { success: true, user, bearerToken: accessToken };
  } catch (error: any) {
    console.error("Signup error:", {
      message: error.message,
      status: error.status,
      error: error.error,
      stack: error.stack,
    });

    // Categorize errors for better UI messages
    const msg = (error.message || "").toLowerCase();
    if (msg.includes("authentication failed") || msg.includes("login processing")) {
      return { error: "Unable to connect to authentication service. Please try again later." };
    }
    if (msg.includes("already exists") || msg.includes("duplicate")) {
      return { error: "An account with this email already exists. Try logging in instead." };
    }
    if (msg.includes("network") || msg.includes("fetch") || msg.includes("econnrefused")) {
      return { error: "Network error. Please check your connection and try again." };
    }
    return { error: error.message || "Signup failed. Please try again." };
  }
}

export async function loginAction(externalId: string, password: string) {
  try {
    // Login with Rift SDK — only externalId and password
    const riftLoginResponse = await rift.auth.login({
      externalId,
      password,
    });

    const accessToken = riftLoginResponse.accessToken;
    const walletAddress = riftLoginResponse.address;

    // Find or create user in our database
    let user = await prisma.user.findUnique({
      where: { externalId },
      select: {
        id: true,
        externalId: true,
        email: true,
        name: true,
        role: true,
        bearerToken: true,
        riftUserId: true,
        walletAddress: true,
      },
    });

    if (!user) {
      // User exists in Rift but not in our DB — create it
      user = await prisma.user.create({
        data: {
          externalId,
          email: externalId,
          name: externalId,
          role: "USER",
          bearerToken: accessToken,
          walletAddress: walletAddress,
        },
        select: {
          id: true,
          externalId: true,
          email: true,
          name: true,
          role: true,
          bearerToken: true,
          riftUserId: true,
          walletAddress: true,
        },
      });
    } else {
      // Update bearer token and wallet address
      await prisma.user.update({
        where: { id: user.id },
        data: {
          bearerToken: accessToken,
          walletAddress: walletAddress,
        },
      });

      user = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          externalId: true,
          email: true,
          name: true,
          role: true,
          bearerToken: true,
          riftUserId: true,
          walletAddress: true,
        },
      }) || user;
    }

    return {
      success: true,
      user: {
        id: user.id,
        externalId: user.externalId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      bearerToken: accessToken,
    };
  } catch (error: any) {
    console.error("Login error:", {
      message: error.message,
      status: error.status,
      error: error.error,
      stack: error.stack,
    });

    // Categorize errors for better UI messages
    const msg = (error.message || "").toLowerCase();
    if (msg.includes("authentication failed") || msg.includes("login processing")) {
      return { error: "Authentication service error. Please try again later or contact support." };
    }
    if (msg.includes("invalid") || msg.includes("incorrect") || msg.includes("wrong")) {
      return { error: "Invalid email or password. Please check your credentials." };
    }
    if (msg.includes("not found") || msg.includes("no user")) {
      return { error: "No account found with this email. Please sign up first." };
    }
    if (msg.includes("network") || msg.includes("fetch") || msg.includes("econnrefused")) {
      return { error: "Network error. Please check your connection and try again." };
    }
    return { error: error.message || "Login failed. Please try again." };
  }
}

export async function getUserByToken(bearerToken: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { bearerToken },
      select: {
        id: true,
        externalId: true,
        email: true,
        name: true,
        role: true,
        bearerToken: true,
        riftUserId: true,
        walletAddress: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Get user by token error:", error);
    return null;
  }
}
