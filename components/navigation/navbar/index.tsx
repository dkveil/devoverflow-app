import Image from 'next/image';
import Link from 'next/link';

import { ThemeToggler } from './theme-toggler';

export default function Navbar() {
  return (
    <nav className="flex-between background-light900_dark200 gap-5 w-full z-50 p-6 sm:px-12  fixed shadow-light-300 dark:shadow-none">
      <Link href="/" className="flex-center gap-2">
        <Image src="/images/site-logo.svg" alt="DevOverflow Logo" width={23} height={23} />
        <p className="h3-semibold font-space-grotesk text-dark-100 dark:text-light-900 max-sm:hidden uppercase">
          Dev
          <span className="text-primary-500">
            Overflow
          </span>
        </p>
      </Link>

      <span>
        search
      </span>

      <div className="flex-between gap-5">
        <ThemeToggler />
      </div>
    </nav>
  );
}
