import Image from 'next/image';

import SocialAuthForm from '@/components/forms/social-auth-form';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-center min-h-screen bg-auth-light dark:bg-auth-dark bg-cover bg-center bg-no-repeat px-4 py-10 mx-auto">
      <section className="light-border background-light800_dark200 shadow-light100_dark100 min-w-full border px-4 py-10 shadow-md sm:min-w-[520px] sm:px-8">
        <div className="flex-between gap-2">
          <div className="space-y-2">
            <h1 className="h2-bold font-space-grotesk text-dark100_light900">Join DevOverflow</h1>
            <p className="body-regular text-dark500_light400">To connect with developers and share your knowledge.</p>
          </div>
          <Image src="/images/site-logo.svg" alt="DevOverflow Logo" width={50} height={50} className="object-contain" />
        </div>

        {children}

        <SocialAuthForm />
      </section>
    </main>
  );
}
