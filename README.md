<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Introduction

This project is a movie API service built with Nest.js and MongoDB. It allows users to perform various actions such as rating movies, adding them to a watchlist, and marking them as favorites. The project utilizes Redis for caching and implements JWT-based authentication and authorization.

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Feature

- User Authentication: JWT-based authentication.
- User Authorization: Role-based access control using guards.
- Movie Management: CRUD operations for movies.
- User Management: CRUD operations for users.
- Movie Ratings: Rate movies and retrieve average ratings.
- Watchlist and Favorites: Add movies to a watchlist and mark them as favorites.
- Caching: Redis caching to improve performance.
- Scheduled Tasks: Perform scheduled tasks using NestJS Schedule Module.
- Logging: Custom middleware for logging requests.

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`MONGO_URI`: mongodb://localhost:27017

`JWT_SECRET`: secret

`TMDB_API_KEY`: f6fb5899bd0ef8f974fcedbdfb319014

`PORT`: f6fb5899bd0ef8f974fcedbdfb319014

`REDIS_HOST`: f6fb5899bd0ef8f974fcedbdfb319014

`REDIS_PORT`: f6fb5899bd0ef8f974fcedbdfb319014

## Normal Installation and Running the app

- You have to have preinstalled node.js v20, redis and mongoDB then make as follow

```bash
$ npm install

$ npm run start:dev
```

## Running with Docker compose

```bash
$ docker-compose up
```

## Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## API Documentation

[Documentation](http://localhost:8080/api)
