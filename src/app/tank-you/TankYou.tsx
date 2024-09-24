"use client";

import { useQuery } from "@tanstack/react-query";
import { getPaymentStatus } from "./action";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import PhonePreview from "@/components/PhonePreview";
import { formatPrice } from "@/lib/utils";

const ThankYou = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";

  //查询数据库
  const { data } = useQuery({
    queryKey: ["get-payment-status"],
    queryFn: async () => await getPaymentStatus({ orderId }),
    retry: true,
    retryDelay: 500,
  });

  //如果没有订单
  if (data === undefined) {
    return (
      <div className="w-full mt-24 justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          <h3 className="font-semibold text-xl"> Loading your order</h3>
          <p>This won't take long.</p>
        </div>
      </div>
    );
  }
  //检查支付状态
  if (data === false) {
    return (
      <div className="w-full mt-24 justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          <h3 className="font-semibold text-xl"> Verifying your order</h3>
          <p>This might take a moment.</p>
        </div>
      </div>
    );
  }
  //获取订单数据
  const { configuration, BillingAddress, ShippingAddress, amount } = data;
  const { color } = configuration;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 ld:px-8">
        <div className="max-w-xl">
          <h1 className="text-base font-medium text-primary">Tank you!</h1>
          <p className="mt-2 text-4xk font-bold tracking-tight sm:text-5xl"></p>
        </div>
        <p className="mt-2 text-base text-zinc-500">
          We've received your order and are now processing it.
        </p>

        <div className="mt-12 text-sm font-medium">
          <p className="text-zinc-900">Order number</p>
          <p className="mt-2 text-zinc-500">{orderId}</p>
        </div>

        <div className="mt-10 border-t border-zinc-200">
          <div className="mt-10 flex flex-auto flex-col">
            <h4 className="font-semibold text-zinc-900">
              You made a great choice!
            </h4>
            <p className="mt-2 text-sm text-zinc-600">
              We are CaseCobra believe that a phone case doesn't only need to
              look good, but also last you for the years to come.We offer a 5-
              year print guarantee: If you case isn't of th highest
              quality,we'll replace it for free
            </p>
          </div>
        </div>

        <div
          className="flex space=x-6 overflow-x-hidden mt-4 rounded-xl
        bg-gray-900/5 ring-1 ring-inset ring-gray-900/10 lg:rounded-xl"
        >
          <PhonePreview
            croppedImageUrl={configuration.croppedImageUrl!}
            color={color!}
          />
        </div>

        <div className="grid grid-cols-2 gap-x-6 py-10 text-sm">
          <div>
            <p className="font-medium text-gray-900"> Shipping address</p>
            <div className="mt-2 text-zinc-700">
              <address className="not-italic">
                <span className="block">{ShippingAddress?.name}</span>
                <span className="block">{ShippingAddress?.street}</span>
                <span className="block">
                  {ShippingAddress?.postalCode} {ShippingAddress?.city}
                </span>
              </address>
            </div>
          </div>

          <div>
            <p className="font-medium text-gray-900"> Shipping address</p>
            <div className="mt-2 text-zinc-700">
              <address className="not-italic">
                <span className="block">{BillingAddress?.name}</span>
                <span className="block">{BillingAddress?.street}</span>
                <span className="block">
                  {BillingAddress?.postalCode} {BillingAddress?.city}
                </span>
              </address>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 border-t border-zinc-200 py-10 text-sm">
          <div>
            <p className="font-medium text-zinc-900">Payment status</p>
            <p className="mt-2 text-zinc-700">Paid</p>
          </div>

          <div>
            <p className="font-medium text-zinc-900">Shipping method</p>
            <p className="mt-2 text-zinc-700">DHL, takes up to working days</p>
          </div>
        </div>
        <div className="space-y-6 border-t border-zinc-200 pt-10 text-sm">
          <div className="flex justify-between">
            <p className="font-medium text-zinc-900">Subtotal</p>
            <p className="text-zinc-700">{formatPrice(amount)}</p>
          </div>
          <div className="flex justify-between">
            <p className="font-medium text-zinc-900">Shipping</p>
            <p className="text-zinc-700">{formatPrice(0)}</p>
          </div>
          <div className="flex justify-between">
            <p className="font-medium text-zinc-900">Total</p>
            <p className="text-zinc-700">{formatPrice(amount)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
