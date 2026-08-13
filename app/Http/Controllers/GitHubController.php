<?php

namespace App\Http\Controllers;

use App\Services\GitHubService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GitHubController extends Controller
{
    public function __invoke(Request $request, GitHubService $githubService): JsonResponse
    {
        $page = $request->integer('page', 1);
        $preview = $request->boolean('preview');

        return response()->json($githubService->getRepositories($page, $preview));
    }
}
