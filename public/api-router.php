<?php
/**
 * API Router for Port 6000 (API Only)
 * Handles only /public/api/* routes, returns 404 for non-API paths
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Allow only /public/api/* routes
if (str_starts_with($uri, '/public/api/')) {
    // Let Laravel handle the API request
    require __DIR__ . '/../public/index.php';
} elseif (str_starts_with($uri, '/api/')) {
    // Also handle /api/* (without /public) - redirect or handle
    require __DIR__ . '/../public/index.php';
} else {
    // Return 404 for non-API routes
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Not Found',
        'message' => 'This is an API-only server. Use /public/api/* endpoints.',
        'available_endpoints' => '/public/api/v1/login, /public/api/v1/detections, etc.'
    ]);
    exit;
}