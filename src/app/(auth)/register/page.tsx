"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocker } from "@/hooks/use-locker";
import { useToast } from "@/hooks/use-toast";
import { LockerLeaseLogo } from "@/components/icons";
import { Loader2 } from "lucide-react";

const DUMMY_OTP = "123456";

const formSchema = z.object({
  studentId: z.string().min(1, { message: "Student ID is required." }),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const otpSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits." }),
});

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useLocker();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { studentId: "", name: "", email: "", password: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  async function onRegisterSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setFormData(values);
      setStep(2);
      setIsLoading(false);
      toast({
        title: "OTP Sent!",
        description: `A verification code has been sent to ${values.email}. (Hint: it's ${DUMMY_OTP})`,
      });
    }, 1000);
  }

  async function onOtpSubmit(values: z.infer<typeof otpSchema>) {
    setIsLoading(true);
    if (values.otp !== DUMMY_OTP) {
      toast({
        title: "Invalid OTP",
        description: "The code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!formData) {
        // Should not happen
        setIsLoading(false);
        setStep(1);
        return;
    }

    try {
      await register({
        id: formData.studentId,
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      toast({ title: "Registration Successful", description: "Your account has been created." });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      setIsLoading(false);
      setStep(1); // Go back to details form
    }
  }

  return (
    <Card className="w-full max-w-sm">
      {step === 1 && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onRegisterSubmit)}>
            <CardHeader className="text-center">
              <LockerLeaseLogo className="mx-auto h-12 w-12 text-primary" />
              <CardTitle className="mt-2">Create an Account</CardTitle>
              <CardDescription>Enter your details to get started.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <FormField name="studentId" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Student ID</FormLabel><FormControl><Input placeholder="e.g., S12345" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="student@example.com" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField name="password" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">Sign In</Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      )}

      {step === 2 && (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)}>
            <CardHeader className="text-center">
                <CardTitle>Verify Your Email</CardTitle>
                <CardDescription>Enter the 6-digit code sent to your email.</CardDescription>
            </CardHeader>
            <CardContent>
                <FormField name="otp" control={otpForm.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                            <Input placeholder="123456" {...field} maxLength={6} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify Account
                </Button>
                <Button variant="link" size="sm" onClick={() => setStep(1)} disabled={isLoading}>Back to details</Button>
            </CardFooter>
          </form>
        </Form>
      )}
    </Card>
  );
}
