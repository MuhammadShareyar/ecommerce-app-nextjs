import { auth } from "@/auth";
import { deleteOrder, getAllOrders } from "@/lib/actions/order.actions";
import { Metadata } from "next";
import Pagination from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/shared/delete-dialog";

interface Props {
  page: string;
}

export const metadata: Metadata = {
  title: "Admin Orders",
};

const AdminOrdersPage = async (props: { searchParams: Promise<Props> }) => {
  const params = await props.searchParams;
  const page = Number(params.page) || 1;
  const session = await auth();

  if (session?.user?.role !== "admin")
    throw new Error("User is not authorized");

  const orders = await getAllOrders({ page });

  return (
    <div className="space-y-2">
      <h2 className="h2-bold">Orders</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead>TOTAL</TableHead>
              <TableHead>PAID</TableHead>
              <TableHead>DELIVERED</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{formatId(order.id)}</TableCell>
                <TableCell> {formatCurrency(order.totalPrice)}</TableCell>
                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                <TableCell>
                  {order.isPaid && order.paidAt ? (
                    formatDateTime(order.paidAt).dateTime
                  ) : (
                    <Badge variant="destructive"> Not paid </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {order.isDelivered && order.deliveredAt ? (
                    formatDateTime(order.deliveredAt).dateTime
                  ) : (
                    <Badge variant="destructive"> Not Delivered </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/order/${order.id}`}>Details</Link>
                  </Button>
                  <DeleteDialog id={order.id} action={deleteOrder} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {orders.totalPages > 1 && (
          <Pagination page={page} totalPages={orders.totalPages} />
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
