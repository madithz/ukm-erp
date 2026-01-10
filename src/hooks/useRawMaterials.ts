import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface RawMaterial {
  id: string;
  name: string;
  color: string;
  size_category: string;
  unit: "Meter" | "Yard";
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRawMaterialInput {
  name: string;
  color: string;
  size_category: string;
  unit: "Meter" | "Yard";
  quantity: number;
}

export function useRawMaterials() {
  return useQuery({
    queryKey: ["raw_materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("raw_materials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as RawMaterial[];
    },
  });
}

export function useCreateRawMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRawMaterialInput) => {
      const { data, error } = await supabase
        .from("raw_materials")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raw_materials"] });
      toast({
        title: "Success",
        description: "Raw material added successfully",
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

export function useUpdateRawMaterialQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data, error } = await supabase
        .from("raw_materials")
        .update({ quantity })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raw_materials"] });
    },
  });
}

export function useUpdateRawMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      name, 
      color, 
      size_category, 
      unit, 
      quantity 
    }: { 
      id: string; 
      name: string; 
      color: string; 
      size_category: string; 
      unit: "Meter" | "Yard"; 
      quantity: number;
    }) => {
      const { data, error } = await supabase
        .from("raw_materials")
        .update({ name, color, size_category, unit, quantity })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raw_materials"] });
      toast({
        title: "Success",
        description: "Raw material updated successfully",
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

export function useDeleteRawMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("raw_materials")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raw_materials"] });
      toast({
        title: "Success",
        description: "Raw material deleted successfully",
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