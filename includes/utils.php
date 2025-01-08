<?php

if (!defined('ABSPATH')) {
    exit;
}

class PDFGalleryUtils {
    /**
     * Extract date from filename
     * 
     * @param string $filename The filename to extract date from
     * @return int|false Timestamp if date found, false otherwise
     */
    public static function extract_date_from_filename($filename) {
        // Match common date formats in filenames
        $patterns = array(
            '/(\d{4})-(\d{2})-(\d{2})/', // matches 2024-05-01
            '/(\d{4})(\d{2})(\d{2})/',   // matches 20240501
            '/(\d{2})-(\d{2})-(\d{4})/'  // matches 01-05-2024
        );

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $filename, $matches)) {
                // Ensure year is in position 1
                if (strlen($matches[1]) == 4) {
                    return strtotime("{$matches[1]}-{$matches[2]}-{$matches[3]}");
                } else if (strlen($matches[3]) == 4) {
                    return strtotime("{$matches[3]}-{$matches[2]}-{$matches[1]}");
                }
            }
        }
        
        return false;
    }
} 