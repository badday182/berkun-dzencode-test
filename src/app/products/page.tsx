import ProductsView from "@/components/productsView";
import StoreHydrator from "@/components/storeHydrator";
import { loadProducts } from "@/services/serverData";

/**
 * Серверный компонент: каталог загружается до отправки разметки.
 *
 * Приходы этой странице не нужны — она показывает плоский список, а название
 * прихода в карточке подтянется из стора, если пользователь до этого заходил
 * на `/orders`.
 */
export default async function ProductsPage() {
  const { products } = await loadProducts();

  return (
    <>
      <StoreHydrator products={products} />
      <ProductsView />
    </>
  );
}
