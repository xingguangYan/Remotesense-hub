import { VerifyClient } from "./VerifyClient"

export default function VerifyPage({
  params,
}: {
  params: { token: string }
}) {
  return <VerifyClient token={params.token} />
}
