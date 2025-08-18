Hubflix is an API application implemented using Express.js, Node.js, and TypeScript. It provides endpoints for managing movies and directors, featuring validation, error handling, caching, and security measures such as JWT authentication and XSS prevention.

Features

-Endpoints for movies and directors

-Two entry points: Express.js and Core Node.js modules

-Validation, success, and error handling implemented globally

-Path analysis using the Strategy Design Pattern

-MCP model prototype integration using Ollama

-Unit tests and integration tests using Jest

-Redis caching for movie searches by ID

J-WT authentication and XSS protection

-Dockerized for easy deployment

-Sample data generated using Gemini

-GitHub process management (branch merging, issue assigning, and closing)

-CI/CD integration with GitLab

-Ongoing UI development for getting and posting movies with linked directors

Getting Started
Using Express.js

Run the following command to start the Express.js version of the API:

npx ts-node src/server.ts

Using Core Node.js Modules

Run the following command to start the Core Node.js version:

npx ts-node src/coreNode/server.ts


After starting the server, you can access the endpoints described in the Postman collections located under the /documents folder.

Using Docker

To run the application in Docker containers:

docker-compose up --build

MCP Client

To use the MCP client (http://localhost:4000/coreApi/ai-query), ensure the server is running and execute the corresponding commands to start the client.

Testing

Unit tests for validation, success, and error handling

Redis and XSS validation tests for the coreMovieController

Integration tests to verify full application workflows

Data Sources

IMDB non-commercial datasets:

title.basics for movie information

title.crew for lookup

name.basics for director information

Sample data generated using Gemini

Security

XSS protection

JWT bearer token authentication

NoSQL injection prevention
