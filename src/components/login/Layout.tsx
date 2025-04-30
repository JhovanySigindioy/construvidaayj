import type { ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 fade-in">
            {/* Probando con max-w-4xl */}
            <div className="h-[80vh] w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 mx-2">
                {children}
            </div>
        </div>
    );
}