import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";
import sharp from "sharp";
import { db } from "@/db";

const f = createUploadthing();

// 设置最大重试次数和重试延迟时间
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

// 重试机制的fetch函数
const fetchWithRetries = async (url: string, retries: number = MAX_RETRIES): Promise<Response> => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Fetch failed, retrying (${MAX_RETRIES - retries + 1})...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY)); // 延迟一段时间后再重试
      return fetchWithRetries(url, retries - 1); // 递归调用自己
    } else {
      throw new Error(`Failed to fetch after ${MAX_RETRIES} retries: ${error}`);
    }
  }
};

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .input(z.object({ configId: z.string().optional() }))
    .middleware(async ({ input }) => {
      return { input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { configId } = metadata.input;

      // 使用带有重试机制的 fetch
      const res = await fetchWithRetries(file.url);
      console.log(res);

      // 处理结果
      const buffer = await res.arrayBuffer();
      // 获得图片的宽和高
      const imgMetadata = await sharp(buffer).metadata();
      const { width, height } = imgMetadata;

      // 如果没有 configId，则创建新的配置
      if (!configId) {
        const configuration = await db.configuration.create({
          data: {
            width: width || 500,
            height: height || 500,
            imageUrl: file.url,
          },
        });
        console.log(configuration);

        return { configId: configuration.id };
      } else {
        // 如果有 configId，则更新现有配置
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
