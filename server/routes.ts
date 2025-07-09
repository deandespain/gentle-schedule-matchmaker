import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCaregiverSchema, insertClientSchema, insertScheduleOptionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Caregivers routes
  app.get("/api/caregivers", async (req, res) => {
    try {
      const caregivers = await storage.getCaregivers();
      res.json(caregivers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch caregivers" });
    }
  });

  app.get("/api/caregivers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const caregiver = await storage.getCaregiver(id);
      if (!caregiver) {
        return res.status(404).json({ error: "Caregiver not found" });
      }
      res.json(caregiver);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch caregiver" });
    }
  });

  app.post("/api/caregivers", async (req, res) => {
    try {
      const validatedData = insertCaregiverSchema.parse(req.body);
      const caregiver = await storage.createCaregiver(validatedData);
      res.status(201).json(caregiver);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create caregiver" });
    }
  });

  app.put("/api/caregivers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCaregiverSchema.partial().parse(req.body);
      const caregiver = await storage.updateCaregiver(id, validatedData);
      if (!caregiver) {
        return res.status(404).json({ error: "Caregiver not found" });
      }
      res.json(caregiver);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update caregiver" });
    }
  });

  app.delete("/api/caregivers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCaregiver(id);
      if (!success) {
        return res.status(404).json({ error: "Caregiver not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete caregiver" });
    }
  });

  // Clients routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, validatedData);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteClient(id);
      if (!success) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete client" });
    }
  });

  // Schedule Options routes
  app.get("/api/schedule-options", async (req, res) => {
    try {
      const scheduleOptions = await storage.getScheduleOptions();
      res.json(scheduleOptions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schedule options" });
    }
  });

  app.post("/api/schedule-options", async (req, res) => {
    try {
      const validatedData = insertScheduleOptionSchema.parse(req.body);
      const scheduleOption = await storage.createScheduleOption(validatedData);
      res.status(201).json(scheduleOption);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create schedule option" });
    }
  });

  app.delete("/api/schedule-options", async (req, res) => {
    try {
      await storage.clearScheduleOptions();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to clear schedule options" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
