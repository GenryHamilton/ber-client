import React from 'react';
import { AuthProvider } from '../hooks/useAuth';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';

const RootLayout = ({ children }) => {
  return (
    <html lang={i18n.language || 'en'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Axion Casino</title>
        <meta name="description" content="Premium Online Casino" />
      </head>
      <body>
        <I18nextProvider i18n={i18n}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </I18nextProvider>
      </body>
    </html>
  );
};

export default RootLayout;


