<?php
declare(strict_types=1);

// Supply lowercase header names and secrets selected by the receiving route.
function verifyAssignWebhook(string $rawBody, array $headers, array $secrets, ?int $now = null): array
{
    $id = $headers['webhook-id'] ?? '';
    $timestamp = $headers['webhook-timestamp'] ?? '';
    $signatures = $headers['webhook-signature'] ?? '';
    if (strlen($rawBody) > 8192 || !is_string($id) || !is_string($timestamp) || !is_string($signatures)
        || preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/D', $id) !== 1
        || preg_match('/^[0-9]{1,12}$/D', $timestamp) !== 1 || strlen($signatures) > 1024
        || abs(($now ?? time()) - (int) $timestamp) > 300) {
        throw new RuntimeException('Invalid webhook metadata or timestamp');
    }
    if (count($secrets) < 1 || count($secrets) > 2) {
        throw new RuntimeException('Configure current signing secrets');
    }
    $valid = false;
    foreach ($secrets as $secret) {
        if (!is_string($secret) || preg_match('/^whsec_[A-Za-z0-9+\/]{43}=$/D', $secret) !== 1) {
            throw new RuntimeException('Invalid signing secret');
        }
        $key = base64_decode(substr($secret, 6), true);
        $expected = hash_hmac('sha256', $id . '.' . $timestamp . '.' . $rawBody, $key, true);
        foreach (explode(' ', $signatures) as $signature) {
            if (preg_match('/^v1,[A-Za-z0-9+\/]{43}=$/D', $signature) === 1) {
                $candidate = base64_decode(substr($signature, 3), true);
                $valid = hash_equals($expected, $candidate) || $valid;
            }
        }
    }
    if (!$valid) {
        throw new RuntimeException('Invalid webhook signature');
    }
    $event = json_decode($rawBody, true, 32, JSON_THROW_ON_ERROR);
    if (!is_array($event) || ($event['delivery_id'] ?? null) !== $id) {
        throw new RuntimeException('Webhook delivery identity mismatch');
    }
    return $event;
}
