import React from 'react';
import { AuthProvider } from '../hooks/useAuth';

const RootLayout = ({ children }) => {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Axion Casino</title>
        <meta name="description" content="Премиальное онлайн казино" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;


