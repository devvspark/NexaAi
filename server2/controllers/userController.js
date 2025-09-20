import sql from "../configs/db.js";

export const getUserCreations=async (req,res)=>{
    try{
        const {userId}=req.auth()

        const creations=await sql`SELECT * FROM creations WHERE user_id=${userId} ORDER BY created_at DESC`;
        res.json({success:true,creations});
    }
    catch(error){
        res.json({success:false,message:error.message});
    }
}



export const getPublishedCreations=async (req,res)=>{
    try{
        

        const creations=await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;
        res.json({success:true,creations});
    }
    catch(error){
        res.json({success:false,message:error.message});
    }
} 





// toggle for like dislike
export const toggleLikeCreation=async (req,res)=>{
    try{
        
        const {userId}=req.auth()
        const {id}=req.body

        //we will get particular creation using this id
        const [creation]=await sql`SELECT * FROM creations WHERE id=${id}`

        if(!creation){
            res.json({success:false,message:"Creation not found"})
        }

        const currentLikes=creation.likes;
        const userIdStr=userId.toString();
        let updatedLikes;
        let message;

        if(currentLikes.includes(userIdStr)){ // useridstr pahle hi include hogi to we have to remove it from that array
            updatedLikes=currentLikes.filter((user)=>user!==userIdStr);
            message='Creation UnLiked'
        }
        else{
            updatedLikes=[...currentLikes,userIdStr]
            message='Creation Liked'
        }

        const formattedArray=`{${updatedLikes.join(',')}}`

        await sql`UPDATE creations SET likes=${formattedArray}::text[] WHERE id=${id}`;
        res.json({success:true,message});
    }
    catch(error){
        res.json({success:false,message:error.message});
    }
} 