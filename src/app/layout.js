import './globals.css';

export const metadata = {
  title: 'Product Image Generator | Bulk Background Variations for Meesho',
  description:
    'Generate 100s of unique product image variations with different backgrounds instantly. Upload once, download all. Perfect for Meesho, Amazon, and e-commerce vendors.',
  keywords: 'meesho, product images, background generator, e-commerce, bulk images',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
