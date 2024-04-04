import ProductHighlights from "@/components/product-highlights";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuroraBackground>
      {/* <main className="flex min-h-screen w-full items-center justify-center bg-background lg:bg-muted"> */}
      <div className="container relative w-auto flex-col items-center justify-center overflow-hidden rounded-lg bg-background/60 backdrop-blur-lg lg:mx-10 lg:grid-cols-2 lg:px-0 lg:shadow-md">
        {/* <ProductHighlights /> */}
        {children}
      </div>
      {/* </main> */}
    </AuroraBackground>
  );
}
