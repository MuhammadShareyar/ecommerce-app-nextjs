import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.actions";
import { Product } from "@/types/Product";

const HomePage = async () => {
  const products: Product[] = await getLatestProducts();

  return (
    <>
      <ProductList data={products} title="Newest Arrival" />
    </>
  );
};

export default HomePage;
