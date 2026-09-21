<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Payroll Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 11px;
            color: #1a1a1a;
            background: #ffffff;
            padding: 32px 36px;
        }

        /* Header */
        .header {
            display: table;
            width: 100%;
            margin-bottom: 24px;
            border-bottom: 2px solid #1a4e57;
            padding-bottom: 16px;
        }
        .header-left  { display: table-cell; width: 50%; vertical-align: middle; }
        .header-right { display: table-cell; width: 50%; vertical-align: middle; text-align: right; }
        .company-name {
            font-size: 22px;
            font-weight: 700;
            color: #1a4e57;
            letter-spacing: -0.3px;
        }
        .company-sub {
            font-size: 10px;
            color: #5E7A80;
            margin-top: 2px;
        }
        .report-title {
            font-size: 14px;
            font-weight: 700;
            color: #123238;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .report-sub {
            font-size: 10px;
            color: #5E7A80;
            margin-top: 3px;
        }

        /* Meta row */
        .meta-row {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        .meta-cell { display: table-cell; width: 33.33%; vertical-align: top; }
        .meta-label { font-size: 9px; color: #5E7A80; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
        .meta-value { font-size: 12px; font-weight: 600; color: #123238; }

        /* Status badge */
        .badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .badge-draft    { background: #F0EFEF; color: #595959; }
        .badge-approved { background: #EAF2FA; color: #2C4E72; }
        .badge-paid     { background: #E6F4EC; color: #1F5C3D; }

        /* Summary box */
        .summary-box {
            display: table;
            width: 100%;
            background: #f0f7f8;
            border: 1px solid #cde2e6;
            border-radius: 6px;
            padding: 14px 18px;
            margin-bottom: 24px;
        }
        .summary-cell { display: table-cell; width: 33.33%; text-align: center; vertical-align: middle; }
        .summary-cell + .summary-cell { border-left: 1px solid #cde2e6; }
        .summary-num   { font-size: 20px; font-weight: 700; color: #1a4e57; }
        .summary-label { font-size: 9px; color: #5E7A80; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }

        /* Driver section */
        .driver-section { margin-bottom: 20px; }
        .driver-header {
            display: table;
            width: 100%;
            background: #1a4e57;
            color: #ffffff;
            padding: 8px 12px;
            border-radius: 4px 4px 0 0;
        }
        .driver-header-left  { display: table-cell; width: 60%; font-weight: 700; font-size: 11px; }
        .driver-header-right { display: table-cell; width: 40%; text-align: right; font-size: 10px; }

        /* Tables */
        table { width: 100%; border-collapse: collapse; }
        th {
            background: #f5f9fa;
            color: #5E7A80;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 600;
            padding: 6px 10px;
            text-align: left;
            border-bottom: 1px solid #E0EBED;
        }
        th.right { text-align: right; }
        td {
            padding: 6px 10px;
            border-bottom: 1px solid #f0f4f5;
            font-size: 10px;
            color: #2c2c2c;
        }
        td.right { text-align: right; }
        td.muted  { color: #5E7A80; }

        /* Driver summary row */
        .driver-summary-row {
            display: table;
            width: 100%;
            background: #f5f9fa;
            border-top: 1px solid #E0EBED;
            border-bottom: 1px solid #E0EBED;
            padding: 7px 10px;
        }
        .dsr-cell { display: table-cell; font-size: 10px; }
        .dsr-label { color: #5E7A80; font-weight: 600; }
        .dsr-value { text-align: right; font-weight: 700; color: #123238; }

        /* Grand total */
        .grand-total {
            display: table;
            width: 100%;
            background: #1a4e57;
            color: #ffffff;
            padding: 10px 12px;
            margin-top: 8px;
            border-radius: 4px;
        }
        .gt-cell { display: table-cell; }
        .gt-left  { font-size: 12px; font-weight: 700; }
        .gt-right { text-align: right; font-size: 16px; font-weight: 700; }

        /* Signature area */
        .signature-area {
            display: table;
            width: 100%;
            margin-top: 40px;
            border-top: 1px solid #E0EBED;
            padding-top: 20px;
        }
        .sig-cell { display: table-cell; width: 50%; padding-right: 30px; }
        .sig-line  { border-bottom: 1px solid #1a4e57; margin-bottom: 6px; height: 28px; }
        .sig-label { font-size: 10px; color: #5E7A80; }

        /* Footer */
        .footer {
            margin-top: 24px;
            text-align: center;
            font-size: 9px;
            color: #9DB3B8;
            border-top: 1px solid #E0EBED;
            padding-top: 10px;
        }
    </style>
</head>
<body>

    {{-- Header --}}
    <div class="header">
        <div class="header-left">
            <div class="company-name">LarimarTruck</div>
            <div class="company-sub">Transportation Management System</div>
        </div>
        <div class="header-right">
            <div class="report-title">Payroll Report</div>
            <div class="report-sub">Generated {{ now()->format('M j, Y') }}</div>
        </div>
    </div>

    {{-- Meta --}}
    <div class="meta-row">
        <div class="meta-cell">
            <div class="meta-label">Period</div>
            <div class="meta-value">
                {{ $run->period_start->format('M j') }} – {{ $run->period_end->format('M j, Y') }}
            </div>
        </div>
        <div class="meta-cell">
            <div class="meta-label">Status</div>
            <div class="meta-value">
                <span class="badge badge-{{ $run->status }}">{{ ucfirst($run->status) }}</span>
            </div>
        </div>
        <div class="meta-cell" style="text-align:right">
            <div class="meta-label">Run ID</div>
            <div class="meta-value">#{{ str_pad($run->id, 5, '0', STR_PAD_LEFT) }}</div>
        </div>
    </div>

    {{-- Summary box --}}
    <div class="summary-box">
        <div class="summary-cell">
            <div class="summary-num">{{ $run->items->count() }}</div>
            <div class="summary-label">Drivers</div>
        </div>
        <div class="summary-cell">
            <div class="summary-num">{{ $run->items->sum('trips_count') }}</div>
            <div class="summary-label">Total Trips</div>
        </div>
        <div class="summary-cell">
            <div class="summary-num">RD${{ number_format($run->total_amount, 0) }}</div>
            <div class="summary-label">Total Payout</div>
        </div>
    </div>

    {{-- Driver sections --}}
    @foreach($run->items as $item)
    <div class="driver-section">
        <div class="driver-header">
            <div class="driver-header-left">{{ $item->driver_name }}</div>
            <div class="driver-header-right">{{ $item->trips_count }} {{ Str::plural('trip', $item->trips_count) }} &nbsp;|&nbsp; Net: RD${{ number_format($item->net_pay, 0) }}</div>
        </div>

        {{-- Trips sub-table --}}
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Route</th>
                    <th class="right">Rate (RD$)</th>
                    <th class="right">Driver Pay (RD$)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($item->trips as $trip)
                <tr>
                    <td class="muted">{{ $trip->date?->format('M j, Y') }}</td>
                    <td>{{ $trip->client }}</td>
                    <td class="muted">{{ $trip->from_location }} → {{ $trip->to_location }}</td>
                    <td class="right">{{ number_format($trip->rate ?? 0, 0) }}</td>
                    <td class="right" style="font-weight:600">{{ number_format($trip->driver_pay ?? 0, 0) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        {{-- Driver subtotals --}}
        <div class="driver-summary-row">
            <div class="dsr-cell dsr-label" style="width:40%">Subtotal</div>
            <div class="dsr-cell" style="width:20%; text-align:right; color:#5E7A80; font-size:10px">Gross: RD${{ number_format($item->gross_pay, 0) }}</div>
            <div class="dsr-cell" style="width:20%; text-align:right; color:#5E7A80; font-size:10px">Deductions: RD${{ number_format($item->deductions, 0) }}</div>
            <div class="dsr-cell dsr-value" style="width:20%">Net: RD${{ number_format($item->net_pay, 0) }}</div>
        </div>
    </div>
    @endforeach

    {{-- Grand total --}}
    <div class="grand-total">
        <div class="gt-cell gt-left">TOTAL PAYROLL PAYOUT</div>
        <div class="gt-cell gt-right">RD${{ number_format($run->total_amount, 0) }}</div>
    </div>

    {{-- Notes --}}
    @if($run->notes)
    <div style="margin-top:16px; padding:10px 14px; background:#f9fafb; border:1px solid #E0EBED; border-radius:4px; font-size:10px; color:#3D5F66;">
        <strong>Notes:</strong> {{ $run->notes }}
    </div>
    @endif

    {{-- Signature area --}}
    <div class="signature-area">
        <div class="sig-cell">
            <div class="sig-line"></div>
            <div class="sig-label">Approved by</div>
        </div>
        <div class="sig-cell">
            <div class="sig-line"></div>
            <div class="sig-label">Date</div>
        </div>
    </div>

    {{-- Footer --}}
    <div class="footer">
        LarimarTruck TMS &bull; Larimar Suite &bull; Confidential Payroll Document
    </div>

</body>
</html>
