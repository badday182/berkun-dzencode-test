import Link from "next/link";

const NavigationMenu = () => {
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link className="nav-link" href="products">
              Products
            </Link>
          </li>
          <li>
            <Link className="nav-link" href="orders">
              Orders
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavigationMenu;
