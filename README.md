# Uber Clone

## Demo

https://user-images.githubusercontent.com/40957575/174254229-a7793397-76d1-442b-8a89-a3007a30db2d.mp4

## Overview

This project is a full-stack ride-hailing application designed to simulate a real-world scenario where users can hail rides and track their routes in real-time. It encompasses a wide range of technologies and methodologies, focusing on real-time communication, authentication, and front-end interactivity. The application is built using Django, Django REST Framework, and Django Channels on the back end, with ReactJS for the front end. It features a RESTful API, token-based authentication with JWTs, real-time data updates via WebSockets, and integration with the Google Maps API.

## Features

- **RESTful API Development:** Utilized Django REST Framework to create scalable and secure API endpoints.
- **Real-Time Communication:** Implemented Django Channels and WebSockets to push updates to the client in real-time, enhancing the user experience with live data.
- **Authentication:** Integrated token-based authentication using JSON Web Tokens (JWT) to secure the application.
- **Front-End Development:** Built a dynamic single-page application (SPA) with ReactJS, utilizing functional components and React Hooks.
- **Google Maps Integration:** Incorporated the Google Maps API to display ride routes, enabling users to track their hailing rides visually.
- **Test-Driven Development:** Ensured code reliability and functionality with test-driven development using pytest for the backend and Cypress for front-end testing.
- **Dockerization:** Containerized the entire application using Docker to streamline deployment and ensure environment consistency.
- **UI/UX Design:** Enhanced the user interface with Bootstrap for a polished look and feel, and added toast notifications for an interactive user experience.

## Technologies

- Backend: Django, Django REST Framework, Django Channels, Redis
- Frontend: ReactJS, Bootstrap, Google Maps API, formiks, RxJS
- Testing: pytest, Cypress
- Authentication: JWT
- Real-Time Communication: WebSockets
- Deployment: Docker

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js and npm

### Installation

1. Clone the repository: `git clone https://github.com/yourusername/ride-hailing-app.git`
2. Navigate to the project directory and run Docker Compose to build the services:

```sh
cd ride-hailing-app
docker-compose up --build
```

### Usage

After successfully running the Docker containers, the application will be accessible at `http://localhost:3000` for the React frontend and `http://localhost:8000` for the Django backend API.

### Testing

To run the backend tests, execute the following command:

```sh
docker-compose run web pytest
For front-end tests with Cypress:
```

For front-end tests with Cypress:

```sh
cd frontend
npm run test
```
