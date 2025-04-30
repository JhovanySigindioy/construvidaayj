export default function LoginImage() {
    return (
        <div className="relative hidden md:block">
            <img
                src="/fondoLogin.jpg"
                alt="Login Background"
                className="w-full h-[85vh] brightness-40 rounded-l-lg" // Se agregó rounded-l-xl para redondear el lado izquierdo
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-white rounded-l-lg">
                <h1 className="text-4xl font-bold">Construvida AYJ</h1>
                <p className="text-center mt-4">
                    En Construvida AYJ nos especializamos en brindarte asesoría y acompañamiento en el proceso de afiliación al sistema de seguridad social en Colombia, incluyendo salud, pensión, ARL y caja de compensación.
                </p>
            </div>
        </div>
    );
}
