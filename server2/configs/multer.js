import multer from "multer";

const storage=multer.diskStorage({});

export const upload=multer({storage}); //we add this a as a middleware in removebackground route
