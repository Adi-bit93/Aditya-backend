import {Router} from "express"
import { 
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
} from "../controllers/comment.controller"
import{ verifyJWT} from "../middlewares/auth.middleware";

const router = Router()

router.use(verifyJWT);

router.route.get("/:videoId").get(getVideoComments).post(addComment);
router.route.get("/c/:commentId").delete(deleteComment).patch(updateComment);