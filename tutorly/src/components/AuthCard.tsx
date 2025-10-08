// src/components/AuthCard.tsx
export const AuthCard = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full max-w-md mx-auto">
    <div className="bg-stone-50 border border-stone-200 rounded-2xl shadow-2xl p-8 sm:p-10">
      {children}
    </div>
  </div>
);