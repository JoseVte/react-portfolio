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
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $allowedIps = array_map('trim', explode(',', env('ALLOWED_IPS')));

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
