<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\IpUtils;
use Symfony\Component\HttpFoundation\Response;

class IpMiddleware
{
    /**
     * Restrict the route to the IP addresses listed in the `ALLOWED_IPS` environment variable.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($this->isAllowed($request), 401);

        return $next($request);
    }

    private function isAllowed(Request $request): bool
    {
        $allowedIps = collect(explode(',', (string) config('app.allowed-ips')))
            ->map(fn (string $ip): string => trim($ip))
            ->filter()
            ->all();

        if ($allowedIps === []) {
            return false;
        }

        foreach ($request->getClientIps() as $ip) {
            if (IpUtils::checkIp($ip, $allowedIps)) {
                return true;
            }
        }

        return false;
    }
}
