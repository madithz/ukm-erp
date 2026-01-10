import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FinishedGood {
  id: string;
  name: string;
  product_type: "Pashmina" | "Kerudung";
  quantity: number;
  created_at: string;
  updated_at: string;
}

export function useFinishedGoods() {
  return useQuery({
    queryKey: ["finished_goods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("finished_goods")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FinishedGood[];
    },
  });
}

export function useUpsertFinishedGood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      name, 
      product_type, 
      quantityToAdd 
    }: { 
      name: string; 
      product_type: "Pashmina" | "Kerudung"; 
      quantityToAdd: number;
    }) => {
      // First check if the product already exists
      const { data: existing } = await supabase
        .from("finished_goods")
        .select("*")
        .eq("name", name)
        .eq("product_type", product_type)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("finished_goods")
          .update({ quantity: existing.quantity + quantityToAdd })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("finished_goods")
          .insert({ name, product_type, quantity: quantityToAdd })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finished_goods"] });
    },
  });
}

export function useDeleteFinishedGood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("finished_goods")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finished_goods"] });
    },
  });
}