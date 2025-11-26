import { app, server } from "../index.ts";


const eapp= app 
const httpserver=server

eapp.listen(8000, () => {
  console.log(" Listening on port 8000");
});

httpserver.listen(8001, () => {
  console.log("Server running on port 8001");
});
