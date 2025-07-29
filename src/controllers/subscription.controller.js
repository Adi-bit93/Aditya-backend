import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const userId = req.user?._id;

    if(!channelId){
        throw new ApiError(400, "Channel Id is required")
    }

    if(userId.toString() === channelId){
        throw new ApiError(400, "Cannot subscribe to your own channel");
    }

    const channel = await User.findById(channelId);
    if(!channel){
        throw new ApiError(404, "Channel not found");
    }

    const user = await User.findById(userId);
    const isSubscribed = user.Subscription.includes(channelId)

    if(isSubscribed){
        user.subscription.pull(channelId);
        channel.subscribers.pull(userId);  
    }else{
        user.subscription.push(channelId);
        channel.subscribers.push(userId);
    }

    await user.save();
    await channel.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, {isSubscribed: !isSubscribed}, `Successfully ${isSubscribed ? "unsubscribed" : "subscribed"} to the channel`)
        )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId){
        throw new ApiError("channelId is required")
    }

    const channel = await User.findById(channelId).populate("subscribers", "name profilePicture")
    if(!channel){
        throw new ApiError(404, "channel not found")
    }
    const subscribers = channel.subscribers;
    if(!subscribers || subscribers.Length === 0){
        return res
            .status(200)
            .json(
                new ApiResponse(200, [], "No subscribers found for this channel")
            )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribers, "Subscribers fetched successfully")
        )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!subscriberId){
        throw new ApiError(400, "Subscriber Id is required")
    }

    const subscriber = await User.findById(subscriberId).populate("subscriptions", "fullName avatar subscribers ")
    if(!subscriber){
        throw new ApiError(404, "Subscriber not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscriber.subscription, "Subscribed channels fetched successfully")
        )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}