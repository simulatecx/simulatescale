// pages/_document.js

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
        {/* This empty div is the target for our modal portal. */}
        <div id="modal-root"></div>
      </body>
    </Html>
  );
}