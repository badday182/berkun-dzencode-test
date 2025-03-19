import ProductsCard from "@/components/productsCard";

const Products = () => {
  return (
    <div className="container">
      <h1 className="mb-4">Products</h1>
      <div className="container mt-3 d-flex flex-row">
        <ProductsCard />
      </div>
    </div>
  );
};

export default Products;
