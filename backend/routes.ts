import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerUploadRoutes } from "./routes/upload";
import { randomBytes } from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register upload routes
  registerUploadRoutes(app);

  // --- User Profile Routes (Bridging Supabase Auth via Email) ---

  // Get User Profile (creates if not exists for the email)
  app.get("/api/user/:email", async (req: Request, res: Response) => {
    const email = req.params.email;
    if (!email) return res.status(400).json({ message: "Email required" });

    // Use email as username for this simple bridge
    let user = await storage.getUserByUsername(email);

    if (!user) {
      // Create 'shadow' user in backend
      user = await storage.createUser({
        username: email,
        password: "managed-by-supabase", // Dummy
      });
      // Update email field just in case
      await storage.updateUser(user.id, { email: email });
    }

    res.json(user);
  });

  // Update Profile (Avatar, etc)
  app.post("/api/user/:email", async (req: Request, res: Response) => {
    const email = req.params.email;
    const updates = req.body;

    let user = await storage.getUserByUsername(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Limit allowed updates
    const allowedUpdates: any = {};
    if (updates.avatarUrl !== undefined) allowedUpdates.avatarUrl = updates.avatarUrl;
    if (updates.isTwoFactorEnabled !== undefined) allowedUpdates.isTwoFactorEnabled = updates.isTwoFactorEnabled;

    const updatedUser = await storage.updateUser(user.id, allowedUpdates);
    res.json(updatedUser);
  });

  // --- 2FA Routes ---

  app.post("/api/auth/2fa/send", async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await storage.getUserByUsername(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 mins

    // Save to user
    await storage.updateUser(user.id, {
      otpSecret: otp,
      otpExpiry: expiry.toString()
    });

    // MOCK EMAIL SENDING
    console.log(`[2FA] OTP for ${email}: ${otp}`);

    res.json({ message: "OTP sent" });
  });

  app.post("/api/auth/2fa/verify", async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const user = await storage.getUserByUsername(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otpSecret || !user.otpExpiry) {
      return res.status(400).json({ message: "No OTP pending" });
    }

    if (Date.now() > parseInt(user.otpExpiry)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.otpSecret !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Clear OTP
    await storage.updateUser(user.id, {
      otpSecret: null,
      otpExpiry: null
    });

    res.json({ message: "Verified" });
  });

  return httpServer;
}
