<?php

class PDFRestAPI {
    private $api_key;
    private $api_url = 'https://api.pdfrest.com/jpg';

    public function __construct() {
        $options = get_option('pdf_gallery_settings');
        $this->api_key = isset($options['pdfrest_api_key']) ? $options['pdfrest_api_key'] : '';
    }

    public function generate_thumbnail($pdf_path, $output_path) {
        if (empty($this->api_key)) {
            return false;
        }

        $curl = curl_init();

        $post_fields = array(
            'file' => new CURLFile($pdf_path),
            'output' => basename($output_path, '.jpg')
        );

        curl_setopt_array($curl, array(
            CURLOPT_URL => $this->api_url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => $post_fields,
            CURLOPT_HTTPHEADER => array(
                'Accept: application/json',
                'Api-Key: ' . $this->api_key
            ),
        ));

        $response = curl_exec($curl);
        $err = curl_error($curl);
        curl_close($curl);

        if ($err) {
            return false;
        }

        $result = json_decode($response, true);
        if (isset($result['url'])) {
            // Download the generated image
            $image_data = file_get_contents($result['url']);
            if ($image_data !== false) {
                return file_put_contents($output_path, $image_data) !== false;
            }
        }

        return false;
    }
} 