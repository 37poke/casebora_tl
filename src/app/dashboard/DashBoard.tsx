"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import StatusDropdown from "./StatusDrodown";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "./action";

const DashBoard = () => {
  const { data } = useQuery({
    queryKey: ["getOrder"],
    queryFn: async () => await getOrders()
  });

  //如果没有订单
  if (data === undefined) {
    return (
      <div className="w-full mt-24 justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          <h3 className="font-semibold text-xl"> Loading your adminData</h3>
          <p>This won't take long.</p>
        </div>
      </div>
    );
  }
  //从后端获取订单信息
  const { user, orders, lastWeekSum, lastMonthSum } = data;
  console.log(data);
  
  //周目标
  const WEEKLY_GOAL = 500;
  //月目标
  const Month_GOAL = 2500; 
  console.log(user, process.env.RESEND_API_KEY);
  
  //如果不存在用户或者不是管理员
  if (!user || user.email !== "18679969688@163.com") {
    return notFound();
  }
  
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <div className="max-w-7xl w-full mx-auto flex flex-col sm:gap-4 sm: py-4">
        {/**周目标 */}
        <div className="flex flex-col gap-16">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Last Week</CardDescription>
                <CardTitle className="text-4xl">
                  {formatPrice(lastWeekSum ?? 0)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  of {formatPrice(WEEKLY_GOAL)} goal
                </div>
              </CardContent>
              <CardFooter>
                <Progress
                  value={((lastWeekSum ?? 0) * 100) / WEEKLY_GOAL}
                />
              </CardFooter>
            </Card>
            {/**月目标 */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Last Month</CardDescription>
                <CardTitle className="text-4xl">
                  {formatPrice(lastMonthSum ?? 0)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  of {formatPrice(Month_GOAL)} goal
                </div>
              </CardContent>
              <CardFooter>
                <Progress
                  value={((lastMonthSum ?? 0) * 100) / Month_GOAL}
                />
              </CardFooter>
            </Card>
          </div>
        </div>
        <div className="flex flex-col gap-16">
  
          <h1 className="text-4xl font-bold tracking-tight">
            Incoming orders
          </h1>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Customer
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  Status
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  Purchased date
                </TableHead>
                <TableHead className="text-right">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="bg-accent">
                  <TableCell>
                    <div className="font-medium">
                      {order.ShippingAddress?.name}
                    </div>
                    <div className="hidden text-sm text-muted-foregrounded md:inline">
                      {order.user.email}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <StatusDropdown id={order.id} orderStatus={order.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(order.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
