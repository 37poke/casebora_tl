"use client";

// 设计配置组件的Props类型定义
interface DesignConfiguratorProps {
  configId: string; // 配置ID
  imageUrl: string; // 用户上传的图片URL
  imageDimensions: { width: number; height: number }; // 图片的宽高尺寸
}

// 导入所需的组件和工具函数
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn, formatPrice } from "@/lib/utils"; // cn用于处理类名，formatPrice用于格式化价格
import NextImage from "next/image"; // Next.js的图片组件
import { Rnd } from "react-rnd"; // 可拖拽和调整大小的组件
import HandleComponents from "@/components/HandleComponents"; // 自定义句柄组件
import { ScrollArea } from "@radix-ui/react-scroll-area"; // 可滚动区域组件
import { RadioGroup } from "@headlessui/react"; // 单选框组组件
import { useRef, useState } from "react"; // React中的Ref和State Hook
import {
  COLORS,
  FINISHES,
  MATERIALS,
  MODELS,
} from "@/validators/options-validator"; // 可选配置的验证器
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu"; // 下拉菜单组件
import { Button } from "@/components/ui/button"; // 按钮组件
import { Label } from "@radix-ui/react-label"; // 标签组件
import { ArrowRight, Check, ChevronDown } from "lucide-react"; // 图标
import { BASE_PRICE } from "@/config/products"; // 产品的基本价格
import { useUploadThing } from "@/lib/uploadthing"; // 文件上传工具
import { useToast } from "@/hooks/use-toast"; // Toast消息提示工具
import { useMutation } from "@tanstack/react-query";
import { SaveConfigArgs, saveConfig as _saveConfig } from "./action";
import { useRouter } from "next/navigation";

