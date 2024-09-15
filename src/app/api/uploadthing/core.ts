import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";
import  sharp  from "sharp";
import { db } from "@/db";
import { log } from "console";

const f = createUploadthing();


export const ourFileRouter = {
  
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .input(z.object({ configId: z.string().optional() }))
    .middleware(async ({ input }) => {
      return { input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { configId } = metadata.input;

      //发起文件的请求
      const res = await fetch(file.url);
      console.log(res);
      
      //处理结果
      const buffer = await res.arrayBuffer()
      //获得图片的宽和高
      const imgMetadata = await sharp(buffer).metadata();
      
      const { width, height } = imgMetadata;

      console.log(width, height);
      console.log(configId);
      
      
      //第一步
      if (!configId) {
        console.log("!!!!!!!!!!!!!!!!!!!");
        
        const configuration = await db.configuration.create({
          data: {
            width: width || 500,
            height: height || 500,
            imageUrl: file.url,
          },
        });
        console.log(configuration)
        
        return { configId: configuration.id };
      } else {
        const updatedConfiguration = await db.configuration.update({
          where: {
            id: configId,
          },
          data: {
            croppedImageUrl: file.url,
          },
        });
        return { configId: updatedConfiguration.id };
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
