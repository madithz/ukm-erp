import { useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFinishedGoods, useDeleteFinishedGood, useUpdateFinishedGood, FinishedGood } from "@/hooks/useFinishedGoods";
import { format } from "date-fns";

export function FinishedGoodsTab() {
  const { data: goods, isLoading } = useFinishedGoods();
  const deleteGood = useDeleteFinishedGood();
  const updateGood = useUpdateFinishedGood();
  const [editOpen, setEditOpen] = useState(false);
  const [editingGood, setEditingGood] = useState<FinishedGood | null>(null);

  const [editForm, setEditForm] = useState({
    name: "",
    product_type: "Pashmina" as "Pashmina" | "Kerudung",
    quantity: "",
  });

  const handleEdit = (good: FinishedGood) => {
    setEditingGood(good);
    setEditForm({
      name: good.name,
      product_type: good.product_type as "Pashmina" | "Kerudung",
      quantity: String(good.quantity),
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGood) return;
    
    await updateGood.mutateAsync({
      id: editingGood.id,
      ...editForm,
      quantity: parseInt(editForm.quantity),
    });
    setEditOpen(false);
    setEditingGood(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Finished Goods</h3>
        <p className="text-sm text-muted-foreground">
          View all produced Pashmina and Kerudung products
        </p>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Finished Good</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Product Type</Label>
              <Select
                value={editForm.product_type}
                onValueChange={(value: "Pashmina" | "Kerudung") =>
                  setEditForm({ ...editForm, product_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pashmina">Pashmina</SelectItem>
                  <SelectItem value="Kerudung">Kerudung</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
                type="number"
                min="0"
                value={editForm.quantity}
                onChange={(e) =>
                  setEditForm({ ...editForm, quantity: e.target.value })
                }
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={updateGood.isPending}
            >
              {updateGood.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : goods?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEdit(good)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{good.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteGood.mutate(good.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
