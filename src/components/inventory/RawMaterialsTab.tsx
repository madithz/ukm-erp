import { useState } from "react";
import { Plus } from "lucide-react";
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
import { useRawMaterials, useCreateRawMaterial } from "@/hooks/useRawMaterials";
import { format } from "date-fns";

export function RawMaterialsTab() {
  const { data: materials, isLoading } = useRawMaterials();
  const createMaterial = useCreateRawMaterial();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
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

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Size Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : materials?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}