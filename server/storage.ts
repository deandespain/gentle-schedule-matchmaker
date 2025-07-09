import { 
  users, caregivers, clients, scheduleOptions,
  type User, type InsertUser,
  type Caregiver, type InsertCaregiver,
  type Client, type InsertClient,
  type ScheduleOption, type InsertScheduleOption
} from "@shared/schema";
// import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Caregivers
  getCaregivers(): Promise<Caregiver[]>;
  getCaregiver(id: number): Promise<Caregiver | undefined>;
  createCaregiver(caregiver: InsertCaregiver): Promise<Caregiver>;
  updateCaregiver(id: number, caregiver: Partial<InsertCaregiver>): Promise<Caregiver | undefined>;
  deleteCaregiver(id: number): Promise<boolean>;
  
  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  
  // Schedule Options
  getScheduleOptions(): Promise<ScheduleOption[]>;
  getScheduleOption(id: number): Promise<ScheduleOption | undefined>;
  createScheduleOption(scheduleOption: InsertScheduleOption): Promise<ScheduleOption>;
  clearScheduleOptions(): Promise<void>;
}

// DatabaseStorage commented out for now - will be enabled when database is provisioned
// export class DatabaseStorage implements IStorage {
//   async getUser(id: number): Promise<User | undefined> {
//     const [user] = await db.select().from(users).where(eq(users.id, id));
//     return user || undefined;
//   }
//   ... rest of implementation
// }

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private caregivers: Map<number, Caregiver>;
  private clients: Map<number, Client>;
  private scheduleOptions: Map<number, ScheduleOption>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.caregivers = new Map();
    this.clients = new Map();
    this.scheduleOptions = new Map();
    this.currentId = 1;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      id, 
      username: insertUser.username, 
      password: insertUser.password 
    };
    this.users.set(id, user);
    return user;
  }

  // Caregivers
  async getCaregivers(): Promise<Caregiver[]> {
    return Array.from(this.caregivers.values());
  }

  async getCaregiver(id: number): Promise<Caregiver | undefined> {
    return this.caregivers.get(id);
  }

  async createCaregiver(insertCaregiver: InsertCaregiver): Promise<Caregiver> {
    const id = this.currentId++;
    const caregiver: Caregiver = { 
      id,
      name: insertCaregiver.name,
      address: insertCaregiver.address,
      phone: insertCaregiver.phone,
      weeklySchedule: insertCaregiver.weeklySchedule,
      exclusions: insertCaregiver.exclusions || [],
      createdAt: new Date() 
    };
    this.caregivers.set(id, caregiver);
    return caregiver;
  }

  async updateCaregiver(id: number, insertCaregiver: Partial<InsertCaregiver>): Promise<Caregiver | undefined> {
    const existing = this.caregivers.get(id);
    if (!existing) return undefined;
    
    const updated: Caregiver = { ...existing, ...insertCaregiver };
    this.caregivers.set(id, updated);
    return updated;
  }

  async deleteCaregiver(id: number): Promise<boolean> {
    return this.caregivers.delete(id);
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentId++;
    const client: Client = { 
      id,
      name: insertClient.name,
      address: insertClient.address,
      phone: insertClient.phone,
      weeklySchedule: insertClient.weeklySchedule,
      exclusions: insertClient.exclusions || [],
      createdAt: new Date() 
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, insertClient: Partial<InsertClient>): Promise<Client | undefined> {
    const existing = this.clients.get(id);
    if (!existing) return undefined;
    
    const updated: Client = { ...existing, ...insertClient };
    this.clients.set(id, updated);
    return updated;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Schedule Options
  async getScheduleOptions(): Promise<ScheduleOption[]> {
    return Array.from(this.scheduleOptions.values());
  }

  async getScheduleOption(id: number): Promise<ScheduleOption | undefined> {
    return this.scheduleOptions.get(id);
  }

  async createScheduleOption(insertScheduleOption: InsertScheduleOption): Promise<ScheduleOption> {
    const id = this.currentId++;
    const scheduleOption: ScheduleOption = { 
      id,
      option: insertScheduleOption.option,
      matches: insertScheduleOption.matches,
      totalScore: insertScheduleOption.totalScore,
      efficiency: insertScheduleOption.efficiency,
      createdAt: new Date() 
    };
    this.scheduleOptions.set(id, scheduleOption);
    return scheduleOption;
  }

  async clearScheduleOptions(): Promise<void> {
    this.scheduleOptions.clear();
  }
}

// Use memory storage for now - can be switched to DatabaseStorage when database is provisioned
export const storage = new MemStorage();
