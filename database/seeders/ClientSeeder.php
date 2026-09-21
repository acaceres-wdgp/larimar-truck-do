<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        $clients = [
            ['name' => 'Imagine SRL',              'kind' => 'Company',    'tax_id' => '130-45781-2', 'contact_name' => 'Niurka Fernández', 'contact_role' => 'Logistics manager', 'contact_phone' => '+1 809 555 0142', 'contact_email' => 'logistica@imagine.do',      'payment_terms' => '30 days',          'credit_limit' => 1500000, 'status' => 'Active',   'client_since' => '2023-04-18'],
            ['name' => 'América Internacional',    'kind' => 'Company',    'tax_id' => '101-88234-7', 'contact_name' => 'Rafael Colón',     'contact_role' => 'Import supervisor',  'contact_phone' => '+1 809 555 0188', 'contact_email' => 'rcolon@americaint.do',       'payment_terms' => '45 days',          'credit_limit' => 2400000, 'status' => 'Active',   'client_since' => '2022-09-02'],
            ['name' => 'Grupo Ramos',              'kind' => 'Company',    'tax_id' => '101-01234-5', 'contact_name' => 'Laura Pimentel',   'contact_role' => 'Supply chain lead',  'contact_phone' => '+1 809 555 0110', 'contact_email' => 'lpimentel@gruporamos.do',    'payment_terms' => '60 days',          'credit_limit' => 5000000, 'status' => 'Active',   'client_since' => '2021-06-30'],
            ['name' => 'Distribuidora Corripio',   'kind' => 'Company',    'tax_id' => '101-00782-1', 'contact_name' => 'Héctor Batista',   'contact_role' => 'Warehouse manager',  'contact_phone' => '+1 809 555 0165', 'contact_email' => 'hbatista@corripio.do',       'payment_terms' => '45 days',          'credit_limit' => 3200000, 'status' => 'Active',   'client_since' => '2022-02-11'],
            ['name' => 'Ferretería Ochoa',         'kind' => 'Company',    'tax_id' => '130-22118-9', 'contact_name' => 'Yanet Ochoa',      'contact_role' => 'Owner',              'contact_phone' => '+1 809 555 0133', 'contact_email' => 'compras@ochoa.com.do',       'payment_terms' => '15 days',          'credit_limit' => 600000, 'status' => 'Active',   'client_since' => '2024-01-22'],
            ['name' => 'Agroindustrial del Cibao', 'kind' => 'Company',    'tax_id' => '131-55420-3', 'contact_name' => 'Manuel Reyes',     'contact_role' => 'Operations',         'contact_phone' => '+1 809 555 0151', 'contact_email' => 'mreyes@agrocibao.do',        'payment_terms' => '30 days',          'credit_limit' => 1800000, 'status' => 'Active',   'client_since' => '2023-11-07'],
            ['name' => 'Industria Blanca SRL',     'kind' => 'Company',    'tax_id' => '130-99001-4', 'contact_name' => 'Sarah Nolasco',    'contact_role' => 'Export analyst',     'contact_phone' => '+1 809 555 0174', 'contact_email' => 'snolasco@blanca.do',         'payment_terms' => '30 days',          'credit_limit' => 1200000, 'status' => 'Active',   'client_since' => '2024-05-16'],
            ['name' => 'Tabacalera del Norte',     'kind' => 'Company',    'tax_id' => '131-10456-8', 'contact_name' => 'Jorge Cabrera',    'contact_role' => 'Export manager',     'contact_phone' => '+1 809 555 0107', 'contact_email' => 'jcabrera@tabanorte.do',      'payment_terms' => '45 days',          'credit_limit' => 2000000, 'status' => 'Active',   'client_since' => '2022-08-25'],
            ['name' => 'Cementos Cibao',           'kind' => 'Company',    'tax_id' => '101-44120-6', 'contact_name' => 'Iván Polanco',     'contact_role' => 'Dispatch',           'contact_phone' => '+1 809 555 0119', 'contact_email' => 'ipolanco@cemcibao.do',       'payment_terms' => '60 days',          'credit_limit' => 4000000, 'status' => 'Inactive', 'client_since' => '2021-10-04'],
            ['name' => 'Ramón Alberto Núñez',      'kind' => 'Individual', 'tax_id' => '031-0456789-1', 'contact_name' => 'Ramón A. Núñez', 'contact_role' => 'Owner',             'contact_phone' => '+1 809 555 0196', 'contact_email' => 'ranunez@gmail.com',          'payment_terms' => 'Cash on delivery', 'credit_limit' => 250000, 'status' => 'Active',   'client_since' => '2025-03-09'],
        ];

        foreach ($clients as $data) {
            Client::create($data);
        }
    }
}
