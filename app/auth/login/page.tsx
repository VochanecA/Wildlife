export const metadata = {
  title: "Login",
  description: "Sign in to access the Wildlife Management system",
}

export const viewport = {
  themeColor: "#ffffff",
}

import LoginForm from "./login-form"

export default function LoginPage() {
  return <LoginForm />
}