export default function DesignConfigurator({
  configId,
  imageDimensions,
  imageUrl,
}: DesignConfiguratorProps) {
  // 配置选项的状态，包括颜色、型号、材料和表面处理
  const [options, setOptions] = useState<{
    color: (typeof COLORS)[number];
    model: (typeof MODEL.options)[number];
    material: (typeof MATERIALS.options)[number];
    finish: (typeof FINISHES.options)[number];
  }>({
    color: COLORS[0],
    model: MODELS.options[0],
    material: MATERIALS.options[0],
    finish: FINISHES.options[0],
  });

  const router = useRouter()
  // Toast提示
  const { toast } = useToast();

  const {mutate: saveConfig} = useMutation({
    mutationKey: ["save-config"],
    mutationFn: async (args: SaveConfigArgs) => {
      await Promise.all([saveConfiguration(), _saveConfig(args)])
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "There was an error on our end. Please try again.",
        variant: "destructive"
      })
    },
    onSuccess: () => {
      router.push(`/configure/preview?id=${configId}`)
    },
  })


  // 渲染图片的尺寸
  const [renderedDimension, setRenderedDimension] = useState({
    width: imageDimensions.width / 4,
    height: imageDimensions.height / 4,
  });

  // 渲染图片的位置
  const [renderedPosition, setRenderedPosition] = useState({ x: 150, y: 205 });

  // 创建phoneRef和containerRef，用于引用DOM元素
  const phoneRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 调用上传函数
  const { startUpload } = useUploadThing("imageUploader");

  // 保存配置函数
  async function saveConfiguration() {
    try {
      // 计算用户图片与手机模板的重叠部分
      if (!phoneRef.current) return;
      const {
        left: caseLeft,
        top: caseTop,
        width,
        height,
      } = phoneRef.current!.getBoundingClientRect();

      const { left: containerLeft, top: containerTop } =
        containerRef.current!.getBoundingClientRect();

      const leftOffset = caseLeft - containerLeft;
      const topOffset = caseTop - containerTop;

      // 实际渲染的X和Y坐标
      const actualX = renderedPosition.x - leftOffset;
      const actualY = renderedPosition.y - topOffset;

      // 创建Canvas来绘制最终图片
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      // 创建一个新的图片对象并加载用户图片
      const userImage = new Image();
      userImage.crossOrigin = "anonymous"; // 允许跨域加载图片
      userImage.src = imageUrl;
      // 等待图片加载完成
      await new Promise((resolve) => (userImage.onload = resolve));

      // 将用户图片绘制到Canvas上
      ctx?.drawImage(
        userImage,
        actualX,
        actualY,
        renderedDimension.width,
        renderedDimension.height
      );

      // 将Canvas转成Base64格式
      const base64 = canvas.toDataURL();
      console.log(base64);

      const base64Data = base64.split(",")[1];

      // 将Base64数据转换成Blob
      const blob = base64ToBlob(base64Data, "image/png");

      // 将Blob转换成文件
      const file = new File([blob], "filename.png", { type: "image/png" });

      // 上传文件
      await startUpload([file], { configId });
    } catch (error) {
      // 弹出错误提示
      toast({
        title: "操作失败",
        description: "保存配置时出现问题，请重试。",
        variant: "destructive",
      });
    }
  }

  // 将Base64字符串转换成Blob
  function base64ToBlob(base64: string, mimeType: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  return (
    <div className="relative mt-20 grid grid-cols-1 lg:grid-cols-3 mb-20 pb-20">
      {/**设计区域 */}
      <div
        ref={containerRef}
        className="relative h-[37.5rem] overflow-hidden col-span-2 w-full
        max-w-4xl flex items-center justify-center rounded-lg border-2
        border-dashed border-gray-300 p-12 text-center focus:outline-none
        focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <div
          className="relative w-60 bg-opacity-50 pointer-events-none aspect-[896/1831]
            "
        >
          <AspectRatio
            ref={phoneRef}
            ratio={896 / 1831}
            className="pointer-events-none relative z-50 aspect-[896/1831] "
          >
            <NextImage
              alt="phone image"
              src="/phone-template.png"
              className="pointer-events-none z-50 select-none"
              fill
            />
          </AspectRatio>
          <div
            className="absolute z-40 inset-0 left-[3px] top-px
          right-[3px] bottom-px rounded-[32px] shadow-[0_0_0_99999px_rgba(229,231
          ,235,0.6)]"
          />
          <div
            className={cn(
              "absolute inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px]",
              `bg-${options.color.tw}`
            )}
          />
        </div>

        <Rnd
          default={{
            x: 150,
            y: 205,
            height: imageDimensions.height / 4,
            width: imageDimensions.width / 4,
          }}
          onResizeStop={(_, __, ref, ___, { x, y }) => {
            //50px
            setRenderedDimension({
              height: parseInt(ref.style.height.slice(0, -2)),
              width: parseInt(ref.style.width.slice(0, -2)),
            });

            setRenderedPosition({ x, y });
          }}
          onDragStop={(_, data) => {
            const { x, y } = data;
            setRenderedPosition({ x, y });
          }}
          className="absolute z-20 border-[3px] border-primary"
          lockAspectRatio
          resizeHandleComponent={{
            bottomLeft: <HandleComponents />,
            bottomRight: <HandleComponents />,
            topLeft: <HandleComponents />,
            topRight: <HandleComponents />,
          }}
        >
          <div className="relative w-full h-full">
            <NextImage
              src={imageUrl}
              fill
              alt="your image"
              className="pointer-events-none"
            />
          </div>
        </Rnd>
      </div>
      {/**选择区域 */}
      <div className="h-[37.5rem] w-full col-span-full lg:col-span-1 flex flex-col bg-white">
        <ScrollArea className="relative flex-1 overflow-auto">
          <div
            aria-hidden
            className="absolute z-10 inset-x-0 bottom-0 
            h-12 bg-gradient-to-t from-white pointer-events-none"
          />

          <div className="px-8 pb-12 pt-8">
            <h2 className="tracking-tight font-bold text-3xl">
              Customize your case
            </h2>

            <div className="w-full h-px bg-zinc-200 my-6" />
            {/**选择颜色 */}
            <div
              className="relative mt-4 h-full flex flex-col
            justify-between"
            >
              <div className="flex flex-col gap-6">
                <RadioGroup
                  value={options.color}
                  onChange={(val) => {
                    setOptions((prev) => ({
                      ...prev,
                      color: val,
                    }));
                  }}
                >
                  <Label>Color:{options.color.label}</Label>
                  <div className="mt-3 flex items-center space-x-3">
                    {COLORS.map((color) => (
                      <RadioGroup.Option
                        key={color.label}
                        value={color}
                        className={({ active, checked }) =>
                          cn(
                            "relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 active:ring-0 focus:ring-0 active:outline-none focus:outline-none border-2 border-transparent",
                            { [`border-${color.tw}`]: active || checked }
                          )
                        }
                      >
                        <span
                          className={cn(
                            `bg-${color.tw}`,
                            "h-8 w-8 rounded-full border border-black border-opacity-10"
                          )}
                        ></span>
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
                {/**选择模式 */}
                <div
                  className="relative flex flex-col gap-3
              w-full"
                >
                  <Label>Model</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={"outline"}
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {options.model.label}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50"></ChevronDown>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                      {MODELS.options.map((model) => (
                        <DropdownMenuItem
                          key={model.label}
                          className={cn(
                            "flex text-sm gap-1 items-center p-1.5 cursor-default hover:bg-zinc-100",
                            {
                              "bg-zinc-100":
                                model.label === options.model.label,
                            }
                          )}
                          onClick={() =>
                            setOptions((prev) => ({ ...prev, model }))
                          }
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              model.label === options.model.label
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {model.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {[MATERIALS, FINISHES].map(
                  ({ name, options: selectableOptions }) => (
                    <RadioGroup
                      key={name}
                      value={options[name]}
                      onChange={(val) => {
                        setOptions((prev) => ({
                          ...prev,
                          [name]: val,
                        }));
                      }}
                    >
                      <Label>
                        {name.slice(0, 1).toUpperCase() + name.slice(1)}
                      </Label>
                      <div className="mt-3 space-y-4">
                        {selectableOptions.map((option) => (
                          <RadioGroup.Option
                            key={option.value}
                            value={option}
                            className={({ active, checked }) =>
                              cn(
                                "relative block cursor-pointer rounded-lg bg-white px-6 py-4 shadow-sm border-2 border-zinc-200 focus:outline-none ring-0 focus:ring-0 outline-none sm:flex sm:justify-between",
                                {
                                  "border-primary": active || checked,
                                }
                              )
                            }
                          >
                            <span className="flex items-center">
                              <span className="flex flex-col text-sm">
                                <RadioGroup.Label
                                  as="span"
                                  className="font-medium text-gray-900"
                                >
                                  {option.label}
                                </RadioGroup.Label>

                                {option.description ? (
                                  <RadioGroup.Description
                                    as="span"
                                    className="text-gray-500"
                                  >
                                    <span className="block sm:inline">
                                      {option.description}
                                    </span>
                                  </RadioGroup.Description>
                                ) : null}
                              </span>
                            </span>

                            <RadioGroup.Description
                              as="span"
                              className="mt-2 flex text-sm sm:ml-4 sm:mt-0 sm:flex-col sm:text-right"
                            >
                              <span className="font-medium text-gray-900">
                                {formatPrice(option.price / 100)}
                              </span>
                            </RadioGroup.Description>
                          </RadioGroup.Option>
                        ))}
                      </div>
                    </RadioGroup>
                  )
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
        {/**下一步区域 */}
        <div className="w-full px-8 h-16 bg-white">
          <div className="h-px w-full bg-zinc-200" />
          <div className="w-full h-full flex justify-end items-center">
            <div className="w-full flex gap-6 items-center">
              <p className="font-medium whitespace-nowrap">
                {formatPrice(
                  (BASE_PRICE + options.finish.price + options.material.price) /
                    100
                )}
              </p>
              <Button
                size="sm"
                className="w-full"
                onClick={() => saveConfig({
                  configId,
                  color: options.color.value,
                  finish: options.finish.value,
                  material: options.material.value,
                  model: options.model.value
                })}
              >
                Continue{" "}
                <ArrowRight className="h-4 w-4 ml-1.5 inline"></ArrowRight>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
