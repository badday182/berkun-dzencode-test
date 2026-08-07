import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {/* config options here */};

// Путь указан явно: по умолчанию плагин ищет `./i18n/request.ts` в корне,
// а у нас всё живёт под `src/`.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
