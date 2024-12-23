const { registerBlockType } = wp.blocks;
const { useEffect, useState } = wp.element;

registerBlockType("pdf-gallery/main", {
  title: "PDF Gallery",
  icon: "grid-view",
  category: "common",

  edit: function (props) {
    const [pdfs, setPdfs] = useState([]);

    useEffect(() => {
      fetch("/wp-json/pdf-gallery/v1/pdfs")
        .then((response) => response.json())
        .then((data) => setPdfs(data));
    }, []);

    return (
      <div className="pdf-gallery-grid">
        {pdfs.map((pdf) => (
          <div key={pdf.name} className="pdf-item">
            <a href={pdf.url} target="_blank">
              <img src={pdf.thumbnail} alt={pdf.name} />
              <span className="pdf-name">{pdf.name}</span>
            </a>
          </div>
        ))}
      </div>
    );
  },

  save: function () {
    return null; // Using dynamic rendering
  },
});
