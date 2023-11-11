import React, { FC } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { DEFAULT_META, getCustomMeta } from "constants/meta";
import { helmetJsonLdProp } from "react-schemaorg";
import { Product, WithContext } from "schema-dts";

const PageMeta: FC<{ pageTitle?: string; schema?: WithContext<Product> }> = ({
  pageTitle,
  schema,
}) => {
  const { pathname } = useLocation();
  const pageMeta = getCustomMeta(pathname) || {};
  // eslint-disable-next-line prefer-const
  let { title, description, image } = { ...DEFAULT_META, ...pageMeta };
  const script = schema ? [helmetJsonLdProp<Product>(schema)] : [];
  if (pageTitle) {
    title = pageTitle;
  }

  return (
    <Helmet script={script}>
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Facebook Meta Tags  */}
      <meta property="og:url" content="https://winessy.com/" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={image} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter Meta Tags  */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:domain" content="winessy.com" />
      <meta property="twitter:url" content="https://winessy.com/" />
      <meta name="twitter:title" content={image} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

export default PageMeta;
