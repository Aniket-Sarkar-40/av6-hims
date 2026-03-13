import { createCoreApp } from "@apps/core";
import express from "express";

const app = express();

const enabled = new Set(
  (process.env.ENABLED_APPS ?? "core,opd,pharmacy").split(",")
);

if (enabled.has("core")) app.use("/api/v1/core", createCoreApp());

const port = Number(process.env.PORT || 3005);

app.listen(port, () => {
  console.log(`gateway running on ${port}`);
});
