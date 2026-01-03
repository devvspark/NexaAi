// middleware to check userId and hasPremiumPlan

import { clerkClient,requireAuth } from "@clerk/express";

//we created a middleware using this we can check that user has premium or free plan also we can get users private metadata if avialable. if a
// available then add it req.free_usage other wise req.free-usage=0
export const auth=async(req,res,next)=>{
    try{
        const {userId,has}=await req.auth() //auth will be added using clerk middleware
        const hasPremiumPlan=await has({plan:'premium'}); //if user have premium plan it true otherwise false

        const user=await clerkClient.users.getUser(userId);
         
        if(!hasPremiumPlan && user.privateMetadata.free_usage){ // if user has free paln
            req.free_usage=user.privateMetadata.free_usage
        }
        else{
            await clerkClient.users.updateUserMetadata(userId,{
                privateMetadata:{
                    free_usage:0
                }
            })
            req.free_usage=0;
        }

        req.plan=hasPremiumPlan?'premium':'free';
        next();
    }
    catch(error){
        res.json({success:false,message:error.message});
    }
}


