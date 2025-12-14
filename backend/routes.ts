import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerUploadRoutes } from "./routes/upload";
import { randomBytes } from "crypto";
import { sendOTPEmail } from "./lib/email";

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
    if (updates.name !== undefined) allowedUpdates.name = updates.name;
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

    // Send real email
    const sent = await sendOTPEmail(email, otp);
    if (!sent) {
      console.log(`[2FA] Fallback - OTP for ${email}: ${otp}`);
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    res.json({ message: "OTP sent to your email" });
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

  // --- Page Routes ---

  // Get all pages for a user
  app.get("/api/user/:email/pages", async (req: Request, res: Response) => {
    const email = req.params.email;
    const user = await storage.getUserByUsername(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const pages = await storage.getPages(user.id);
    res.json(pages);
  });

  // Create a page
  app.post("/api/user/:email/pages", async (req: Request, res: Response) => {
    const email = req.params.email;
    const pageData = req.body;
    let user = await storage.getUserByUsername(email);

    if (!user) {
      try {
        user = await storage.createUser({
          username: email,
          password: "managed-by-supabase",
        });
      } catch (e: any) {
        console.error("Failed to auto-create user during page creation:", e);
        return res.status(500).json({ message: "Failed to create user" });
      }
    }

    try {
      const page = await storage.createPage(user.id, pageData);
      res.json(page);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Get single page
  app.get("/api/pages/:id", async (req: Request, res: Response) => {
    const page = await storage.getPage(req.params.id);
    if (!page) return res.status(404).json({ message: "Page not found" });
    res.json(page);
  });

  // Update page
  app.patch("/api/pages/:id", async (req: Request, res: Response) => {
    try {
      const updated = await storage.updatePage(req.params.id, req.body);
      if (!updated) return res.status(404).json({ message: "Page not found" });
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Delete page
  app.delete("/api/pages/:id", async (req: Request, res: Response) => {
    await storage.deletePage(req.params.id);
    res.status(204).send();
  });

  return httpServer;
}
