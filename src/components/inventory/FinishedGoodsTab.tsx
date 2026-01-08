import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFinishedGoods } from "@/hooks/useFinishedGoods";
import { format } from "date-fns";

export function FinishedGoodsTab() {
  const { data: goods, isLoading } = useFinishedGoods();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Finished Goods</h3>
        <p className="text-sm text-muted-foreground">
          View all produced Pashmina and Kerudung products
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : goods?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No finished goods yet. Record production to add products.
                </TableCell>
              </TableRow>
            ) : (
              goods?.map((good) => (
                <TableRow key={good.id}>
                  <TableCell className="font-medium">{good.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {good.product_type}
                    </span>
                  </TableCell>
                  <TableCell>{good.quantity} pcs</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(good.updated_at), "dd MMM yyyy")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}