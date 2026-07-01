import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { CustomImage } from "../components/editor/CustomImage";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
  Underline,
  Link.configure({ openOnClick: false }),
  CustomImage.configure({ inline: true }),
  Table.configure({ resizable: true }),
  TableRow,
  TableCell,
  TableHeader,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Highlight,
];

export function downloadAsWord(title: string, sections: any[]) {
  // Generate HTML for each section and combine them
  const htmlParts = sections
    .sort((a, b) => a.order - b.order)
    .map(section => {
      let sectionHtml = "";
      if (section.content) {
        try {
          sectionHtml = generateHTML(section.content, extensions);
        } catch (err) {
          console.error("Error generating HTML for section", err);
        }
      }
      return `
        <div>
          <h2>${section.heading}</h2>
          ${sectionHtml}
        </div>
        <br style="page-break-before: always; clear: both" />
      `;
    });

  const fullHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; }
        h1, h2, h3, h4, h5, h6 { font-family: Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid #ddd; padding: 8px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <br style="page-break-before: always; clear: both" />
      ${htmlParts.join('')}
    </body>
    </html>
  `;

  // Create a Blob containing the HTML with the application/msword MIME type
  const blob = new Blob(['\\ufeff', fullHtml], {
    type: 'application/msword'
  });

  // Create a download link and trigger the download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title || 'Document'}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
