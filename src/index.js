const { registerBlockType } = wp.blocks;
const { useEffect, useState } = wp.element;
const { TextControl, PanelBody, RangeControl, SelectControl } = wp.components;
const { InspectorControls, useBlockProps } = wp.blockEditor;
const { __, sprintf } = wp.i18n;
const { format: dateFormat } = wp.date;

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
    sortBy: {
      type: "string",
      default: "filename",
    },
    sortDirection: {
      type: "string",
      default: "asc",
    },
    groupBy: {
      type: "string",
      default: "none",
    },
    accordionsOpen: {
      type: "boolean",
      default: true,
    },
  },

  edit: function (props) {
    const [pdfs, setPdfs] = useState([]);
    const { attributes, setAttributes } = props;
    const blockProps = useBlockProps();

    useEffect(() => {
      fetch(
        `/wp-json/pdf-gallery/v1/pdfs?tag=${attributes.tag}&sort_by=${attributes.sortBy}&sort_direction=${attributes.sortDirection}&group_by=${attributes.groupBy}`
      )
        .then((response) => response.json())
        .then((data) => setPdfs(data));
    }, [
      attributes.tag,
      attributes.sortBy,
      attributes.sortDirection,
      attributes.groupBy,
    ]);

    const renderGrid = (pdfList) => (
      <div className={`pdf-gallery-grid columns-${attributes.columns}`}>
        {pdfList.map((pdf) => (
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
              <span className={`pdf-name has-${attributes.fontSize}-font-size`}>
                {pdf.title}
              </span>
            </a>
          </div>
        ))}
      </div>
    );

    const renderContent = () => {
      if (attributes.groupBy === "none") {
        return renderGrid(pdfs);
      }

      // Group PDFs
      const groupedPdfs = {};
      pdfs.forEach((pdf) => {
        const date = new Date(pdf.date * 1000);
        let groupKey, groupLabel;

        switch (attributes.groupBy) {
          case "week":
            groupKey = `${date.getFullYear()}-${getWeekNumber(date)}`;
            groupLabel = wp.i18n.sprintf(
              /* translators: %1$s is the week number, %2$s is the year */
              wp.i18n.__("Week %1$s, %2$s", "pdf-gallery"),
              getWeekNumber(date),
              date.getFullYear()
            );
            break;
          case "month":
            groupKey = `${date.getFullYear()}-${date.getMonth()}`;
            // Using WordPress's date format settings
            groupLabel = wp.date.format(wp.i18n.__("F Y", "pdf-gallery"), date);
            break;
          case "year":
            groupKey = `${date.getFullYear()}`;
            groupLabel = date.getFullYear().toString();
            break;
        }

        if (!groupedPdfs[groupKey]) {
          groupedPdfs[groupKey] = {
            label: groupLabel,
            pdfs: [],
          };
        }
        groupedPdfs[groupKey].pdfs.push(pdf);
      });

      // Sort groups by key in reverse order
      return Object.entries(groupedPdfs)
        .sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
        .map(([key, group]) => (
          <details
            key={key}
            className="pdf-gallery-group"
            open={attributes.accordionsOpen}
          >
            <summary className="pdf-gallery-group-header">
              {group.label}
            </summary>
            {renderGrid(group.pdfs)}
          </details>
        ));
    };

    // Helper function to get week number
    const getWeekNumber = (date) => {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };

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
            <SelectControl
              label="Sort By"
              value={attributes.sortBy}
              options={[
                { label: "Filename", value: "filename" },
                { label: "Creation Date", value: "date" },
              ]}
              onChange={(sortBy) => setAttributes({ sortBy })}
            />
            <SelectControl
              label="Sort Direction"
              value={attributes.sortDirection}
              options={[
                { label: "Ascending", value: "asc" },
                { label: "Descending", value: "desc" },
              ]}
              onChange={(sortDirection) => setAttributes({ sortDirection })}
            />
            <SelectControl
              label="Group By"
              value={attributes.groupBy}
              options={[
                { label: "None", value: "none" },
                { label: "Week", value: "week" },
                { label: "Month", value: "month" },
                { label: "Year", value: "year" },
              ]}
              onChange={(groupBy) => setAttributes({ groupBy })}
            />
            {attributes.groupBy !== "none" && (
              <SelectControl
                label="Accordions Default State"
                value={attributes.accordionsOpen ? "true" : "false"}
                options={[
                  { label: "Open", value: "true" },
                  { label: "Closed", value: "false" },
                ]}
                onChange={(value) =>
                  setAttributes({ accordionsOpen: value === "true" })
                }
              />
            )}
          </PanelBody>
        </InspectorControls>
        <div {...blockProps}>{renderContent()}</div>
      </>
    );
  },

  save: function () {
    return null;
  },
});
