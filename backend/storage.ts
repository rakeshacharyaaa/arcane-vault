import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
}

import { supabase } from "./lib/supabase";
import { type Page, type InsertPage } from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Page Methods
  createPage(userId: string, page: InsertPage): Promise<Page>;
  getPage(id: string): Promise<Page | undefined>;
  getPages(userId: string): Promise<Page[]>;
  updatePage(id: string, updates: Partial<Page>): Promise<Page | undefined>;
  deletePage(id: string): Promise<void>;
}

function mapToUser(data: any): User {
  if (!data) return data;
  return {
    id: data.id,
    username: data.username,
    password: data.password,
    name: data.name,
    email: data.email,
    joinDate: data.join_date || data.created_at, // Handle both for safety
    isPremium: data.is_premium,
    avatarUrl: data.avatar_url,
    otpSecret: data.otp_secret,
    otpExpiry: data.otp_expiry,
    isTwoFactorEnabled: data.is_two_factor_enabled,
  };
}

function mapToPage(data: any): Page {
  if (!data) return data;
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    content: typeof data.content === 'string' ? JSON.parse(data.content || '{}') : data.content,
    icon: data.icon,
    coverImage: data.cover_image,
    isExpanded: data.is_expanded,
    parentId: data.parent_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    tags: data.tags || [],
  };
}

export class SupabaseStorage implements IStorage {

  // USER METHODS
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return mapToUser(data);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      const { data: emailData } = await supabase.from('users').select('*').eq('email', username).single();
      if (emailData) return mapToUser(emailData);
      return undefined;
    }
    return mapToUser(data);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const existing = await this.getUserByUsername(insertUser.username);
    if (existing) return existing;

    const { data, error } = await supabase
      .from('users')
      .insert({
        username: insertUser.username,
        name: insertUser.username,
        email: insertUser.username,
        created_at: new Date().toISOString(),
        is_premium: false,
        is_two_factor_enabled: false
      })
      .select()
      .single();

    if (error) throw new Error("Failed to create user: " + error.message);
    return mapToUser(data);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.isPremium !== undefined) dbUpdates.is_premium = updates.isPremium;
    if (updates.isTwoFactorEnabled !== undefined) dbUpdates.is_two_factor_enabled = updates.isTwoFactorEnabled;
    if (updates.otpSecret !== undefined) dbUpdates.otp_secret = updates.otpSecret;
    if (updates.otpExpiry !== undefined) dbUpdates.otp_expiry = updates.otpExpiry;
    if (updates.email !== undefined) dbUpdates.email = updates.email;

    const { data, error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error("Update failed: " + error.message);
    return mapToUser(data);
  }

  // PAGE METHODS
  async createPage(userId: string, page: InsertPage): Promise<Page> {
    console.log("DEBUG: createPage userId:", userId);
    const { data, error } = await supabase
      .from('pages')
      .insert({
        user_id: userId,
        title: page.title,
        content: page.content ? JSON.stringify(page.content) : '{}',
        parent_id: page.parentId,
        is_expanded: false,
        tags: [] // Initialize tags as empty array
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapToPage(data);
  }

  async getPage(id: string): Promise<Page | undefined> {
    const { data, error } = await supabase.from('pages').select('*').eq('id', id).single();
    if (error) return undefined;
    return mapToPage(data);
  }

  async getPages(userId: string): Promise<Page[]> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) return [];
    return data.map(mapToPage);
  }

  async updatePage(id: string, updates: Partial<Page>): Promise<Page | undefined> {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = typeof updates.content === 'object' ? JSON.stringify(updates.content) : updates.content;
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
    if (updates.coverImage !== undefined) dbUpdates.cover_image = updates.coverImage;
    if (updates.isExpanded !== undefined) dbUpdates.is_expanded = updates.isExpanded;
    if (updates.parentId !== undefined) dbUpdates.parent_id = updates.parentId;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    dbUpdates.updated_at = new Date().toISOString();

    console.log("DEBUG updatePage:", id, "updates:", JSON.stringify(dbUpdates).substring(0, 200));

    const { data, error } = await supabase
      .from('pages')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("updatePage error:", error);
      return undefined;
    }
    return mapToPage(data);
  }

  async deletePage(id: string): Promise<void> {
    await supabase.from('pages').delete().eq('id', id);
  }
}

export const storage = new SupabaseStorage();
