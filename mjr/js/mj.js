const { data: products, error } = await supabase
  .from("products")
  .select("id, name, description, price, stock, image_url")
  .eq("published", true)
  .order("created_at", { ascending: false });

if (error) throw error;
