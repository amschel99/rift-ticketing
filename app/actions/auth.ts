"use server";

import { prisma } from "@/lib/prisma";
import rift from "@/lib/rift";

export async function signupAction(externalId: string, password: string, email?: string, displayName?: string) {
  try {
    // Check if user already exists in our DB
    const existingUser = await prisma.user.findUnique({
      where: { externalId },
    });

    if (existingUser) {
      return { error: "User already exists" };
    }

    // Create user in Rift
    const riftSignupResponse = await rift.auth.signup({
      externalId,
      password,
      email: email || `${externalId}@example.com`,
      displayName: displayName || externalId,
    });

    // After signup, automatically login to get the JWT token
    const riftLoginResponse = await rift.auth.login({
      externalId,
      password,
    });
    const accessToken = riftLoginResponse.accessToken;
    const walletAddress = riftLoginResponse.address; // Get wallet address from login

    // Store user in our database with the JWT token and wallet address
    const user = await prisma.user.create({
      data: {
        externalId,
        email: email || `${externalId}@example.com`,
        name: displayName || externalId,
        riftUserId: riftSignupResponse.userId,
        bearerToken: accessToken, // Save JWT token from Rift
        walletAddress: walletAddress, // Save wallet address
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
    console.error("Signup error:", error);
    return { error: error.message || "Signup failed" };
  }
}

export async function loginAction(externalId: string, password: string) {
  try {
    // Login with Rift SDK
    const riftLoginResponse = await rift.auth.login({
      externalId,
      password,
    });

    // Rift SDK automatically sets the bearer token internally
    // But we need to store it for our API routes
    const accessToken = riftLoginResponse.accessToken;

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
      // User exists in Rift but not in our DB - create it
      // Get user info from Rift
      rift.setBearerToken(accessToken);
      const riftUserResponse = await rift.auth.getUser();
      const riftUser = riftUserResponse.user;
      const walletAddress = riftLoginResponse.address; // Get wallet address from login

      user = await prisma.user.create({
        data: {
          externalId: riftUser.externalId || externalId,
          email: riftUser.email || undefined,
          name: riftUser.displayName || undefined,
          riftUserId: riftUser.id,
          role: "USER",
          bearerToken: accessToken,
          walletAddress: walletAddress, // Save wallet address
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
      // Update bearer token and wallet address in our DB
      const walletAddress = riftLoginResponse.address; // Get wallet address from login
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          bearerToken: accessToken,
          walletAddress: walletAddress, // Update wallet address
        },
      });
      
      // Fetch updated user with select to match type
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
    console.error("Login error:", error);
    return { error: error.message || "Invalid credentials" };
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
