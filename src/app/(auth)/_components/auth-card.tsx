import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AuthCard({
  children,
  title,
  description,
  footer,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="w-full max-w-md relative z-10 border shadow-2xl backdrop-blur-xl bg-card/50">
      <CardHeader className="space-y-3 text-center">
        <CardTitle className="text-3xl font-bold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent>{children}</CardContent>

      {footer && (
        <CardFooter className="flex flex-col space-y-4">{footer}</CardFooter>
      )}
    </Card>
  );
}
