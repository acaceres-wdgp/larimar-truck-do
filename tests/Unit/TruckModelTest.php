<?php

namespace Tests\Unit;

use App\Models\Truck;
use PHPUnit\Framework\TestCase;

class TruckModelTest extends TestCase
{
    public function test_status_label_available(): void
    {
        $truck = new Truck(['status' => 'available']);
        $this->assertSame('Available', $truck->status_label);
    }

    public function test_status_label_on_trip(): void
    {
        $truck = new Truck(['status' => 'on_trip']);
        $this->assertSame('On trip', $truck->status_label);
    }

    public function test_status_label_in_maintenance(): void
    {
        $truck = new Truck(['status' => 'in_maintenance']);
        $this->assertSame('In maintenance', $truck->status_label);
    }

    public function test_status_label_out_of_service(): void
    {
        $truck = new Truck(['status' => 'out_of_service']);
        $this->assertSame('Out of service', $truck->status_label);
    }

    public function test_status_label_unknown_falls_back_to_raw_value(): void
    {
        $truck = new Truck(['status' => 'unknown_status']);
        $this->assertSame('unknown_status', $truck->status_label);
    }

    public function test_statuses_constant_contains_expected_values(): void
    {
        $this->assertContains('available', Truck::STATUSES);
        $this->assertContains('on_trip', Truck::STATUSES);
        $this->assertContains('in_maintenance', Truck::STATUSES);
        $this->assertContains('out_of_service', Truck::STATUSES);
    }
}
