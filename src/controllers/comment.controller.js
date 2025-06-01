import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId){
        throw new ApiError(400, "Video ID is required")
    }

    const skip = (page - 1) * limit 

    const comment = await Comment.find({video: videoId })
    .sort({createdAt: -1})
    .skip(skip)
    .limit(parseInt(limit))
    .populate("owner", "username avatar")
    .exec()

    const totalComments = await Comment.countDocuments({video: videoId})

    return res
    .status(200)
    .json(
        new ApiResponse(200, {
            comment,
            currentPage: page,
            totalPages: Math.ceil(totalComments / limit),
            totalComments
        }, "Comments fetched successfully")
    );
    

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const {videoId, content} = req.body 

    if(!videoId || !content){
        throw new ApiError(400, "Video ID and content are required")
    }

    const comment = await Comment.create(
        {
            content,
            video: videoId,
            owner: req.user?._id
        }
    )

    if(!comment){
        throw new ApiError(500, "Something went wrong while adding the comment")
    }

    const populatedComment = await comment.populate("owner", "username avatar")


    return res 
    .status(201)
    .json(
        new ApiResponse(201, populatedComment, "Comment added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const {content} = req.body;

    if(!commentId || !content){
        throw new ApiError(400, "Comment ID and content are required")
    }

    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id: commentId, 
            owner: req.user?._id
        },
        {
            $set:
            {
                content,
            }
        },
        {
            new : true
        }
    )

    if(!updatedComment){
        throw new ApiError(404, "comment not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

    if(commentId){
        throw new ApiError(400, "Comment ID is required")
    }

    const deletedComment = await Comment.findOneAndDelete(
        {
            _id: commentId,
            owner: req.user?._id
        }
    )

    if(!deletedComment){
        throw new ApiError(404, "Something went wrong while deleting the comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, deletedComment, "Comment deleted successfully")
    )

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
}
