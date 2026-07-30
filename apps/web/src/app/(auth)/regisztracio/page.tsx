import { RegisterForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Regisztráció" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  return <RegisterForm from={from} />;
}
