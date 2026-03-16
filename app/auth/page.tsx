'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {motion} from "framer-motion";

type AuthFormData = {
    email : string,
    password : string,
    displayName ?: string,
}

export default function AuthPage(){
    const {user, loading , signIn , signUp} = useAuth();
    const router = useRouter();
    const[isSignUp, setIsSignUp] = useState(false);

    const {
        register,
        handleSubmit,
        formState: {isSubmitting},
    } = useForm<AuthFormData>();

    useEffect(()=>{
        if(!loading && user){
            router.replace("/");
        }
    },[user, loading, router]);

    if(loading || user){
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
            </div>
        )
    }

    const onSubmit = async (data: AuthFormData) => {
        try {
            if(isSignUp){
                await signUp(data.email, data.password, data.displayName || "");
                toast.success("Account created successfully");
            }else{
                await signIn(data.email, data.password);
            }
        } catch (e:unknown) {
            toast.error(e instanceof Error ? e.message : "Authentication failed");
        }
    }

    return(
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <motion.div
                initial={{opacity:0, y:16}}
                animate={{opacity:1, y:0}}
                transition={{type:"spring", stiffness:400, damping:30}}
                className="w-full max-w-sm"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isSignUp ? "Create Account" : "Welcome Back"}
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        {isSignUp
                        ? "Start organizing your thoughts"
                        : "Your thoughts clarified."
                        }
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {isSignUp && (
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                                id="displayName"
                                placeholder="Your Name"
                                className="rounded-xl"
                                {...register("displayName")}
                            />
                        </div>
                    )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            className="rounded-xl"
                            {...register("email", { required: true })}
                          />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            minLength={6}
                            required
                            className="rounded-xl"
                            {...register("password", { required: true, minLength: 6 })}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl"
                        >
                            {isSubmitting ? (
                            <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            ) : isSignUp ? (
                            "Create Account"
                            ) : (
                            "Sign In"
                            )}
                        </Button>
        
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-foreground font-medium hover:underline"
                        >
                            {isSignUp ? "Sign in" : "Sign up"}
                        </button>
                </p>



            </motion.div>
        </div>
    )
}