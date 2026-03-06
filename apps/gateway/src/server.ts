import express from "express";
import { createApp as createCoreApp } from "@apps/core";

const app = express();

const enabled = new Set(
  (process.env.ENABLED_APPS ?? "core,opd,pharmacy").split(",")
);

if (enabled.has("core")) app.use("/core", createCoreApp());

const port = Number(process.env.PORT || 3005);

app.listen(port, () => {
  console.log(`gateway running on ${port}`);
});
