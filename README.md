# Brand Guessing Multiplayer Game

This project was developed as a solution for the COS 216 Homework Assignment, issued on 6 March 2023. The goal was to implement Web Sockets and create a real-time multiplayer game called BrandRace. Players compete to guess car brand logos faster than their opponents.

## Tech Stack
#### PHP API:

-Pulls data from a MySQL database

-Provides an endpoint (GetRandomBrands) for retrieving random car brand logos

-Returns images to the server one image at a time 

#### NodeJS Socket Server:

-Local server polling the PHP API

-Accepts multiple client connections simultaneously

-Allows users to specify a port at runtime (1024-49151)

-Utilizes PHP API for obtaining car brands for the game

-Implements various commands like LIST, KILL, QUIT, GAMES

-Handles lost sockets, keeps track of usernames, and generates unique GameID

-Implements the game loop functionality

#### Web Client:

-HTML, CSS and JS

-Uses Web Sockets to interact with the local NodeJS server

-Allows users to enter a username

-Options to enter or generate a GameID

-Implements the game loop on the user side in real-time
