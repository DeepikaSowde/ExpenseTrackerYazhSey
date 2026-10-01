require("dotenv").config();
const app = require("./app");
const { initSchema } = require("./config/initDb");

const PORT = process.env.PORT || 5000;

initSchema()
  .then(() => {
    app.listen(PORT, () => console.log(`YazhSey Books API listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to initialize database schema", err);
    process.exit(1);
  });
