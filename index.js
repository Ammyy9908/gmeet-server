const express = require('express');

const cors = require('cors');
const app = express();
app.use(cors());
const socket = require('socket.io');
const {Users} = require('./utils/users')

const port = process.env.PORT || 5000;





const server=app.listen(port,()=>{
   console.log(`server running at ${port}`);
})
const io = socket(server);
const users = new Users();
io.on("connection",(socket)=>{

   socket.on("join-meet",(code)=>{
      console.log("Meeting joined by",socket.id);
      console.log(code.code)
      socket.join(code.code);
      users.removeUser(socket.id);
      users.addUser(socket.id,"Sumit",code.code)
      io.to(code.code).emit("user-connect",users.getUserList(code.code));
      socket.broadcast.to(code.code).emit("system-message",{message:users.getUser(socket.id).name+"joined the meeting"});
      socket.on("chat-message",(message) => {
         socket.to(code.code).emit("chat-message",{message:message});
         
      })
   })

   

   socket.on("disconnect",()=>{
      console.log("User disconnected");
      const user = users.removeUser(socket.id);
      if(user){
         io.to(user.room).emit("user-connect",users.getUserList(user.room));
         io.to(user.room).emit("system-message",{message:user.name+"leave the meeting"});
      }
      
   })
})