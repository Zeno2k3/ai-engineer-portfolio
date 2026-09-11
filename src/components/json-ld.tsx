/** Chèn JSON-LD vào HTML. Ký tự "<" được escape thành mã unicode để nội dung không thể đóng thẻ <script> (chống XSS). */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
