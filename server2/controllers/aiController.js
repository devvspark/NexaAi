import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body; // length of article
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      // if user already used 10 credits in that case user not able to genereate article
      return res.json({
        success: false,
        message: "Limit Reached . Upgrade to continue.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: length,
    });

    const content = response.choices[0].message.content; // response from ai

    // store this response data in database

    await sql`INSERT INTO creations(user_id,prompt,content,type)
    VALUES(${userId},${prompt},${content},'article')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }
    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body; // length of article
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      // if user already used 10 credits in that case user not able to genereate article
      return res.json({
        success: false,
        message: "Limit Reached . Upgrade to continue.",
      });
    }


    const blogPrompt = `
    Generate blog title ideas for the topic: "${prompt}".
    Follow this structure exactly:

    **Broad & Catchy**:
    - [title 1]
    - [title 2]
    - [title 3]
    - [title 4]

    **More Descriptive**:
    - [title 1]
    - [title 2]
    - [title 3]
    


    Do not add explanations. Only return titles in this exact format with dashes (-).
    `;

    

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: blogPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content; // response from ai

    // store this response data in database

    await sql`INSERT INTO creations(user_id,prompt,content,type)
      VALUES(${userId},${prompt},${content},'blog-title')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }
    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body; // publish it could be true or false
    const plan = req.plan;
    //   const free_usage=req.free_usage;

    // plan change 4 hour 21 min
    //   if(plan!=='premium' && free_usage>=10){
    //       return res.json({success:false,message:"Limit Reached . Upgrade to continue."})
    //   }

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    // another ai for image generation
    // clipdrop
    const formData = new FormData();
    formData.append("prompt", prompt);
    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: { "x-api-key": process.env.CLIPDROP_API_KEY },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(
      data,
      "binary"
    ).toString("base64")}`;

    // image url hame isse database mai store karna hai
    const { secure_url } = await cloudinary.uploader.upload(base64Image);
    // store this response data in database

    await sql`INSERT INTO creations(user_id,prompt,content,type,publish)
      VALUES(${userId},${prompt},${secure_url},'image',${publish ?? false})`;

    // if (plan !== "premium") {
    //   await clerkClient.users.updateUserMetadata(userId, {
    //     privateMetadata: {
    //       free_usage: free_usage + 1,
    //     },
    //   });
    // }

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    //we need image here for removing background
    const image = req.file; // req se ham image lenge
    //multer middleware for this image
    const plan = req.plan;
    //   const free_usage=req.free_usage;

    // plan change 4 hour 21 min
    //   if(plan!=='premium' && free_usage>=10){
    //       return res.json({success:false,message:"Limit Reached . Upgrade to continue."})
    //   }

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    // we removing background using cloudinary
    // we uploading a image  here
    // background remove karne ke bad ye naye image ka ure return karke dega secure_url ke andar
    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove_the_background",
        },
      ],
    }); // req.file ki image upload

    await sql`INSERT INTO creations(user_id,prompt,content,type)
        VALUES(${userId},'Remove background from image',${secure_url},'image')`;

    // if (plan !== "premium") {
    //   await clerkClient.users.updateUserMetadata(userId, {
    //     privateMetadata: {
    //       free_usage: free_usage + 1,
    //     },
    //   });
    // }

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body; //konsa obj delete karna hai vo liya request.body se
    // const { image } = req.file; this is not valid curly braces
    const image= req.file;
    const plan = req.plan;
    //   const free_usage=req.free_usage;

    // plan change 4 hour 21 min
    //   if(plan!=='premium' && free_usage>=10){
    //       return res.json({success:false,message:"Limit Reached . Upgrade to continue."})
    //   }

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    // we removing object using cloudinary
    // we uploading a image  here
    // public_id ke andar kis image ka object remove karna hai uski public_id aa jayegi
    const { public_id } = await cloudinary.uploader.upload(image.path);
    // ojbect remove karne ke bad ye naye image ka ure return karke dega image_url ke andar
    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    await sql`INSERT INTO creations(user_id,prompt,content,type)
          VALUES(${userId},${`Removed ${object} from image`},${imageUrl},'image')`;

    // if (plan !== "premium") {
    //   await clerkClient.users.updateUserMetadata(userId, {
    //     privateMetadata: {
    //       free_usage: free_usage + 1,
    //     },
    //   });
    // }

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file; // req.file se resume le liya
    const { image } = req.file;
    const plan = req.plan;
    //   const free_usage=req.free_usage;

    // plan change 4 hour 21 min
    //   if(plan!=='premium' && free_usage>=10){
    //       return res.json({success:false,message:"Limit Reached . Upgrade to continue."})
    //   }

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      // resume ki size 5mb se jyada hogi to
      return res.json({
        success: false,
        message: "Resume file size exceeds allowed size (5MB).",
      });
    }

    // if file size is less than 5mb then first we converting it into data buffer
    const dataBuffer = fs.readFileSync(resume.path);
    //wehave to parts this resume to extract its text for that we are using pdf parse packet

    const pdfData = await pdf(dataBuffer);

    const prompt = `Review the following resume and provide constructive feedback 
    on its strengths,weaknesses,and areas for improvement.
    Resume Content.Always complete your response. Do not leave unfinished sentences. 
    End with a summary line like: "This concludes the resume analysis.\n\n${pdfData.text}`;

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations(user_id,prompt,content,type)
    VALUES(${userId}, 'Review the uploaded resume', ${content},'resume-review')`;

    // if (plan !== "premium") {
    //   await clerkClient.users.updateUserMetadata(userId, {
    //     privateMetadata: {
    //       free_usage: free_usage + 1,
    //     },
    //   });
    // }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
