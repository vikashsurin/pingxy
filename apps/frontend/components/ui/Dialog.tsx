interface DialogProps {
  children: React.ReactNode;
}

export default function Dialog({ children }: DialogProps) {
  return (
    <div className="fixed inset-0  flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-xl border">{children}</div>
    </div>
  );
}
