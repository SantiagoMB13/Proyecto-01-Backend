import createApp from "./app";
import handleMongoConnection from "./db";

const app = createApp();
const PORT = process.env.PORT || 8080;

handleMongoConnection();

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});