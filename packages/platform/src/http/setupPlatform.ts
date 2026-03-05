import express, { type Express } from "express";

export function setupPlatform(app: Express) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
}
