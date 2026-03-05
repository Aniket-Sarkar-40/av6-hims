import express from "express";
import { createApp as createCoreApp } from "@apps/core";

const app = express();

app.use("/core", createCoreApp());

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`gateway running on ${port}`);
});
