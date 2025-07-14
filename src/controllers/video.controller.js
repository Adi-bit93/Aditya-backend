import {Video} from "../models/video.model.js";
import {ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {uploadOncloudinary} from "../utils/cloudinary.js";


const publishAVideo = asyncHandler(async (req, res) =>
{
    const {title, description} = req.body;

    const videoFile = req.file?.path;

    if(!videoFile || !title){
        throw new ApiError(400, "Video file and title are required");
    }

    const cloudUploadResponse = await cloudinary.uploader.upload(videoFile, 
        {
            resource_type: "video",
            folder: "videos",
        }
    )
    
    const video = await Video.create(
        {
            title,
            description,
            views : 0,
            videoUrl: cloudUploadResponse.secure_url,
            cloudinaryId: cloudUploadResponse.public_id,
            duration:cloudUploadResponse.duration,
            thumbnail: cloudUploadResponse.thumbnail_url,
            owner : req.user?._id
        }
    )

    return res
        .status(201)
        .json(
            new ApiResponse(201, video, "Video published successfully")
        )
})

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}