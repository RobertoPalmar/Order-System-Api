import app from "./app";
import "@db/connection";

const port = process.env.PORT;

const separator = '='.repeat(50);
app.listen(port, () => {
    console.clear(); // Clear the console
    console.log(separator);
    console.log(`🌐 Server is running at http://localhost:${port}`);
    console.log(separator);
});
