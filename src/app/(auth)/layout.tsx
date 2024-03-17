import ProductHighlights from "@/components/product-highlights";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background lg:bg-muted">
      <div className="container relative grid h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background lg:mx-10 lg:grid-cols-2 lg:px-0 lg:shadow-md xl:mx-0 xl:max-w-[1280px] 2xl:max-w-[1536px]">
        <ProductHighlights />
        {children}
      </div>
    </main>
  );
}
