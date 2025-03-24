import 'reflect-metadata';
import app from "./app";
import "src/database/connection";
import { separator } from '@global/logs';

const port = process.env.PORT;

app.listen(port, () => {
    console.clear(); // Clear the console
    console.log(separator);
    console.log(`🌐 Server is running at http://localhost:${port}`);
    console.log(separator);
});
