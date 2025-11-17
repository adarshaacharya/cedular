type Props = {
  if: boolean;
  children: React.ReactNode;
};

export function Show({ if: conditional, children }: Props) {
  if (!conditional) return null;

  return <>{children}</>;
}
