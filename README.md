🧰 Tech Stack

Node.js,
TypeScript,
Express,
Mongo-DB,
WebSockets ( / ws),
Background Workers(Bullmq), 



Built a full monolithic backend architecture with clear separation of controllers, services, middlewares, jobs, and WebSocket handlers.

Implemented JWT authentication with secure password hashing and role-based access control (Customer, Restaurant Owner, Admin).

Designed and developed restaurant & menu management with CRUD operations, owner-specific privileges, and public browsing endpoints.

Implemented a complete order lifecycle engine, including item mapping, pricing, and status transitions (Received → Preparing → Ready → Delivered).

Added real-time WebSocket updates for:

      a. order creation to the vendor so he can accept it 
  
      b. for updates if he accept it or reject it 
  
     c. chating can be done by the vendor and user if order is accepted // in progress 
  
     d.chat will be stored in redis so it will get deleted after order is conpleted
      or any of them cancel the order  // in progress

Instant order status updates for customers

Integrated background jobs for:

Sending otp email and cancel order after 1 min if order is not picked by the vendor 

Created a scalable architecture designed to evolve into microservices if needed.

