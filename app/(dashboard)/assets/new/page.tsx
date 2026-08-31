import { getCategories } from "@/actions/assets";
import { AssetForm } from "@/components/assets/AssetForm";

export const dynamic = "force-dynamic";

export default async function NewAssetPage() {
  const categories = await getCategories();

  return <AssetForm categories={categories} mode="create" />;
}
