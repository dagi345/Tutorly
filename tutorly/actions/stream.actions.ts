"use server"
import { currentUser } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";

    

const apikey= process.env.NEXT_PUBLIC_STREAM_KEY;
const apisecret= process.env.STREAM_SECRET_KEY;

export const tokenProvider =async () =>{
    const user = await currentUser()

    if (!user) {
        throw new Error("User not found");
    }
    if (!apikey || !apisecret) {
        throw new Error("Stream API keys are not set");
    }
    if (!apisecret){
        throw new Error("Stream API secret is not set");
    }

    const Client = new StreamClient(apikey, apisecret);
    const exp= Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour expiration

    const issued= Math.floor(Date.now() / 1000) - 60;

    const token = Client.generateUserToken({
        user_id: user.id,
        name: user.username || user.id,
        image: user.imageUrl,
        exp,
        issued_at: issued,
    });

    return token;
}