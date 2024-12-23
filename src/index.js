const { registerBlockType } = wp.blocks;
const { useEffect, useState } = wp.element;
const { TextControl, PanelBody, RangeControl, SelectControl } = wp.components;
const { InspectorControls, useBlockProps } = wp.blockEditor;

registerBlockType("pdf-gallery/main", {
  title: "PDF Gallery",
  icon: "grid-view",
  category: "common",

  attributes: {
    tag: {
      type: "string",
      default: "",
    },
    columns: {
      type: "number",
      default: 3,
    },
    imageFit: {
      type: "string",
      default: "cover",
    },
    fontSize: {
      type: "string",
      default: "normal",
    },
    imageWidth: {
      type: "number",
      default: 0,
    },
    imageHeight: {
      type: "number",
      default: 200,
    },
  },

  edit: function (props) {
    const [pdfs, setPdfs] = useState([]);
    const { attributes, setAttributes } = props;
    const blockProps = useBlockProps({
      className: `pdf-gallery-grid columns-${attributes.columns}`,
    });

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
            <RangeControl
              label="Columns"
              value={attributes.columns}
              onChange={(columns) => setAttributes({ columns })}
              min={1}
              max={6}
            />
            <SelectControl
              label="Image Fit"
              value={attributes.imageFit}
              options={[
                { label: "Cover", value: "cover" },
                { label: "Contain", value: "contain" },
                { label: "Fill", value: "fill" },
              ]}
              onChange={(imageFit) => setAttributes({ imageFit })}
            />
            <SelectControl
              label="Title Font Size"
              value={attributes.fontSize}
              options={[
                { label: "Small", value: "small" },
                { label: "Normal", value: "normal" },
                { label: "Large", value: "large" },
              ]}
              onChange={(fontSize) => setAttributes({ fontSize })}
            />
            <RangeControl
              label="Image Width (px)"
              value={attributes.imageWidth}
              onChange={(imageWidth) => setAttributes({ imageWidth })}
              min={0}
              max={1000}
              help="Set to 0 for auto width"
            />
            <RangeControl
              label="Image Height (px)"
              value={attributes.imageHeight}
              onChange={(imageHeight) => setAttributes({ imageHeight })}
              min={0}
              max={1000}
              help="Set to 0 for auto height"
            />
          </PanelBody>
        </InspectorControls>
        <div {...blockProps}>
          {pdfs.map((pdf) => (
            <div key={pdf.name} className="pdf-item">
              <a href={pdf.url} target="_blank">
                <img
                  src={pdf.thumbnail}
                  alt={pdf.title}
                  style={{
                    objectFit: attributes.imageFit,
                    width: attributes.imageWidth
                      ? `${attributes.imageWidth}px`
                      : "100%",
                    height: attributes.imageHeight
                      ? `${attributes.imageHeight}px`
                      : "auto",
                  }}
                />
                <span
                  className={`pdf-name has-${attributes.fontSize}-font-size`}
                >
                  {pdf.title}
                </span>
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
