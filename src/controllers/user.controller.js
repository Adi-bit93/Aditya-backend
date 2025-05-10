import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import { uploadOncloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';



const registerUser = asyncHandler(async (req, res) =>{
  const { fullName, email, password, username } = req.body;
   // console.log("fullName :", fullName);
   console.log("email :", email);
   // console.log("REQ.BODY:", req.body);

   if(
      [fullName, email, password, username].some((field) =>
       field?.trim()===""
      )
   ){
      throw new ApiError(400, "All fields are required");
   }

   const existingUser = await User.findOne({
      $or: [ { username },{ email }]
   })

   if(existingUser){
      throw new ApiError(409, "User already exists ")
   }

   // console.log("req.files :", req.files);
   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.files?.coverImage[0]?.path;

   if(!avatarLocalPath){
      throw new ApiError(400, "Avatar is  required");
   }

   const avatar = await uploadOncloudinary(avatarLocalPath)
   const coverImage = await uploadOncloudinary(coverImageLocalPath)

   if(!avatar){
      throw new ApiError(400, "Avatar is required");
   }

   const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email, 
      password,
      username : username.toLowerCase()
   })

   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   )

   if(!createdUser){
      throw new ApiError(500, "Something went wrong while registering the user")
   }

   return res.status(201).json(
      new ApiResponse(201, createdUser, "User registered successfully")
   )
})

export {registerUser}