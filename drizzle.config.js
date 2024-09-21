/** @type { import("drizzle-kit").Config } */
export default {
  schema: "./utils/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://ai-interview-mocker_owner:y76ZICdDWbSs@ep-black-voice-a51vmk32.us-east-2.aws.neon.tech/ai-interview-mocker?sslmode=require",
  },
};
