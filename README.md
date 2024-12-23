# PDF Gallery Block - WordPress Plugin

## Description

This WordPress plugin creates a custom block that displays PDF files in a responsive grid layout. Each PDF is shown with a thumbnail preview (generated from its first page) and a download link.

## Requirements

- WordPress 5.0 or higher
- PHP 7.0 or higher
- ImageMagick PHP extension
- Write permissions in the WordPress upload directory

## Installation

1. Create Plugin Directory
   Create the following directory structure in your WordPress installation:

```
wp-content/plugins/pdf-gallery-block/
├── pdf-gallery-block.php
├── css/
│   └── style.css
└── build/
    └── index.js
```

2. Upload Files

1. Copy the main plugin file `pdf-gallery-block.php` to the plugin directory
1. Create a `css` folder and copy `style.css` into it
1. Create a `build` folder and copy `index.js` into it

### 3. Create Required Directories

Create two directories in your WordPress uploads folder:

```
wp-content/uploads/pdf-gallery/      # For storing PDF files
wp-content/uploads/pdf-thumbnails/   # For storing generated thumbnails
```

4. Set Permissions
   Ensure booth directories have the necessary write permissions in the WordPress upload directory.

```bash
chmod 755 wp-content/uploads/pdf-gallery
chmod 755 wp-content/uploads/pdf-thumbnails
```

5. Activate the Plugin
   Navigate to the WordPress admin dashboard, go to Plugins > Installed Plugins, and activate the "PDF Gallery Block" plugin.

## Usage

To use the PDF Gallery Block, add it to any post or page where you want to display the PDF gallery.

## Customization

You can customize the block's appearance and behavior by editing the `style.css` file in the `css` directory.

## Troubleshooting

### Thumbnail Generation Not Working

- Verify ImageMagick is installed:

```php
<?php echo exec('convert -version'); ?>
```

or

```php
<?php phpinfo(); ?>
```

- Check directory permissions
- Ensure PHP has enough memory allocated for thumbnail generation

### ImageMagick PDF Security Policy

If you're seeing an error like "attempt to perform an operation not allowed by the security policy `PDF'", this is due to ImageMagick's security settings. You have two options:

1. **Default Setup (Recommended)**
   The plugin will automatically fall back to using a generic PDF icon if thumbnail generation fails. No action required.

2. **Enable PDF Processing in ImageMagick**
   If you have server access and want actual PDF thumbnails, you can modify ImageMagick's policy:
   - Locate the policy file (usually at `/etc/ImageMagick-6/policy.xml` or `/etc/ImageMagick-7/policy.xml`)
   - Find: `<policy domain="coder" rights="none" pattern="PDF" />`
   - Change to: `<policy domain="coder" rights="read|write" pattern="PDF" />`
   - Restart your web server

## Development

For developers who want to modify the JavaScript code, you'll need to set up the development environment:

1. Install Node.js
2. Run npm commands

```bash
npm install
npm run build
```
