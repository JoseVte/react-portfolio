<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\IpUtils;

class IpMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): mixed
    {
        $allowedIps = array_map('trim', explode(',', config('app.allowed-ips')));

        $checkIp = false;
        foreach ($request->getClientIps() as $ip) {
            if (! $checkIp && IpUtils::checkIp($ip, $allowedIps)) {
                $checkIp = true;
            }
        }

        if (! $checkIp) {
            abort(401);
        }

        return $next($request);
    }
}
