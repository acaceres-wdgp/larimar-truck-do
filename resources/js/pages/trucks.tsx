import { Head } from '@inertiajs/react';

export default function Trucks() {
    return (
        <>
            <Head title="Camiones" />
            <div
                className="rounded-[14px] p-8 text-center text-sm"
                style={{
                    background: '#FFFFFF',
                    border: '1px solid #E0EBED',
                    color: '#5E7A80',
                }}
            >
                Camiones — próximamente.
            </div>
        </>
    );
}
