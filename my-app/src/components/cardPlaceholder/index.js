const CardPlaceholder = () => {
  return (
    <div
      className={`card shadow-sm flex-grow-1 w-100 placeholder-glow`}
      style={{ height: "85px" }}
    >
      <div className="placeholder h-100"></div>
    </div>
  );
};

export default CardPlaceholder;
