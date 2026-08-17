type JsonLdPrimitive = string | number | boolean | null;
export type JsonLdValue =
  JsonLdPrimitive | readonly JsonLdValue[] | { readonly [key: string]: JsonLdValue };

interface JsonLdProps {
  data: JsonLdValue;
}

/**
 * Serializes structured data without allowing a `<` sequence to terminate the
 * script element. Callers remain responsible for supplying a valid schema.org
 * object.
 */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
