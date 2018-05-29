# GodWatch for node.js

GodWatch is a remote system uptime monitor running with node.js.

Oh, and by the way IT'S NOT DONE! YAY!!!
Don't use it yet!

//Needs salt (extra salt)

## Installing GodWatch

### Server

To set up, you will need node and mongodb installed. You should also install nodemon to automatically restart the server on uncaught exceptions.

```
git clone https://github.com/Samusoidal/node-godwatch/ godwatch
```

NOTE: The example below is using one terminal window, however, I recommend using screen to manage multiple terminal sessions.

```
cd godwatch
mongodb --dbpath data & nodemon server.js
```

With screen:
```
cd godwatch
screen
mongodb --dbpath data
screen
nodemon server.js
```
You can use CTRL+A then N to switch sessions.

After starting the server, it will run through the configuration process. Follow the prompts to finish the configuration.

//Add link to configuration docs

### Server Administrator

### Client
