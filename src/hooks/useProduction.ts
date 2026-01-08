import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useUpdateRawMaterialQuantity } from "./useRawMaterials";
import { useUpsertFinishedGood } from "./useFinishedGoods";

export interface ProductionRecord {
  id: string;
  raw_material_id: string;
  material_used: number;
  output_quantity: number;
  product_type: "Pashmina" | "Kerudung";
  created_at: string;
  raw_materials?: {
    name: string;
    color: string;
    unit: string;
  };
}

export interface CreateProductionInput {
  raw_material_id: string;
  material_used: number;
  output_quantity: number;
  product_type: "Pashmina" | "Kerudung";
  product_name: string;
  current_material_quantity: number;
}

export function useProductionRecords() {
  return useQuery({
    queryKey: ["production_records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("production_records")
        .select(`
          *,
          raw_materials (
            name,
            color,
            unit
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProductionRecord[];
    },
  });
}

export function useCreateProduction() {
  const queryClient = useQueryClient();
  const updateMaterial = useUpdateRawMaterialQuantity();
  const upsertFinishedGood = useUpsertFinishedGood();

  return useMutation({
    mutationFn: async (input: CreateProductionInput) => {
      const { 
        raw_material_id, 
        material_used, 
        output_quantity, 
        product_type,
        product_name,
        current_material_quantity 
      } = input;

      // Check if there's enough material
      if (material_used > current_material_quantity) {
        throw new Error("Insufficient raw material quantity");
      }

      // Create production record
      const { data, error } = await supabase
        .from("production_records")
        .insert({
          raw_material_id,
          material_used,
          output_quantity,
          product_type,
        })
        .select()
        .single();

      if (error) throw error;

      // Deduct from raw materials
      await updateMaterial.mutateAsync({
        id: raw_material_id,
        quantity: current_material_quantity - material_used,
      });

      // Add to finished goods
      await upsertFinishedGood.mutateAsync({
        name: product_name,
        product_type,
        quantityToAdd: output_quantity,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production_records"] });
      toast({
        title: "Success",
        description: "Production recorded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}