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
import { useRawMaterials } from "@/hooks/useRawMaterials";
import { useProductionRecords, useCreateProduction } from "@/hooks/useProduction";
import { format } from "date-fns";

export function ProductionTab() {
  const { data: materials } = useRawMaterials();
  const { data: records, isLoading } = useProductionRecords();
  const createProduction = useCreateProduction();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    raw_material_id: "",
    material_used: "",
    output_quantity: "",
    product_type: "Pashmina" as "Pashmina" | "Kerudung",
    product_name: "",
  });

  const selectedMaterial = materials?.find((m) => m.id === form.raw_material_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    await createProduction.mutateAsync({
      raw_material_id: form.raw_material_id,
      material_used: parseFloat(form.material_used),
      output_quantity: parseInt(form.output_quantity),
      product_type: form.product_type,
      product_name: form.product_name,
      current_material_quantity: Number(selectedMaterial.quantity),
    });
    
    setForm({
      raw_material_id: "",
      material_used: "",
      output_quantity: "",
      product_type: "Pashmina",
      product_name: "",
    });
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Production</h3>
          <p className="text-sm text-muted-foreground">
            Record production and convert raw materials to finished goods
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Record Production
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Production</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Raw Material</Label>
                <Select
                  value={form.raw_material_id}
                  onValueChange={(value) =>
                    setForm({ ...form, raw_material_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose material..." />
                  </SelectTrigger>
                  <SelectContent>
                    {materials?.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} - {m.color} ({Number(m.quantity).toLocaleString()} {m.unit}s available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="material_used">
                  Material Used {selectedMaterial && `(${selectedMaterial.unit}s)`}
                </Label>
                <Input
                  id="material_used"
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedMaterial?.quantity}
                  value={form.material_used}
                  onChange={(e) =>
                    setForm({ ...form, material_used: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
                {selectedMaterial && (
                  <p className="text-xs text-muted-foreground">
                    Available: {Number(selectedMaterial.quantity).toLocaleString()} {selectedMaterial.unit}s
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_type">Product Type</Label>
                  <Select
                    value={form.product_type}
                    onValueChange={(value: "Pashmina" | "Kerudung") =>
                      setForm({ ...form, product_type: value })
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
                  <Label htmlFor="output_quantity">Output Quantity</Label>
                  <Input
                    id="output_quantity"
                    type="number"
                    min="1"
                    value={form.output_quantity}
                    onChange={(e) =>
                      setForm({ ...form, output_quantity: e.target.value })
                    }
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_name">Product Name</Label>
                <Input
                  id="product_name"
                  value={form.product_name}
                  onChange={(e) =>
                    setForm({ ...form, product_name: e.target.value })
                  }
                  placeholder="e.g., Navy Silk Pashmina"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createProduction.isPending || !selectedMaterial}
              >
                {createProduction.isPending ? "Recording..." : "Record Production"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Material Used</TableHead>
              <TableHead>Quantity Used</TableHead>
              <TableHead>Product Type</TableHead>
              <TableHead>Output Qty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : records?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No production records yet. Start recording production above.
                </TableCell>
              </TableRow>
            ) : (
              records?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {format(new Date(record.created_at), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {record.raw_materials?.name} - {record.raw_materials?.color}
                  </TableCell>
                  <TableCell>
                    {Number(record.material_used).toLocaleString()} {record.raw_materials?.unit}s
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {record.product_type}
                    </span>
                  </TableCell>
                  <TableCell>{record.output_quantity} pcs</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}