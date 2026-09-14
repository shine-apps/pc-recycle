// 微信分享缩略图兜底：当页面没有 ≥300×300 的 JPG/PNG 主图时，
// 用移出视口（而非 display:none）的方式让微信爬虫抓到默认分享图。
// 无 hook、无 "use client"，在服务端组件与客户端页面中都会直出到 HTML。
export default function ShareFallbackImage() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/share-logo.png"
      width={300}
      height={300}
      alt=""
      aria-hidden="true"
      style={{ position: "absolute", left: "-9999px", top: 0 }}
    />
  );
}
