import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import { uploadOncloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';


const generateAccessTokenAndRefreshToken = async(userId) =>
{
   try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave : false })

      return {accessToken, refreshToken}

   } catch (error) {
      throw new ApiError(500, "Something went wrong while generating token")
      
   }
}

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
   //const coverImageLocalPath = req.files?.coverImage[0]?.path;

   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
      coverImageLocalPath = req.files.coverImage[0].path
   }

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

const loginUser = asyncHandler(async (req, res) =>{

    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie
    
   const {email, username, password} = req.body
   console.log("Req.body :", req.body)
   console.log("email :", email);

   if(!username && !email){
      throw new ApiError(400, "username or email is required")
   }
   const user = await User.findOne({
      $or: [{username}, {email}]
   })

   if(!user){
      throw new ApiError(404, "user does not exist")
   }
   const ispasswordValid = await user.isPasswordCorrect(password)
   if(!ispasswordValid){
      throw new ApiError(401, "Invalid credentials")
   }

   const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)
   const loggedInUser = await User.findById(user._id).select( "-password -refreshToken")

   const options = {
      httpOnly: true,
      secure: true
   }
   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
      new ApiResponse(
         200,
         { 
            user: loggedInUser, accessToken, refreshToken
         },
         "User Logged in successfully"
      )
   )

})

const logoutUser = asyncHandler(async (req, res) =>{
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $set: {
            refreshToken: undefined
         }
      },
      {
         new : true
      }
   )
    const options = {
      httpOnly: true,
      secure: true
   }

   return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(new ApiResponse(200, {}, "User logged out successfully"))
})

export {
   registerUser,
   loginUser,
   logoutUser
}