import { LoginForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Belépés" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  return <LoginForm from={from} />;
}
