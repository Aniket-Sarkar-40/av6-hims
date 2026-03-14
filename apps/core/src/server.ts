import { createCoreApp } from "./index.js";

const port = Number(process.env.DATABASE_PORT || 3001);

createCoreApp().listen(port, () => {
  console.log(`core running on ${port}`);
});
