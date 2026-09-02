import { getCategoriesWithStats } from "@/actions/categories";
import { CategoryManagementClient } from "@/components/categories/CategoryManagementClient";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const data = await getCategoriesWithStats();

  return <CategoryManagementClient initialData={data} />;
}
