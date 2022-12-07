# About

This NestJS API server is a minimalist version with only core functionalities and MongoDB functionality.

1. ENV usage
2. Swagger Open API Framework
3. Task Scheduler
4. Log4JS logs
5. Key Management System
6. MongoDB

Please refer to the [minimalist](guides/minimalist.md) guide on how to utilize this server.

Please refer to the [mongodb](guides/mongodb.md) guide on how to utilize mongodb with this server.

# Initialize

1. Make a copy of the folder, `minimalist-database`
2. Open a terminal in the folder and run `npm install`
3. Rename the file `.env.sample` to `.env`
4. Change the values for the environment variables accordingly in the `.env` file
5. In the same terminal, run `npm run start:dev`
6. Open a browser window and go to `http://localhost:3002/api/#/` (3002 is the port number, change it to the port number in the `.env` file)

![Minimalist w/ Database](https://github.com/jedtravis/bare-bone-server/blob/master/images/minimalist-database.png)

7. Create a **POST** request at `/api/v1/crypto/decrypt/{password}` to decrypt the Crypto Key
8. Create a **GET** request at `/api/v1` to get the Server Health

![Server Ready](https://github.com/jedtravis/bare-bone-server/blob/master/images/minimalist-database-server-ready.png)

9. Create a **POST** request at `/api/v1/users/` to create a new user

![MongoDB](https://github.com/jedtravis/bare-bone-server/blob/master/images/minimalist-database-mongodb.png)
![MongoDB Users Collection](https://github.com/jedtravis/bare-bone-server/blob/master/images/minimalist-database-mongodb-users.png)
