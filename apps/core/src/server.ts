import { createApp } from "./index";

const port = Number(process.env.PORT || 3001);

createApp().listen(port, () => {
  console.log(`core running on ${port}`);
});
