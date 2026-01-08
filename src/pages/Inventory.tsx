import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RawMaterialsTab } from "@/components/inventory/RawMaterialsTab";
import { ProductionTab } from "@/components/inventory/ProductionTab";
import { FinishedGoodsTab } from "@/components/inventory/FinishedGoodsTab";

export default function Inventory() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Inventory Management</h1>
        <p className="page-description">
          Track raw materials, production, and finished goods
        </p>
      </div>

      <Tabs defaultValue="raw-materials" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="raw-materials">Raw Materials</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="finished-goods">Finished Goods</TabsTrigger>
        </TabsList>
        <TabsContent value="raw-materials" className="animate-fade-in">
          <RawMaterialsTab />
        </TabsContent>
        <TabsContent value="production" className="animate-fade-in">
          <ProductionTab />
        </TabsContent>
        <TabsContent value="finished-goods" className="animate-fade-in">
          <FinishedGoodsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}