import { useState } from "react";

const SelectCustom = ({ products, onTypeChange }) => {
  const [selectedType, setSelectedType] = useState("all");

  // Get unique product types
  const productTypes = products
    ? ["all", ...new Set(products.map((product) => product.type))]
    : ["all"];

  const handleTypeChange = (event) => {
    const newType = event.target.value;
    setSelectedType(newType);
    // Call the parent component's callback with the new type
    if (onTypeChange) {
      onTypeChange(newType);
    }
  };

  return (
    <select
      className="form-select"
      aria-label="Filter products by type"
      value={selectedType}
      onChange={handleTypeChange}
    >
      <option value="all">Все типы</option>
      {productTypes
        .filter((type) => type !== "all")
        .map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
    </select>
  );
};

export default SelectCustom;
