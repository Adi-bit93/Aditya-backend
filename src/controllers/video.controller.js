import { v2 as cloudinary } from "cloudinary";

import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOncloudinary } from "../utils/cloudinary.js";


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    const videoFile = req.files?.videoFile?.[0]?.path;

    if (!videoFile || !title) {
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
            views: 0,
            videoFile: cloudUploadResponse.secure_url,
            cloudinaryId: cloudUploadResponse.public_id,
            duration: cloudUploadResponse.duration,
            thumbnail: cloudUploadResponse.thumbnail_url,
            owner: req.user?._id
        }
    )

    return res
        .status(201)
        .json(
            new ApiResponse(201, video, "Video published successfully")
        )
})

const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination
    try {
        const {
            page = 1,
            limit = 10,
            query = "",
            sortBy = "createdAt",
            sortType = "desc",
            userId
        } = req.query

        const filters = {}

        if (userId) {
            filters.user = userId;
        }

        if (query.trim()) {
            filters.$or = [
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } }
            ];
        }

        const sortOrder = sortType === "asc" ? 1 : -1;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder;

        const skip = parseInt(page - 1) * limit;

        const allVideos = await Video.countDocuments(filters)

        const videos = await Video.find(filters)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        videos,
                        pagination: {
                            total: allVideos,
                            page: parseInt(page),
                            limit: parseInt(limit),
                            totalPages: Math.ceil(allVideos / limit)
                        }
                    },
                    "Videos fetched successfully"
                )
            )
    } catch (error) {
        res.status(500).json(
            new ApiResponse(500, {}, "failed to fetch Videos", error.message)
        )
    }
})


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!videoId) {
        throw new ApiError(400, "Video Id id required")
    }

    const video = await Video.findById(videoId)
    
        .populate("owner", "username profilePicture")

    if (!video) {
        throw new ApiError(404, "Video not fouund ")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if(!videoId){
        throw new ApiError(400, "Video ID is required")
    }

    const {title, description} = req.body
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "video not found")
    }

    if(title){
        video.title = title
    }
    if(description){
        video.description = description
    }

    const thumbnailFile = req?.files?.thumbnail?.[0]?.path;
    if (thumbnailFile) {
        const cloudUploadResponse = await uploadOncloudinary(thumbnailFile, "thumbnails");
        if (cloudUploadResponse?.secure_url) {
            video.thumbnail = cloudUploadResponse.secure_url;
            video.cloudinaryThumbnailId = cloudUploadResponse.public_id;
        } else {
            throw new ApiError(500, "Failed to upload thumbnail to cloud storage");
        }
    }

    const updatedVideo = await video.save()
    if(!updatedVideo){
        throw new ApiError(500, "something went wrong while updating the video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    )



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