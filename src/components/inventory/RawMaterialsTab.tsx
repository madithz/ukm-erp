import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
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
  DialogTrigger,
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
import { useRawMaterials, useCreateRawMaterial, useDeleteRawMaterial, useUpdateRawMaterial, RawMaterial } from "@/hooks/useRawMaterials";
import { format } from "date-fns";

export function RawMaterialsTab() {
  const { data: materials, isLoading } = useRawMaterials();
  const createMaterial = useCreateRawMaterial();
  const deleteMaterial = useDeleteRawMaterial();
  const updateMaterial = useUpdateRawMaterial();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

  const [form, setForm] = useState({
    name: "",
    color: "",
    size_category: "",
    unit: "Meter" as "Meter" | "Yard",
    quantity: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    color: "",
    size_category: "",
    unit: "Meter" as "Meter" | "Yard",
    quantity: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMaterial.mutateAsync({
      ...form,
      quantity: parseFloat(form.quantity),
    });
    setForm({
      name: "",
      color: "",
      size_category: "",
      unit: "Meter",
      quantity: "",
    });
    setOpen(false);
  };

  const handleEdit = (material: RawMaterial) => {
    setEditingMaterial(material);
    setEditForm({
      name: material.name,
      color: material.color,
      size_category: material.size_category,
      unit: material.unit as "Meter" | "Yard",
      quantity: String(material.quantity),
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;
    
    await updateMaterial.mutateAsync({
      id: editingMaterial.id,
      ...editForm,
      quantity: parseFloat(editForm.quantity),
    });
    setEditOpen(false);
    setEditingMaterial(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Raw Materials</h3>
          <p className="text-sm text-muted-foreground">
            Manage incoming fabric stock
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Material
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Raw Material</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Material Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="e.g., Silk Fabric"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    placeholder="e.g., Navy Blue"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size_category">Size Category</Label>
                  <Input
                    id="size_category"
                    value={form.size_category}
                    onChange={(e) =>
                      setForm({ ...form, size_category: e.target.value })
                    }
                    placeholder="e.g., Standard, Large"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={form.unit}
                    onValueChange={(value: "Meter" | "Yard") =>
                      setForm({ ...form, unit: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Meter">Meter</SelectItem>
                      <SelectItem value="Yard">Yard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createMaterial.isPending}
              >
                {createMaterial.isPending ? "Adding..." : "Add Material"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Raw Material</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Material Name</Label>
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
                <Label htmlFor="edit-color">Color</Label>
                <Input
                  id="edit-color"
                  value={editForm.color}
                  onChange={(e) =>
                    setEditForm({ ...editForm, color: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-size_category">Size Category</Label>
                <Input
                  id="edit-size_category"
                  value={editForm.size_category}
                  onChange={(e) =>
                    setEditForm({ ...editForm, size_category: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unit</Label>
                <Select
                  value={editForm.unit}
                  onValueChange={(value: "Meter" | "Yard") =>
                    setEditForm({ ...editForm, unit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Meter">Meter</SelectItem>
                    <SelectItem value="Yard">Yard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
                type="number"
                step="0.01"
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
              disabled={updateMaterial.isPending}
            >
              {updateMaterial.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Size Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : materials?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No raw materials yet. Add your first material above.
                </TableCell>
              </TableRow>
            ) : (
              materials?.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>{material.color}</TableCell>
                  <TableCell>{material.size_category}</TableCell>
                  <TableCell>
                    {Number(material.quantity).toLocaleString()} {material.unit}s
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(material.created_at), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEdit(material)}
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
                            <AlertDialogTitle>Delete Material</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{material.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMaterial.mutate(material.id)}
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
