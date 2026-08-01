interface CardPlaceholderProps {
  /** Высота заглушки в пикселях. По умолчанию совпадает с высотой карточки заказа. */
  height?: number;
}

const CardPlaceholder: React.FC<CardPlaceholderProps> = ({ height = 85 }) => {
  return (
    <div
      className="card shadow-sm flex-grow-1 w-100 placeholder-glow"
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      <div className="placeholder h-100"></div>
    </div>
  );
};

export default CardPlaceholder;
