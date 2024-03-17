const ProductHighlights = () => {
  return (
    <div className="relative hidden h-full flex-col border-r p-10 text-primary-foreground lg:flex">
      <div className="absolute inset-0 bg-primary" />
      <div className="relative z-20 flex items-center text-lg font-medium">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-6 w-6"
        >
          <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
        </svg>
        InnovatEd Inc.
      </div>
      <div className="relative z-20 mt-auto">
        <blockquote className="space-y-2">
          <p className="text-lg">
            &ldquo;This product has helped me to deliver stunning designs to my
            clients faster than ever before.&rdquo;
          </p>
          <footer className="text-sm">Sofia Davis</footer>
        </blockquote>
      </div>
    </div>
  );
};

export default ProductHighlights;
