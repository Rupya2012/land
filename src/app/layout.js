import "./globals.css";

export const metadata = {
  title: "glTF Viewer",
  description: "Drag-and-drop preview tool for glTF 2.0 3D models.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="author" content="Don McCurdy" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
