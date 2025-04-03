import { useState } from "react";
import * as XLSX from "xlsx";

export default function Home() {
  const [output, setOutput] = useState([]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const cleanedTables = json.map((row) => {
      const rawHtml = row[0];
      if (!rawHtml) return "";

      // <br> etiketlerini temizle
      const cleaned = rawHtml.replace(/<br>/g, "");

      // <th colspan="2"> başlığı yakala
      const headerMatch = cleaned.match(/<th colspan="2">(.*?)<\/th>/);
      const headerRow = headerMatch
        ? `<tr><th colspan="2">${headerMatch[1]}</th></tr>`
        : "";

      // <th colspan="2"> içerenleri dışarıda bırak
      const rows = [...cleaned.matchAll(/<th(?! colspan="2").*?<\/td>/g)].map(
        (match) => `<tr>${match[0]}</tr>`
      );

      return `<p><strong>Teknik Detaylar</strong></p>\n<table border="1" cellpadding="5">\n${headerRow}\n${rows.join(
        "\n"
      )}\n</table>`;
    });

    setOutput(cleanedTables);
  };

  const handleExportToExcel = () => {
    if (output.length === 0) {
      alert("Henüz dönüştürülmüş veri yok.");
      return;
    }

    const wsData = output.map((html) => [html]);
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DönüştürülmüşHTML");

    // Test amaçlı konsola yaz
    console.log("Excel dosyası indiriliyor...");
    XLSX.writeFile(workbook, "donusturulmus-html-tablosu.xlsx");
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">HTML Tablo Dönüştürücü</h1>

      <input type="file" accept=".xlsx" onChange={handleFileUpload} />

      {output.length > 0 && (
        <div className="space-y-4 mt-4">
          <button
            onClick={handleExportToExcel}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Excel Olarak İndir
          </button>

          {output.map((html, index) => (
            <textarea
              key={index}
              value={html}
              readOnly
              style={{
                width: "100%",
                height: "150px",
                fontFamily: "monospace",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
