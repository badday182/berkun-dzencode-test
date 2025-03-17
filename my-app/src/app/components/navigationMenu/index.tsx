"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NavigationMenu = () => {
  const pathname = usePathname();
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link
              className={clsx("nav-link", { active: pathname === "/products" })}
              href="products"
            >
              Products
            </Link>
          </li>
          <li>
            <Link
              className={clsx("nav-link", { active: pathname === "/orders" })}
              href="orders"
            >
              Orders
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavigationMenu;
