import { auth } from '@/auth';
import { Button } from '@/components/ui/button';

import { handleLogout } from '../actions/logout';

export default async function Home() {
  const session = await auth();

  if (!session) {
    return (
      <div>

      </div>
    );
  }

  return (
    <>
      <form className="px-10 pt-[100px]" action={handleLogout}>
        <Button type="submit">Log out</Button>
      </form>
    </>
  );
}
