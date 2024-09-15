import { db } from "@/db";
import { notFound } from "next/navigation";
import DesignConfigurator from "./DesignConfigurator";

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const Page = async ({ searchParams }: PageProps) => {
  const { id } = searchParams;

  //做id检查
  if (!id || typeof id !== "string") {
    return notFound();
  }

  //获取db数据
  const configuration = await db.configuration.findUnique({
    where: { id },
  });
  //
  if (!configuration) {
    return notFound();
  }
  const { width, height, imageUrl } = configuration;

  return (
    <DesignConfigurator
      configId={configuration.id}
      imageDimensions={{ width, height }}
      imageUrl={imageUrl}
    />
  );
};

export default Page;
