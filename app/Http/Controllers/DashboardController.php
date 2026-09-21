<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today = now()->toDateString();
        $startOfMonth = now()->startOfMonth()->toDateString();
        $endOfMonth = now()->endOfMonth()->toDateString();

        $tripsToday = Trip::whereDate('date', $today)->count();
        $tripsThisMonth = Trip::whereBetween('date', [$startOfMonth, $endOfMonth])->count();
        $billedThisMonth = (float) Trip::whereBetween('date', [$startOfMonth, $endOfMonth])->sum('rate');

        $billingLast6Months = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $total = (float) Trip::whereYear('date', $month->year)
                ->whereMonth('date', $month->month)
                ->sum('rate');
            $billingLast6Months[] = [
                'month' => $month->format('M Y'),
                'total' => $total,
            ];
        }

        return Inertia::render('dashboard', [
            'tripsToday' => $tripsToday,
            'tripsThisMonth' => $tripsThisMonth,
            'billedThisMonth' => $billedThisMonth,
            'billingLast6Months' => $billingLast6Months,
        ]);
    }
}
