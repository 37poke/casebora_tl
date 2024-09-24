"use server"
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OrderStatus } from "@prisma/client";

export const changeOrderStatus = async ({
  id,
  newStatus,
}: {
  id: string;
  newStatus: OrderStatus;
}) => {
  await db.order.update({
    where: {
      id: id,
    },
    data: {
      status: newStatus,
    },
  });
};

export async function getOrders() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

  // 如果不存在用户或者不是管理员
  if (!user || user.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized"); // 可以自定义处理错误
  }

  // 从数据库获取订单信息
  const orders = await db.order.findMany({
    where: {
      isPaid: true,
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      ShippingAddress: true,
    },
  });

  const lastWeekSum = await db.order.aggregate({
    where: {
      isPaid: true,
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    },
    _sum: {
      amount: true,
    },
  });

  const lastMonthSum = await db.order.aggregate({
    where: {
      isPaid: true,
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    },
    _sum: {
      amount: true,
    },
  });
  

  return {
    user,
    orders,
    lastWeekSum: lastWeekSum._sum.amount ?? 0,
    lastMonthSum: lastMonthSum._sum.amount ?? 0,
  };
}


