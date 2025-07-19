import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {

    const { username, displayName, email, password, role } = req.body;

    if ([username, email, password].some(field => !field)) {
        throw new apiError(400, "All fields are required");
    }

    
});



export {
    registerUser,
}