const mongoose = require('mongoose')
const User = require('../models/userModel');
const bcrypt = require('bcrypt')
const catchErrorHandler = require("../utils/catchErrorHandler");
const { find } = require('../models/userModel');

class UserService {
    async register(data) {
        const { fullname, email, password, phone_number } = data
       
        if(!fullname|| !email || !password || !phone_number){
        return {"data": {"success": false, "message": 'Request failed due to all required inputs were not included', "required inputs": "fullname, email, password, phone_number"}, "statusCode": 417}
        }
        //check if user is already registered
        let isUser = await User.findOne({ email: email })
        if(isUser){
        return {"data": {"success": false, "message": "Email is already registered with us."}, "statusCode": 409}
        }
        else{
             const user =  await new User({
              _id: mongoose.Types.ObjectId(),
                 fullname,
                 email,
                 password,
                 phone_number,
                 usertype: "user"
                  }).save();
                
            return {"data":{ "success": true, "message": `You have successfully signed up`, user}, "statusCode": 201 }
         }
        
     
    }

        async login(data) {
          const { email, password } = data
          if (!email || !password){
            return {"data": {"success": false, "message": 'Request failed due to all required inputs were not included', "required inputs": " email, password"}, "statusCode": 417}
          }  
          //check if user exist
           const user = await User.findOne({email});
          if (!user){
            return {"data": {"success": false, "message": "Email does not exist"}, "statusCode": 404}
        }
         //compare password provided with password already in database
         const isMatch = await bcrypt.compare(password, user.password)
          if (isMatch){
            const token = user.generateAuthToken();
            return {"data": {"success": true, token }, "statusCode": 200}
            }
         else{
        return {"data": {"success": false, "message": "invalid Email or Password"}, "statusCode": 401}
         } 
        }
      
     async updateUser(id, data){
      let {email, fullname, phone_number} = data
      try{
      if(id){
        let updateUser= await User.findOneAndUpdate({_id:id}, { $set: data},{ new: true,
          upsert: true })
          if(updateUser){
            return {"data": {"success": true, "message": 'Account was successfully updated', updateUser}, "statusCode": 200}
          }
            return {"data": {"success": false, "message": 'We encountered an error updating your account, try again.'}, "statusCode": 500}
      }
         else{
           return {data: {message:"id is required"}, statusCode:417};
         }
      }
      catch(err){
        return catchErrorHandler.errorHandler(err, "User's data could not be updated, try again.")
      }
    
 }

  async deleteUser(id){
    try{
    if(id){
      const user = await User.remove({ _id: id });
      return {"data": {"success": true, "message": 'Account successfully deleted.'}, "statusCode": 301}
    }
    else{
      return {"data": {"success": false, "message": 'We encountered an error deleting your account, try again.'}, "statusCode": 500}

    }
  }
catch(err){
  return catchErrorHandler.errorHandler(err, "Could not delete User, try again.")
}

 }
 }
    
    
    
      module.exports = module.exports = new UserService();
