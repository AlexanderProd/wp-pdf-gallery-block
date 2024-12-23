const { registerBlockType } = wp.blocks;
const { useEffect, useState } = wp.element;
const { TextControl } = wp.components;
const { InspectorControls } = wp.blockEditor;
const { PanelBody } = wp.components;

registerBlockType("pdf-gallery/main", {
  title: "PDF Gallery",
  icon: "grid-view",
  category: "common",

  attributes: {
    tag: {
      type: "string",
      default: "",
    },
  },

  edit: function (props) {
    const [pdfs, setPdfs] = useState([]);
    const { attributes, setAttributes } = props;

    useEffect(() => {
      fetch(`/wp-json/pdf-gallery/v1/pdfs?tag=${attributes.tag}`)
        .then((response) => response.json())
        .then((data) => setPdfs(data));
    }, [attributes.tag]);

    return (
      <>
        <InspectorControls>
          <PanelBody title="Gallery Settings">
            <TextControl
              label="Filter by tag"
              value={attributes.tag}
              onChange={(tag) => setAttributes({ tag })}
              help="Enter a tag to filter PDFs. Leave empty to show all PDFs."
            />
          </PanelBody>
        </InspectorControls>
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
      </>
    );
  },

  save: function () {
    return null;
  },
});
