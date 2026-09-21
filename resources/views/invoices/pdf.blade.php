<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 11px; color: #1a2a2e; background: #fff; padding: 40px; }

.header { display: table; width: 100%; margin-bottom: 40px; }
.header-left { display: table-cell; width: 50%; vertical-align: top; }
.header-right { display: table-cell; width: 50%; vertical-align: top; text-align: right; }

.company-name { font-size: 26px; font-weight: bold; color: #1a4e57; letter-spacing: -0.5px; }
.company-tagline { font-size: 10px; color: #5e7a80; margin-top: 2px; }

.invoice-title { font-size: 32px; font-weight: bold; color: #1a4e57; text-transform: uppercase; letter-spacing: 2px; }
.invoice-number { font-size: 14px; color: #3d5f66; margin-top: 4px; }

.meta-table { width: 100%; margin-bottom: 32px; border-collapse: collapse; }
.meta-left { width: 50%; vertical-align: top; }
.meta-right { width: 50%; vertical-align: top; text-align: right; }
.section-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #7e9aa0; margin-bottom: 4px; }
.section-value { font-size: 12px; color: #123238; font-weight: 600; }
.section-sub { font-size: 10px; color: #5e7a80; margin-top: 1px; }

.divider { border: none; border-top: 1px solid #e0ebed; margin: 24px 0; }

table.orders { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
table.orders thead tr { background-color: #1a4e57; }
table.orders thead th { padding: 9px 12px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.8px; color: #ffffff; font-weight: 600; text-align: left; }
table.orders thead th:last-child { text-align: right; }
table.orders tbody tr { border-bottom: 1px solid #eff5f6; }
table.orders tbody tr:nth-child(even) { background-color: #f8fbfb; }
table.orders tbody td { padding: 9px 12px; font-size: 10.5px; color: #123238; vertical-align: middle; }
table.orders tbody td:last-child { text-align: right; font-weight: 600; }
.type-chip { display: inline-block; padding: 2px 7px; border-radius: 20px; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.type-import { background: #eaf2fa; color: #2c4e72; }
.type-export { background: #e6f4ec; color: #1f5c3d; }

.totals-table { width: 100%; border-collapse: collapse; }
.totals-row td { padding: 5px 12px; font-size: 11px; }
.totals-row td:first-child { color: #5e7a80; text-align: right; }
.totals-row td:last-child { text-align: right; min-width: 120px; color: #123238; }
.totals-total td { border-top: 2px solid #1a4e57; padding-top: 10px; padding-bottom: 10px; }
.totals-total td:first-child { font-size: 13px; font-weight: 700; color: #1a4e57; }
.totals-total td:last-child { font-size: 16px; font-weight: 700; color: #1a4e57; }

.footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e0ebed; display: table; width: 100%; }
.footer-left { display: table-cell; width: 60%; font-size: 9px; color: #7e9aa0; }
.footer-right { display: table-cell; width: 40%; text-align: right; font-size: 9px; color: #7e9aa0; }
.payment-box { background: #f2f7f8; border: 1px solid #e0ebed; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px; }
.payment-box-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #7e9aa0; margin-bottom: 6px; }
.payment-terms-value { font-size: 13px; font-weight: 700; color: #1a4e57; }
.payment-due { font-size: 10px; color: #3d5f66; margin-top: 2px; }
</style>
</head>
<body>

<!-- Header -->
<div class="header">
  <div class="header-left">
    <div class="company-name">LarimarTruck</div>
    <div class="company-tagline">Transportation Management · Dominican Republic</div>
  </div>
  <div class="header-right">
    <div class="invoice-title">Invoice</div>
    <div class="invoice-number">{{ $invoice->invoice_number }}</div>
  </div>
</div>

<!-- Meta info -->
<table class="meta-table">
  <tr>
    <td class="meta-left">
      <div class="section-label">Bill To</div>
      <div class="section-value">{{ $invoice->client }}</div>
      @if($invoice->clientModel)
        @if($invoice->clientModel->contact_email)
          <div class="section-sub">{{ $invoice->clientModel->contact_email }}</div>
        @endif
        @if($invoice->clientModel->contact_phone)
          <div class="section-sub">{{ $invoice->clientModel->contact_phone }}</div>
        @endif
        @if($invoice->clientModel->tax_id)
          <div class="section-sub" style="margin-top:4px;font-size:9px;color:#7e9aa0;">RNC / Tax ID: {{ $invoice->clientModel->tax_id }}</div>
        @endif
      @endif
    </td>
    <td class="meta-right">
      <div style="margin-bottom:12px;">
        <div class="section-label">Issue Date</div>
        <div class="section-value">{{ $invoice->issued_at?->format('F j, Y') }}</div>
      </div>
      <div style="margin-bottom:12px;">
        <div class="section-label">Due Date</div>
        <div class="section-value">{{ $invoice->due_date?->format('F j, Y') }}</div>
      </div>
      <div>
        <div class="section-label">Payment Terms</div>
        <div class="section-value">{{ strtoupper($invoice->payment_terms) }}</div>
      </div>
    </td>
  </tr>
</table>

<hr class="divider">

<!-- Orders table -->
<table class="orders">
  <thead>
    <tr>
      <th>Order #</th>
      <th>Date</th>
      <th>Service</th>
      <th>Route</th>
      <th>Carrier</th>
      <th style="text-align:right;">Amount</th>
    </tr>
  </thead>
  <tbody>
    @foreach($invoice->orders as $order)
    <tr>
      <td style="font-weight:600;color:#1a4e57;">{{ $order->trip?->order_number ?? "ORD-{$order->id}" }}</td>
      <td style="color:#5e7a80;">{{ $order->date?->format('M j, Y') }}</td>
      <td>
        @if($order->trip?->type)
          <span class="type-chip {{ $order->trip->type === 'import' ? 'type-import' : 'type-export' }}">
            {{ ucfirst($order->trip->type) }}
          </span>
        @endif
      </td>
      <td>{{ $order->trip?->from_location }} → {{ $order->trip?->to_location }}</td>
      <td style="color:#5e7a80;">{{ $order->trip?->line ?? '—' }}</td>
      <td>RD${{ number_format($order->trip?->rate ?? 0, 2) }}</td>
    </tr>
    @endforeach
  </tbody>
</table>

<!-- Totals -->
<table style="width:100%;border-collapse:collapse;">
  <tr>
    <td style="width:60%;"></td>
    <td style="width:40%;">
      <table class="totals-table">
        <tr class="totals-row">
          <td>Subtotal</td>
          <td>RD${{ number_format($invoice->subtotal, 2) }}</td>
        </tr>
        <tr class="totals-row">
          <td>ITBIS ({{ number_format($invoice->tax_rate, 0) }}%)</td>
          <td>RD${{ number_format($invoice->tax_amount, 2) }}</td>
        </tr>
        <tr class="totals-row totals-total">
          <td>Total Due</td>
          <td>RD${{ number_format($invoice->total, 2) }}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

@if($invoice->notes)
<div style="margin-top:24px;padding:12px 16px;background:#f8fbfb;border:1px solid #e0ebed;border-radius:6px;">
  <div class="section-label" style="margin-bottom:4px;">Notes</div>
  <div style="font-size:10.5px;color:#3d5f66;">{{ $invoice->notes }}</div>
</div>
@endif

<!-- Footer -->
<div class="footer">
  <div class="footer-left">
    Thank you for your business.<br>
    Please reference invoice {{ $invoice->invoice_number }} on your payment.
  </div>
  <div class="footer-right">
    LarimarTruck · Transportation Management<br>
    Generated {{ now()->format('M j, Y') }}
  </div>
</div>

</body>
</html>
