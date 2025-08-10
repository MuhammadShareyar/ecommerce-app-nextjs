import ProductList from "@/components/shared/product/product-list";
import sampleData from "@/sample-data";

const HomePage = () => {
  return (
    <>
      <ProductList data={sampleData.products} title="new arrival" limit={6}/>
    </>
  );
};

export default HomePage;
