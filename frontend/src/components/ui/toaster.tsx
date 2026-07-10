import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      richColors
      position="top-right"
      toastOptions={{
        className: "!rounded-2xl",
      }}
    />
  );
}
