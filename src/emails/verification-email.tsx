import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type VerificationEmailProps = {
  name?: string | null;
  verificationUrl: string;
};

export function VerificationEmail({
  name,
  verificationUrl,
}: VerificationEmailProps) {
  const firstName = name?.trim()?.split(" ")[0] ?? "there";

  return (
    <Html>
      <Head />
      <Preview>Verify your Cedular account email</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Verify your email</Heading>
          <Text style={text}>Hi {firstName},</Text>
          <Text style={text}>
            Please verify your email address to activate your Cedular account.
          </Text>
          <Section style={buttonSection}>
            <Button href={verificationUrl} style={button}>
              Verify email
            </Button>
          </Section>
          <Text style={mutedText}>
            If the button does not work, use this link:
          </Text>
          <Link href={verificationUrl} style={link}>
            {verificationUrl}
          </Link>
          <Text style={mutedText}>Please do not reply to this email.</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "Arial, sans-serif",
  padding: "20px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e6ebf1",
  borderRadius: "8px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "28px",
};

const heading = {
  color: "#111827",
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: "1.3",
  margin: "0 0 16px",
};

const text = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 12px",
};

const buttonSection = {
  margin: "22px 0",
};

const button = {
  backgroundColor: "#111827",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
  padding: "12px 20px",
  textDecoration: "none",
};

const mutedText = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0 0 6px",
};

const link = {
  color: "#2563eb",
  fontSize: "12px",
  wordBreak: "break-all" as const,
};
