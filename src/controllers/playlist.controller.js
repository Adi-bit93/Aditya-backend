import mongoose from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    //TODO: create playlist

    if (!name || !description) {
        throw new ApiError(400, "Name and description are must required")
    }
    const playlist = await Playlist.create({
        name,
        description,
        videos: videoId,
        owner: req.user?._id
    })
    if (!playlist) {
        throw new ApiError(500, "failed to create playlist")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(201, playlist, "playlist created successfully")
        )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists

    if (!userId) {
        throw new ApiError(400, "userId is required")
    }

    const playlists = await Playlist.find({ owner: userId }).
        populate("videos", "title thumbnailUrl")
        .populate("owner", "name profilePicture")

    // This is how response will look like when we use populate
    // "owner"{
    //     "name": "Aditya",
    //     "profilePicture": "https://example.com/profile.jpg"
    // }

    if (!playlists || playlists.length === 0) {
        throw new ApiError(404, "No playlists found for this user")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlists, "User playlists fetched successfully")
        )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id

    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required")
    }

    const playlist = await Playlist.findById(playlistId)
        .populate("videos", "title thumbnailUrl")
        .populate("owner", "name profilePicture")

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "playlist fetched successfully")
        )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
     //TODO: Add video to playlist 

    if(!playlistId || !videoId){
        throw new ApiError(400, "playlistId and videoId are required")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "playlist not found")
    }
    
    const isVideoAlreadyAdded = playlist.videos.some(
        (id) => id.toString() === videoId
    );
    if(isVideoAlreadyAdded){
        throw new ApiError(400, "video already exists in the playlist")
    }

    playlist.videos.push(videoId)
    await playlist.save()

// return response
    return res 
    .status(200)
    .json(
        new ApiResponse(200, playlist, "video added to playlist successfully")
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

    if (!playlistId || !videoId) {
        throw new ApiError(400, "playlistId and videoId are required")
    }
   
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "playlist not found")
    }

    const videoIndex = playlist.videos.findIndex(
        (id) => id.toString() === videoId
    );
    if (videoIndex === -1){
        throw new ApiError(404, "video not found in the playlist")
    }
    playlist.videos.splice(videoIndex, 1)
    await playlist.save()
    return res 
    .status(200)
    .json(
        new ApiResponse(200, playlist, "video removed from playlist successfully")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist

    if(!playlistId){
        throw new ApiError(400, "playlistId is required")
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found or already deleted.");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, null, "Playlist deleted successfully.")
    );

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist

    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    if (name) playlist.name = name
    if (description) playlist.description = description
    await playlist.save()
    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist updated successfully")
    )

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
