export const dynamic = "force-static";

export function GET() {
  return Response.json({ status: "ok", service: "ipaymu-docs" });
}
