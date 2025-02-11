import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./configs/schema.js",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_5B3OHJQpCiWh@ep-silent-recipe-a5zikvn0-pooler.us-east-2.aws.neon.tech/neondb?",
  }
});
