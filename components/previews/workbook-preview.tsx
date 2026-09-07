export default function WorkbookPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-bg2 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <img
        src="/previews/workbook.png"
        alt="Pratinjau Writing Workbook PDF"
        className="h-auto w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
