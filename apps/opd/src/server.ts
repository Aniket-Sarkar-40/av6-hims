import { createApp } from "./index.js";

const port = Number(process.env.PORT || 3001);

createApp().listen(port, () => {
  console.log(`core running on ${port}`);
});
