<?php
/**
 * Plugin Name: PDF Gallery Block
 * Description: Adds a block to display PDF files in a grid
 * Version: 1.0
 * Author: Alexander Hörl
 */

if (!defined('ABSPATH')) {
    exit;
}

class PDFGalleryBlock {
    private $upload_dir;
    private $pdf_dir = 'pdf-gallery';
    private $thumbnail_dir = 'pdf-thumbnails';

    public function __construct() {
        $this->upload_dir = wp_upload_dir();
        
        // Create necessary directories
        wp_mkdir_p($this->upload_dir['basedir'] . '/' . $this->pdf_dir);
        wp_mkdir_p($this->upload_dir['basedir'] . '/' . $this->thumbnail_dir);

        add_action('init', array($this, 'register_block'));
        add_action('rest_api_init', array($this, 'register_rest_route'));
    }

    public function register_block() {
        wp_register_script(
            'pdf-gallery-block',
            plugins_url('build/index.js', __FILE__),
            array('wp-blocks', 'wp-element', 'wp-editor')
        );

        wp_register_style(
            'pdf-gallery-block',
            plugins_url('css/style.css', __FILE__),
            array()
        );

        register_block_type('pdf-gallery/main', array(
            'editor_script' => 'pdf-gallery-block',
            'editor_style' => 'pdf-gallery-block',
            'render_callback' => array($this, 'render_block')
        ));
    }

    public function register_rest_route() {
        register_rest_route('pdf-gallery/v1', '/pdfs', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_pdfs'),
            'permission_callback' => '__return_true'
        ));
    }

    public function get_pdfs() {
        $pdf_path = $this->upload_dir['basedir'] . '/' . $this->pdf_dir;
        $files = glob($pdf_path . '/*.pdf');
        $pdfs = array();

        foreach ($files as $file) {
            $filename = basename($file);
            $thumbnail = $this->generate_thumbnail($file, $filename);
            
            $pdfs[] = array(
                'name' => $filename,
                'url' => $this->upload_dir['baseurl'] . '/' . $this->pdf_dir . '/' . $filename,
                'thumbnail' => $thumbnail
            );
        }

        return $pdfs;
    }

    private function generate_thumbnail($pdf_path, $filename) {
        $thumbnail_path = $this->upload_dir['basedir'] . '/' . $this->thumbnail_dir . '/' . pathinfo($filename, PATHINFO_FILENAME) . '.jpg';
        $thumbnail_url = $this->upload_dir['baseurl'] . '/' . $this->thumbnail_dir . '/' . pathinfo($filename, PATHINFO_FILENAME) . '.jpg';

        if (!file_exists($thumbnail_path)) {
            try {
                if (class_exists('Imagick')) {
                    $imagick = new Imagick();
                    $imagick->setResolution(100, 100); // Lower resolution for better performance
                    $imagick->readImage($pdf_path . '[0]');
                    $imagick->setImageFormat('jpg');
                    $imagick->setImageBackgroundColor('white');
                    $imagick->mergeImageLayers(Imagick::LAYERMETHOD_FLATTEN);
                    $imagick->writeImage($thumbnail_path);
                    $imagick->clear();
                    $imagick->destroy();
                }
            } catch (ImagickException $e) {
                // If thumbnail generation fails, return a default PDF icon
                return plugins_url('assets/pdf-icon.png', __FILE__);
            }
        }

        return file_exists($thumbnail_path) ? $thumbnail_url : plugins_url('assets/pdf-icon.jpg', __FILE__);
    }

    public function render_block($attributes) {
        $pdfs = $this->get_pdfs();
        $output = '<div class="pdf-gallery-grid">';

        foreach ($pdfs as $pdf) {
            $output .= sprintf(
                '<div class="pdf-item">
                    <a href="%s" target="_blank">
                        <img src="%s" alt="%s">
                        <span class="pdf-name">%s</span>
                    </a>
                </div>',
                esc_url($pdf['url']),
                esc_url($pdf['thumbnail']),
                esc_attr($pdf['name']),
                esc_html($pdf['name'])
            );
        }

        $output .= '</div>';
        return $output;
    }
}

new PDFGalleryBlock();