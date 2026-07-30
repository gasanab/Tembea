import { ResetPasswordForm } from "./ResetPasswordForm";

type Props = {
  searchParams: { token?: string | string[] };
};

export default function ResetPasswordPage({ searchParams }: Props) {
  const token = Array.isArray(searchParams.token) ? searchParams.token[0] : searchParams.token;
  return <ResetPasswordForm token={token || ""} />;
}
