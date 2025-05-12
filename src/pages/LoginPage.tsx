import LoginForm from "../components/login/LoginForm";
import LoginImage from "../components/login/LoginImage";


export default function LoginPage() {

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-100 fade-in py-10">
                <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-2 mx-2">
                    <LoginImage />
                    <LoginForm />
                   
                </div>
            </div>
          
        </>
    );
};
