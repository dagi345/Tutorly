import {TutorNav}  from "../components/TutorNav";
export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TutorNav />
      <main>{children}</main>
    </>
  );
}