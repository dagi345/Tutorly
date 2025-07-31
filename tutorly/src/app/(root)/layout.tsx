import StreamVideoProvider from "@/components/providers/StreamProvider";

export default function secondLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      
      <main>
        <StreamVideoProvider>

        {children}
        </StreamVideoProvider>
    </main>
    </>
  );
}