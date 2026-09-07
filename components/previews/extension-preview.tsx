export default function ExtensionPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-bg2 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <img
        src="/previews/extension.jpg"
        alt="Pratinjau ReadZhongwen Chrome Extension"
        className="h-auto w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
