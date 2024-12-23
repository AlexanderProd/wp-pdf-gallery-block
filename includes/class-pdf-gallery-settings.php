<?php

class PDFGallerySettings {
    private $options;

    public function __construct() {
        add_action('admin_menu', array($this, 'add_plugin_page'));
        add_action('admin_init', array($this, 'page_init'));
    }

    public function add_plugin_page() {
        add_options_page(
            'PDF Gallery Settings',
            'PDF Gallery',
            'manage_options',
            'pdf-gallery-settings',
            array($this, 'create_admin_page')
        );
    }

    public function create_admin_page() {
        $this->options = get_option('pdf_gallery_settings');
        ?>
        <div class="wrap">
            <h1>PDF Gallery Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('pdf_gallery_option_group');
                do_settings_sections('pdf-gallery-settings');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }

    public function page_init() {
        register_setting(
            'pdf_gallery_option_group',
            'pdf_gallery_settings',
            array($this, 'sanitize')
        );

        add_settings_section(
            'pdf_gallery_setting_section',
            'API Settings',
            array($this, 'section_info'),
            'pdf-gallery-settings'
        );

        add_settings_field(
            'pdfrest_api_key',
            'PDFRest API Key',
            array($this, 'pdfrest_api_key_callback'),
            'pdf-gallery-settings',
            'pdf_gallery_setting_section'
        );
    }

    public function sanitize($input) {
        $sanitary_values = array();
        if (isset($input['pdfrest_api_key'])) {
            $sanitary_values['pdfrest_api_key'] = sanitize_text_field($input['pdfrest_api_key']);
        }
        return $sanitary_values;
    }

    public function section_info() {
        echo 'Enter your PDFRest API key below:';
    }

    public function pdfrest_api_key_callback() {
        printf(
            '<input type="text" class="regular-text" id="pdfrest_api_key" name="pdf_gallery_settings[pdfrest_api_key]" value="%s">',
            isset($this->options['pdfrest_api_key']) ? esc_attr($this->options['pdfrest_api_key']) : ''
        );
    }
} 