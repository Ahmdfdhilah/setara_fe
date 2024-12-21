import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FiLock, FiUser, FiArrowRight } from "react-icons/fi";
import axios, { AxiosError } from 'axios';
import AOS from 'aos';
import "aos/dist/aos.css";
import { Notification, AlertType } from '../components/Alert'
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import bg from '../assets/bg-login.jpg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface FormData {
    username: string;
    password: string;
}

interface NotificationState {
    show: boolean;
    type: AlertType;
    message: string;
}

const LoginPage: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        username: '',
        password: ''
    });

    const [notification, setNotification] = useState<NotificationState>({
        show: false,
        type: 'info',
        message: ''
    });
    const navigate = useNavigate();
    const { login } = useAuth();


    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            setNotification({
                show: true,
                type: 'error',
                message: 'Please fill in all fields'
            });
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/api/users/login', formData);
            const { access_token } = response.data;

            // Use the auth context to login
            login(access_token, formData.username);

            setNotification({
                show: true,
                type: 'success',
                message: 'Login successful!'
            });

            // Redirect to protected route (e.g., dashboard)
            navigate('/admin/manage/map');
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            setNotification({
                show: true,
                type: 'error',
                message: axiosError.response?.data?.message || 'Login failed. Please try again.'
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <>
            <Navbar />
            <div className="relative w-full min-h-screen flex items-center bg-gray-50">
                <Notification
                    show={notification.show}
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification({ ...notification, show: false })}
                />

                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Form Section */}
                    <div
                        className="w-full max-w-md mx-auto space-y-8"
                        data-aos="fade-right"
                        data-aos-delay="100"
                    >
                        <Card className="" >
                            <div className="space-y-6">
                                <div className="space-y-2 text-center">
                                    <h1 className="text-3xl font-bold tracking-tight text-gray-800">
                                        Welcome Back
                                    </h1>
                                    <p className="text-gray-500">
                                        Enter your credentials to access your account
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <div className="relative">
                                            <FiUser className="absolute left-3 top-3 text-gray-400" />
                                            <Input
                                                id="username"
                                                name="username"
                                                placeholder="Enter your username"
                                                className="pl-10"
                                                onChange={handleChange}
                                                value={formData.username}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <FiLock className="absolute left-3 top-3 text-gray-400" />
                                            <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                placeholder="Enter your password"
                                                className="pl-10"
                                                onChange={handleChange}
                                                value={formData.password}
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full">
                                        Sign In
                                        <FiArrowRight className="ml-2" />
                                    </Button>
                                </form>
                            </div>
                        </Card>
                    </div>

                    {/* Image Section */}
                    <div
                        className="hidden lg:block overflow-hidden"
                        data-aos="fade-left"
                        data-aos-delay="200"
                    >
                        <div className="relative">
                            <img
                                src={bg}
                                className="min-h-[30vh] object-contain min-w-[50vw]"
                                alt="Mobile App Screenshot"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default LoginPage;