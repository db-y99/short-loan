import { Suspense } from "react";
import LoginForm from "@/components/login/login-form.client";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
