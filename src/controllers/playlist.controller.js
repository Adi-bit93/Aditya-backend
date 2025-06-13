import mongoose from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    if(!name || !description){
        throw new ApiError(400, "Name and description are must required")
    }

    const playlist = await Playlist.create({
        name,
        description, 
        videos: videoId,
        owner: req.user?._id
    }) 

    if(!playlist){
        throw new ApiError(500, "failed to create plalist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201, playlist, "playlist created successfull")
    )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!userId){
        throw new ApiError(400, "userId is required")
    }

    const playlists = await Playlist.find({owner: userId}).
    populate("videos", "title thumbnailUrl")
    .populate("owner", "name profilePicture")

    // This is how response will look like when we use populate
    // "owner"{
    //     "name": "Aditya",
    //     "profilePicture": "https://example.com/profile.jpg"
    // }

    if(!playlists || playlists.length === 0){
        throw new ApiError(404, "No playlists found for this user")
    }

    return res 
    .status(200)
    .json(
        new ApiResponse(200, playlists, "User playlists fetched successfully")
    )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
