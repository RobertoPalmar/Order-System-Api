import app from "./app";
import "@db/connection";

const port = process.env.PORT;

app.listen(port, () => console.log(`🌐`,`Server is running at http://localhost:${port}`));
