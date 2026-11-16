import { createFileRoute } from "@tanstack/react-router";
import { MarketingGenerator } from '@/components/marketing-generator';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pablinho Espetinhos | Cardápio e pedidos" },
      { name: "description", content: "BRASA BOA, BRASA FORTE. Confira os 27 produtos do Pablinho Espetinhos e monte seu pedido para retirada ou entrega pelo WhatsApp." },
      { property: "og:title", content: "Pablinho Espetinhos | Cardápio" },
      { property: "og:description", content: "Espetos, combos, adicionais e bebidas. Monte seu pedido e envie pelo WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <><iframe
      title="Cardápio Pablinho Espetinhos"
      src="/catalogo/pablinho.html"
      className="catalog-frame"
    /><MarketingGenerator /></>
  );
}
